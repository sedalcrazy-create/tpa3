<?php

namespace App\Services\Pricing;

use App\Models\CecItemDiscount;
use App\Models\Employee;
use App\Models\EmployeeSpecialDiscount;
use App\Models\Item;
use App\Models\SetItemDiscount;
use Carbon\Carbon;

class DiscountCalculator
{
    /**
     * Calculate the best applicable discount from 4 discount types.
     * Priority order:
     * 1. Employee Special Discount (highest priority - individual)
     * 2. CEC Item Discount (custom employee code based)
     * 3. Set Item Discount (item/category/group based)
     * 4. No discount
     *
     * @return array{discount_percentage: float, max_discount_amount: ?float, discount_type: string, discount_source_id: ?int}
     */
    public function calculate(
        Employee $employee,
        Item $item,
        int $quantity = 1,
        ?Carbon $date = null
    ): array {
        $date = $date ?? Carbon::today();

        // 1. Check employee-specific discount (highest priority)
        $employeeDiscount = $this->getEmployeeDiscount($employee, $date);
        if ($employeeDiscount) {
            return [
                'discount_percentage' => (float) $employeeDiscount->discount_percentage,
                'max_discount_amount' => $employeeDiscount->max_discount_amount ? (float) $employeeDiscount->max_discount_amount : null,
                'discount_type' => 'employee_special',
                'discount_source_id' => $employeeDiscount->id,
            ];
        }

        // 2. Check CEC (Custom Employee Code) discount
        $cecDiscount = $this->getCecDiscount($employee, $item, $date);
        if ($cecDiscount) {
            return [
                'discount_percentage' => (float) $cecDiscount->discount_percentage,
                'max_discount_amount' => $cecDiscount->max_discount_amount ? (float) $cecDiscount->max_discount_amount : null,
                'discount_type' => 'cec_item',
                'discount_source_id' => $cecDiscount->id,
            ];
        }

        // 3. Check Set Item discount
        $setDiscount = $this->getSetDiscount($item, $quantity, $date);
        if ($setDiscount) {
            return [
                'discount_percentage' => (float) $setDiscount->discount_percentage,
                'max_discount_amount' => $setDiscount->max_discount_amount ? (float) $setDiscount->max_discount_amount : null,
                'discount_type' => 'set_item',
                'discount_source_id' => $setDiscount->id,
            ];
        }

        // 4. No discount
        return [
            'discount_percentage' => 0,
            'max_discount_amount' => null,
            'discount_type' => 'none',
            'discount_source_id' => null,
        ];
    }

    /**
     * Apply discount to an amount.
     */
    public function applyDiscount(float $amount, array $discountInfo): float
    {
        if ($discountInfo['discount_percentage'] <= 0) {
            return 0;
        }

        $discountAmount = $amount * ($discountInfo['discount_percentage'] / 100);

        if ($discountInfo['max_discount_amount'] !== null) {
            $discountAmount = min($discountAmount, $discountInfo['max_discount_amount']);
        }

        return round($discountAmount, 2);
    }

    private function getEmployeeDiscount(Employee $employee, Carbon $date): ?EmployeeSpecialDiscount
    {
        return EmployeeSpecialDiscount::query()
            ->where('employee_id', $employee->id)
            ->where('is_active', true)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_from')
                  ->orWhere('effective_from', '<=', $date);
            })
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_to')
                  ->orWhere('effective_to', '>=', $date);
            })
            ->orderByDesc('discount_percentage')
            ->first();
    }

    private function getCecDiscount(Employee $employee, Item $item, Carbon $date): ?CecItemDiscount
    {
        if (!$employee->custom_employee_code_id) {
            return null;
        }

        return CecItemDiscount::query()
            ->where('custom_employee_code_id', $employee->custom_employee_code_id)
            ->where('is_active', true)
            ->where(function ($q) use ($item) {
                $q->where('item_id', $item->id)
                  ->orWhere('item_category_id', $item->item_category_id)
                  ->orWhere(function ($inner) {
                      $inner->whereNull('item_id')->whereNull('item_category_id');
                  });
            })
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_from')
                  ->orWhere('effective_from', '<=', $date);
            })
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_to')
                  ->orWhere('effective_to', '>=', $date);
            })
            ->orderByDesc('discount_percentage')
            ->first();
    }

    private function getSetDiscount(Item $item, int $quantity, Carbon $date): ?SetItemDiscount
    {
        return SetItemDiscount::query()
            ->where('is_active', true)
            ->where('min_quantity', '<=', $quantity)
            ->where(function ($q) use ($item) {
                $q->where('item_id', $item->id)
                  ->orWhere('item_category_id', $item->item_category_id)
                  ->orWhere('item_group_id', $item->item_group_id)
                  ->orWhere(function ($inner) {
                      $inner->whereNull('item_id')
                            ->whereNull('item_category_id')
                            ->whereNull('item_group_id');
                  });
            })
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_from')
                  ->orWhere('effective_from', '<=', $date);
            })
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_to')
                  ->orWhere('effective_to', '>=', $date);
            })
            ->orderByDesc('discount_percentage')
            ->first();
    }
}
