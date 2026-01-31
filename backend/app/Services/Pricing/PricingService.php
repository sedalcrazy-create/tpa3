<?php

namespace App\Services\Pricing;

use App\Models\Employee;
use App\Models\Insurance;
use App\Models\Item;
use App\Models\ItemPrice;
use App\Models\ItemPriceCondition;
use Carbon\Carbon;

class PricingService
{
    public function __construct(
        private readonly ConditionMatcher $conditionMatcher,
        private readonly UsageCounter $usageCounter,
        private readonly ConflictChecker $conflictChecker,
        private readonly GroupChecker $groupChecker,
        private readonly DiscountCalculator $discountCalculator,
        private readonly RuleEngineAdapter $ruleEngine
    ) {}

    /**
     * Calculate pricing for a single invoice item.
     *
     * @return array{
     *   is_covered: bool,
     *   unit_price: float,
     *   total_price: float,
     *   insurance_share: float,
     *   patient_share: float,
     *   coverage_percentage: float,
     *   discount_amount: float,
     *   deduction_amount: float,
     *   deduction_reasons: array,
     *   applied_condition_id: ?int,
     *   warnings: array,
     *   pricing_details: array
     * }
     */
    public function calculate(
        Item $item,
        Employee $employee,
        int $quantity = 1,
        ?int $bodyPartId = null,
        ?float $unitPrice = null,
        ?Carbon $date = null
    ): array {
        $date = $date ?? Carbon::today();
        $warnings = [];
        $deductionReasons = [];
        $deductionAmount = 0;

        // 1. Get item price
        $itemPrice = $this->resolvePrice($item, $unitPrice, $date);
        $resolvedUnitPrice = $itemPrice ? (float) $itemPrice->price : ($unitPrice ?? 0);
        $totalPrice = $resolvedUnitPrice * $quantity;

        // 2. Check if item is covered
        if (!$item->is_covered) {
            return $this->uncoveredResult($resolvedUnitPrice, $totalPrice, $quantity);
        }

        // 3. Match conditions
        $conditions = $this->conditionMatcher->match($item, $employee, $date);

        if ($conditions->isEmpty()) {
            // Use item price default coverage
            return $this->defaultCoverageResult(
                $item, $itemPrice, $resolvedUnitPrice, $totalPrice, $quantity, $employee, $date
            );
        }

        // 4. Pick highest-priority matching condition
        $bestCondition = $conditions->first();

        // 5. Evaluate complex rules via ruler engine
        if (!$this->ruleEngine->evaluate($bestCondition, $employee, $item)) {
            // Rule engine says no, fall back to next condition or default
            $conditions = $conditions->slice(1);
            $bestCondition = $conditions->first();

            if (!$bestCondition) {
                return $this->defaultCoverageResult(
                    $item, $itemPrice, $resolvedUnitPrice, $totalPrice, $quantity, $employee, $date
                );
            }
        }

        // 6. Check waiting period
        if ($bestCondition->waiting_days > 0) {
            $waitingResult = $this->checkWaitingPeriod($employee, $bestCondition);
            if (!$waitingResult['passed']) {
                $warnings[] = $waitingResult['message'];
                return $this->uncoveredResult($resolvedUnitPrice, $totalPrice, $quantity, $warnings);
            }
        }

        // 7. Check period usage limits
        if ($bestCondition->max_per_period) {
            $currentUsage = $this->usageCounter->countUsage(
                $employee, $item, $bestCondition->period_type ?? 'yearly', $date
            );

            if ($currentUsage >= $bestCondition->max_per_period) {
                $deductionReasons[] = 'سقف تعداد مجاز در دوره تکمیل شده است.';
                return $this->uncoveredResult($resolvedUnitPrice, $totalPrice, $quantity, $warnings, $deductionReasons);
            }

            // Limit quantity to remaining allowance
            $remainingAllowance = $bestCondition->max_per_period - $currentUsage;
            if ($quantity > $remainingAllowance) {
                $deductionReasons[] = "فقط {$remainingAllowance} عدد از {$quantity} تحت پوشش است.";
                $quantity = $remainingAllowance;
                $totalPrice = $resolvedUnitPrice * $quantity;
            }
        }

        // 8. Check quantity per prescription limit
        if ($bestCondition->max_quantity_per_prescription && $quantity > $bestCondition->max_quantity_per_prescription) {
            $deductionReasons[] = "حداکثر تعداد مجاز در هر نسخه: {$bestCondition->max_quantity_per_prescription}";
            $quantity = $bestCondition->max_quantity_per_prescription;
            $totalPrice = $resolvedUnitPrice * $quantity;
        }

        // 9. Check conflict restrictions
        $conflicts = $this->conflictChecker->check($bestCondition, $item, $employee, $bodyPartId, $date);
        if ($conflicts->isNotEmpty()) {
            foreach ($conflicts as $conflict) {
                $deductionReasons[] = $conflict['message'];
            }
            return $this->uncoveredResult($resolvedUnitPrice, $resolvedUnitPrice * $quantity, $quantity, $warnings, $deductionReasons);
        }

        // 10. Check group limits
        $groupViolations = $this->groupChecker->check($item, $employee, $date);
        if ($groupViolations->isNotEmpty()) {
            foreach ($groupViolations as $violation) {
                $warnings[] = $violation['message'];
            }
        }

        // 11. Calculate coverage
        $coveragePercentage = (float) $bestCondition->coverage_percentage;
        $patientSharePercentage = (float) $bestCondition->patient_share_percentage;

        // If fixed patient share is set, it takes precedence
        $fixedPatientShare = $bestCondition->fixed_patient_share
            ? (float) $bestCondition->fixed_patient_share * $quantity
            : null;

        $insuranceShare = $totalPrice * ($coveragePercentage / 100);

        // Apply max covered amount
        if ($bestCondition->max_covered_amount) {
            $maxCovered = (float) $bestCondition->max_covered_amount * $quantity;
            $insuranceShare = min($insuranceShare, $maxCovered);
        }

        // 12. Calculate discount
        $discountInfo = $this->discountCalculator->calculate($employee, $item, $quantity, $date);
        $discountAmount = $this->discountCalculator->applyDiscount($totalPrice, $discountInfo);

        // Apply discount to patient share
        $patientShare = $fixedPatientShare ?? ($totalPrice - $insuranceShare);
        $patientShare = max(0, $patientShare - $discountAmount);

        // Recalculate insurance share if discount affected total
        $insuranceShare = $totalPrice - $patientShare - $discountAmount;
        $insuranceShare = max(0, $insuranceShare);

        return [
            'is_covered' => true,
            'unit_price' => $resolvedUnitPrice,
            'total_price' => $totalPrice,
            'insurance_share' => round($insuranceShare, 2),
            'patient_share' => round($patientShare, 2),
            'coverage_percentage' => $coveragePercentage,
            'discount_amount' => round($discountAmount, 2),
            'deduction_amount' => round($deductionAmount, 2),
            'deduction_reasons' => $deductionReasons,
            'applied_condition_id' => $bestCondition->id,
            'warnings' => $warnings,
            'pricing_details' => [
                'condition_code' => $bestCondition->code,
                'condition_name' => $bestCondition->name,
                'original_quantity' => $quantity,
                'max_covered_amount' => $bestCondition->max_covered_amount,
                'patient_share_percentage' => $patientSharePercentage,
                'fixed_patient_share' => $bestCondition->fixed_patient_share,
                'discount_type' => $discountInfo['discount_type'],
                'discount_percentage' => $discountInfo['discount_percentage'],
            ],
        ];
    }

