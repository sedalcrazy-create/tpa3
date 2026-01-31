<?php

namespace App\Services\Pricing;

use App\Models\Employee;
use App\Models\InvoiceItem;
use App\Models\Item;
use Carbon\Carbon;

class UsageCounter
{
    /**
     * Count how many times an item has been used by an employee in a given period.
     */
    public function countUsage(
        Employee $employee,
        Item $item,
        string $periodType,
        ?Carbon $date = null
    ): int {
        $date = $date ?? Carbon::today();
        [$start, $end] = $this->getPeriodRange($periodType, $date);

        return InvoiceItem::query()
            ->where('item_id', $item->id)
            ->whereHas('invoice', function ($q) use ($employee, $start, $end) {
                $q->where('employee_id', $employee->id)
                  ->whereNotIn('status', ['draft', 'rejected'])
                  ->whereBetween('invoice_date', [$start, $end]);
            })
            ->sum('quantity');
    }

    /**
     * Count total usage of items in a category for an employee in a period.
     */
    public function countCategoryUsage(
        Employee $employee,
        int $categoryId,
        string $periodType,
        ?Carbon $date = null
    ): int {
        $date = $date ?? Carbon::today();
        [$start, $end] = $this->getPeriodRange($periodType, $date);

        return InvoiceItem::query()
            ->whereHas('item', function ($q) use ($categoryId) {
                $q->where('item_category_id', $categoryId);
            })
            ->whereHas('invoice', function ($q) use ($employee, $start, $end) {
                $q->where('employee_id', $employee->id)
                  ->whereNotIn('status', ['draft', 'rejected'])
                  ->whereBetween('invoice_date', [$start, $end]);
            })
            ->sum('quantity');
    }

    /**
     * Count usage of a specific item on a specific body part.
     */
    public function countBodyPartUsage(
        Employee $employee,
        Item $item,
        int $bodyPartId,
        string $periodType,
        ?Carbon $date = null
    ): int {
        $date = $date ?? Carbon::today();
        [$start, $end] = $this->getPeriodRange($periodType, $date);

        return InvoiceItem::query()
            ->where('item_id', $item->id)
            ->where('body_part_id', $bodyPartId)
            ->whereHas('invoice', function ($q) use ($employee, $start, $end) {
                $q->where('employee_id', $employee->id)
                  ->whereNotIn('status', ['draft', 'rejected'])
                  ->whereBetween('invoice_date', [$start, $end]);
            })
            ->sum('quantity');
    }

    /**
     * Count total usage amount (money) for an employee in a group of items.
     */
    public function countGroupUsageAmount(
        Employee $employee,
        array $itemIds,
        string $periodType,
        ?Carbon $date = null
    ): float {
        $date = $date ?? Carbon::today();
        [$start, $end] = $this->getPeriodRange($periodType, $date);

        return (float) InvoiceItem::query()
            ->whereIn('item_id', $itemIds)
            ->whereHas('invoice', function ($q) use ($employee, $start, $end) {
                $q->where('employee_id', $employee->id)
                  ->whereNotIn('status', ['draft', 'rejected'])
                  ->whereBetween('invoice_date', [$start, $end]);
            })
            ->sum('insurance_share');
    }

    /**
     * Get date range for a period type.
     */
    private function getPeriodRange(string $periodType, Carbon $date): array
    {
        return match ($periodType) {
            'daily' => [$date->copy()->startOfDay(), $date->copy()->endOfDay()],
            'weekly' => [$date->copy()->startOfWeek(), $date->copy()->endOfWeek()],
            'monthly' => [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()],
            'yearly' => [$date->copy()->startOfYear(), $date->copy()->endOfYear()],
            default => [$date->copy()->startOfYear(), $date->copy()->endOfYear()],
        };
    }
}
