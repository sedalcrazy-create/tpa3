<?php

namespace App\Services\Pricing;

use App\Models\Employee;
use App\Models\InvoiceItem;
use App\Models\Item;
use App\Models\ItemPriceCondition;
use App\Models\ItemPriceConditionRestriction;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ConflictChecker
{
    public function __construct(
        private readonly UsageCounter $usageCounter
    ) {}

    /**
     * Check all restrictions for a condition and return violations.
     *
     * @return Collection<int, array{type: string, message: string, restriction_id: int}>
     */
    public function check(
        ItemPriceCondition $condition,
        Item $item,
        Employee $employee,
        ?int $bodyPartId = null,
        ?Carbon $date = null
    ): Collection {
        $date = $date ?? Carbon::today();
        $violations = collect();

        foreach ($condition->restrictions as $restriction) {
            if (!$restriction->is_active) {
                continue;
            }

            $violation = match ($restriction->restriction_type) {
                'conflict_item' => $this->checkConflictItem($restriction, $employee, $date),
                'max_per_body_part' => $this->checkBodyPartLimit($restriction, $item, $employee, $bodyPartId, $date),
                'required_diagnosis' => $this->checkRequiredDiagnosis($restriction, $employee),
                'max_total_usage' => $this->checkTotalUsageLimit($restriction, $item, $employee, $date),
                default => null,
            };

            if ($violation) {
                $violations->push($violation);
            }
        }

        return $violations;
    }

    /**
     * Check if a conflicting item has been used (e.g. extraction conflicts with filling).
     */
    private function checkConflictItem(
        ItemPriceConditionRestriction $restriction,
        Employee $employee,
        Carbon $date
    ): ?array {
        if (!$restriction->conflict_item_id) {
            return null;
        }

        $periodType = $restriction->period_type ?? 'yearly';
        $conflictUsage = $this->usageCounter->countUsage(
            $employee,
            $restriction->conflictItem,
            $periodType,
            $date
        );

        if ($conflictUsage > 0) {
            return [
                'type' => 'conflict_item',
                'message' => "این خدمت با خدمت «{$restriction->conflictItem->name}» تداخل دارد.",
                'restriction_id' => $restriction->id,
            ];
        }

        return null;
    }

    /**
     * Check body part usage limit (e.g. max 1 filling per tooth per year).
     */
    private function checkBodyPartLimit(
        ItemPriceConditionRestriction $restriction,
        Item $item,
        Employee $employee,
        ?int $bodyPartId,
        Carbon $date
    ): ?array {
        if (!$bodyPartId || !$restriction->max_count) {
            return null;
        }

        $periodType = $restriction->period_type ?? 'yearly';
        $usage = $this->usageCounter->countBodyPartUsage(
            $employee,
            $item,
            $bodyPartId,
            $periodType,
            $date
        );

        if ($usage >= $restriction->max_count) {
            return [
                'type' => 'max_per_body_part',
                'message' => "سقف استفاده از این خدمت برای این عضو بدن ({$restriction->max_count} بار در {$this->periodLabel($periodType)}) تکمیل شده است.",
                'restriction_id' => $restriction->id,
            ];
        }

        return null;
    }

    /**
     * Check if employee has a required diagnosis for this item.
     */
    private function checkRequiredDiagnosis(
        ItemPriceConditionRestriction $restriction,
        Employee $employee
    ): ?array {
        $requiredDiagnoses = $restriction->restriction_value ?? [];
        if (empty($requiredDiagnoses)) {
            return null;
        }

        $hasRequiredDiagnosis = $employee->illnesses()
            ->where('is_active', true)
            ->whereIn('illness_id', $requiredDiagnoses)
            ->exists();

        if (!$hasRequiredDiagnosis) {
            return [
                'type' => 'required_diagnosis',
                'message' => 'بیمه‌شده تشخیص لازم برای دریافت این خدمت را ندارد.',
                'restriction_id' => $restriction->id,
            ];
        }

        return null;
    }

    /**
     * Check total usage limit for an item.
     */
    private function checkTotalUsageLimit(
        ItemPriceConditionRestriction $restriction,
        Item $item,
        Employee $employee,
        Carbon $date
    ): ?array {
        if (!$restriction->max_count) {
            return null;
        }

        $periodType = $restriction->period_type ?? 'yearly';
        $usage = $this->usageCounter->countUsage($employee, $item, $periodType, $date);

        if ($usage >= $restriction->max_count) {
            return [
                'type' => 'max_total_usage',
                'message' => "سقف استفاده از این خدمت ({$restriction->max_count} بار در {$this->periodLabel($periodType)}) تکمیل شده است.",
                'restriction_id' => $restriction->id,
            ];
        }

        return null;
    }

    private function periodLabel(string $periodType): string
    {
        return match ($periodType) {
            'daily' => 'روز',
            'weekly' => 'هفته',
            'monthly' => 'ماه',
            'yearly' => 'سال',
            default => 'دوره',
        };
    }
}
