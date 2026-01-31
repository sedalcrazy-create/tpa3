<?php

namespace App\Services\Pricing;

use App\Models\ConditionGroup;
use App\Models\Employee;
use App\Models\Item;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class GroupChecker
{
    public function __construct(
        private readonly UsageCounter $usageCounter
    ) {}

    /**
     * Check if an item exceeds any group limits.
     *
     * @return Collection<int, array{group_id: int, group_name: string, message: string}>
     */
    public function check(Item $item, Employee $employee, ?Carbon $date = null): Collection
    {
        $date = $date ?? Carbon::today();
        $violations = collect();

        // Find all groups this item belongs to
        $groups = ConditionGroup::query()
            ->where('is_active', true)
            ->whereHas('items', function ($q) use ($item) {
                $q->where('is_active', true)
                  ->where(function ($inner) use ($item) {
                      $inner->where('item_id', $item->id)
                            ->orWhere('item_category_id', $item->item_category_id);
                  });
            })
            ->with(['items' => function ($q) {
                $q->where('is_active', true);
            }])
            ->get();

        foreach ($groups as $group) {
            $violation = $this->checkGroup($group, $employee, $date);
            if ($violation) {
                $violations->push($violation);
            }
        }

        return $violations;
    }

    private function checkGroup(ConditionGroup $group, Employee $employee, Carbon $date): ?array
    {
        $periodType = $group->period_type ?? 'yearly';

        // Get all item IDs in this group
        $itemIds = $group->items->pluck('item_id')->filter()->toArray();
        $categoryIds = $group->items->pluck('item_category_id')->filter()->toArray();

        // Also resolve items from categories
        if (!empty($categoryIds)) {
            $categoryItemIds = \App\Models\Item::query()
                ->whereIn('item_category_id', $categoryIds)
                ->pluck('id')
                ->toArray();
            $itemIds = array_unique(array_merge($itemIds, $categoryItemIds));
        }

        if (empty($itemIds)) {
            return null;
        }

        // Check quantity limit
        if ($group->max_per_period) {
            $totalQuantity = 0;
            foreach ($itemIds as $itemId) {
                $item = \App\Models\Item::find($itemId);
                if ($item) {
                    $totalQuantity += $this->usageCounter->countUsage($employee, $item, $periodType, $date);
                }
            }

            if ($totalQuantity >= $group->max_per_period) {
                return [
                    'group_id' => $group->id,
                    'group_name' => $group->name,
                    'message' => "سقف گروه «{$group->name}» ({$group->max_per_period} بار در {$this->periodLabel($periodType)}) تکمیل شده است.",
                ];
            }
        }

        // Check amount limit
        if ($group->max_total_amount) {
            $totalAmount = $this->usageCounter->countGroupUsageAmount(
                $employee,
                $itemIds,
                $periodType,
                $date
            );

            if ($totalAmount >= (float) $group->max_total_amount) {
                return [
                    'group_id' => $group->id,
                    'group_name' => $group->name,
                    'message' => "سقف مبلغ گروه «{$group->name}» (" . number_format((float) $group->max_total_amount) . " ریال) تکمیل شده است.",
                ];
            }
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