    /**
     * Calculate pricing for multiple invoice items (full invoice).
     */
    public function calculateInvoice(
        array $items,
        Employee $employee,
        ?Carbon $date = null
    ): array {
        $date = $date ?? Carbon::today();
        $results = [];
        $totalAmount = 0;
        $totalInsuranceShare = 0;
        $totalPatientShare = 0;
        $totalDiscount = 0;
        $totalDeduction = 0;

        foreach ($items as $invoiceItem) {
            $item = Item::find($invoiceItem['item_id']);
            if (!$item) {
                continue;
            }

            $result = $this->calculate(
                $item,
                $employee,
                $invoiceItem['quantity'] ?? 1,
                $invoiceItem['body_part_id'] ?? null,
                $invoiceItem['unit_price'] ?? null,
                $date
            );

            $results[] = array_merge($result, ['item_id' => $item->id]);

            $totalAmount += $result['total_price'];
            $totalInsuranceShare += $result['insurance_share'];
            $totalPatientShare += $result['patient_share'];
            $totalDiscount += $result['discount_amount'];
            $totalDeduction += $result['deduction_amount'];
        }

        return [
            'items' => $results,
            'summary' => [
                'total_amount' => round($totalAmount, 2),
                'insurance_share' => round($totalInsuranceShare, 2),
                'patient_share' => round($totalPatientShare, 2),
                'discount_amount' => round($totalDiscount, 2),
                'deduction_amount' => round($totalDeduction, 2),
            ],
        ];
    }

    private function resolvePrice(Item $item, ?float $unitPrice, Carbon $date): ?ItemPrice
    {
        if ($unitPrice !== null) {
            return null; // Price explicitly provided
        }

        return ItemPrice::query()
            ->where('item_id', $item->id)
            ->where('is_active', true)
            ->where('effective_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_to')
                  ->orWhere('effective_to', '>=', $date);
            })
            ->orderByDesc('effective_from')
            ->first();
    }

    private function checkWaitingPeriod(Employee $employee, ItemPriceCondition $condition): array
    {
        $insuranceStartDate = $employee->activeInsurance?->start_date;

        if (!$insuranceStartDate) {
            return ['passed' => false, 'message' => 'بیمه‌نامه فعال یافت نشد.'];
        }

        $daysSinceStart = Carbon::parse($insuranceStartDate)->diffInDays(Carbon::today());

        if ($daysSinceStart < $condition->waiting_days) {
            $remaining = $condition->waiting_days - $daysSinceStart;
            return [
                'passed' => false,
                'message' => "دوره انتظار ({$condition->waiting_days} روز) هنوز تکمیل نشده است. {$remaining} روز باقیمانده.",
            ];
        }

        return ['passed' => true, 'message' => ''];
    }

    private function uncoveredResult(
        float $unitPrice,
        float $totalPrice,
        int $quantity,
        array $warnings = [],
        array $deductionReasons = []
    ): array {
        return [
            'is_covered' => false,
            'unit_price' => $unitPrice,
            'total_price' => $totalPrice,
            'insurance_share' => 0,
            'patient_share' => $totalPrice,
            'coverage_percentage' => 0,
            'discount_amount' => 0,
            'deduction_amount' => $totalPrice,
            'deduction_reasons' => $deductionReasons,
            'applied_condition_id' => null,
            'warnings' => $warnings,
            'pricing_details' => [
                'reason' => 'not_covered',
            ],
        ];
    }

    private function defaultCoverageResult(
        Item $item,
        ?ItemPrice $itemPrice,
        float $unitPrice,
        float $totalPrice,
        int $quantity,
        Employee $employee,
        Carbon $date
    ): array {
        // Use item price default percentages
        $insurancePercentage = $itemPrice ? (float) $itemPrice->insurance_share_percentage : 0;
        $patientPercentage = $itemPrice ? (float) $itemPrice->patient_share_percentage : 100;

        $insuranceShare = $totalPrice * ($insurancePercentage / 100);
        $patientShare = $totalPrice - $insuranceShare;

        // Still apply discounts
        $discountInfo = $this->discountCalculator->calculate($employee, $item, $quantity, $date);
        $discountAmount = $this->discountCalculator->applyDiscount($totalPrice, $discountInfo);
        $patientShare = max(0, $patientShare - $discountAmount);

        return [
            'is_covered' => $insurancePercentage > 0,
            'unit_price' => $unitPrice,
            'total_price' => $totalPrice,
            'insurance_share' => round($insuranceShare, 2),
            'patient_share' => round($patientShare, 2),
            'coverage_percentage' => $insurancePercentage,
            'discount_amount' => round($discountAmount, 2),
            'deduction_amount' => 0,
            'deduction_reasons' => [],
            'applied_condition_id' => null,
            'warnings' => [],
            'pricing_details' => [
                'source' => 'item_price_default',
                'discount_type' => $discountInfo['discount_type'],
            ],
        ];
    }
}
