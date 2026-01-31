<?php

namespace App\Services\Pricing;

use App\Models\Employee;
use App\Models\Item;
use App\Models\ItemPriceCondition;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ConditionMatcher
{
    /**
     * Find all matching price conditions for an item + employee context.
     */
    public function match(Item $item, Employee $employee, ?Carbon $date = null): Collection
    {
        $date = $date ?? Carbon::today();

        $query = ItemPriceCondition::query()
            ->where('is_active', true)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_from')
                  ->orWhere('effective_from', '<=', $date);
            })
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_to')
                  ->orWhere('effective_to', '>=', $date);
            });

        // Match by item or category
        $query->where(function ($q) use ($item) {
            $q->where('item_id', $item->id)
              ->orWhere('item_category_id', $item->item_category_id)
              ->orWhere('item_sub_category_id', $item->item_sub_category_id)
              ->orWhere(function ($inner) {
                  // Conditions with no specific item/category apply to all
                  $inner->whereNull('item_id')
                        ->whereNull('item_category_id')
                        ->whereNull('item_sub_category_id');
              });
        });

        // Filter by demographic criteria
        $query->where(function ($q) use ($employee) {
            $this->applyDemographicFilters($q, $employee);
        });

        $conditions = $query->with(['filters', 'restrictions'])
            ->orderBy('priority', 'desc')
            ->get();

        // Apply advanced filters
        return $conditions->filter(function ($condition) use ($employee) {
            return $this->passesAdvancedFilters($condition, $employee);
        });
    }

    /**
     * Apply demographic filters (age, gender, relation type).
     */
    private function applyDemographicFilters($query, Employee $employee): void
    {
        $age = $employee->birth_date
            ? Carbon::parse($employee->birth_date)->age
            : null;

        // Age filter
        $query->where(function ($q) use ($age) {
            $q->whereNull('min_age')
              ->orWhere('min_age', '<=', $age ?? 999);
        });
        $query->where(function ($q) use ($age) {
            $q->whereNull('max_age')
              ->orWhere('max_age', '>=', $age ?? 0);
        });

        // Gender filter
        $query->where(function ($q) use ($employee) {
            $q->whereNull('gender')
              ->orWhere('gender', $employee->gender?->value);
        });

        // Relation type filter
        $query->where(function ($q) use ($employee) {
            $q->whereNull('relation_type');
            if ($employee->relationType) {
                $q->orWhere('relation_type', $employee->relationType->code);
            }
        });
    }

    /**
     * Check if a condition passes its advanced filters.
     */
    private function passesAdvancedFilters(ItemPriceCondition $condition, Employee $employee): bool
    {
        foreach ($condition->filters as $filter) {
            if (!$filter->is_active) {
                continue;
            }

            $passes = match ($filter->filter_type) {
                'province' => $this->checkFilter(
                    $filter->filter_operator,
                    $employee->province_id,
                    $filter->filter_value
                ),
                'location' => $this->checkFilter(
                    $filter->filter_operator,
                    $employee->location_id,
                    $filter->filter_value
                ),
                'employee_code' => $this->checkFilter(
                    $filter->filter_operator,
                    $employee->custom_employee_code_id,
                    $filter->filter_value
                ),
                'special_type' => $this->checkFilter(
                    $filter->filter_operator,
                    $employee->special_employee_type_id,
                    $filter->filter_value
                ),
                'illness' => $this->checkIllnessFilter(
                    $filter->filter_operator,
                    $employee,
                    $filter->filter_value
                ),
                default => true,
            };

            if (!$passes) {
                return false;
            }
        }

        return true;
    }

    private function checkFilter(string $operator, mixed $value, array $filterValues): bool
    {
        return match ($operator) {
            'in' => in_array($value, $filterValues),
            'not_in' => !in_array($value, $filterValues),
            'equals' => $value == ($filterValues[0] ?? null),
            'not_equals' => $value != ($filterValues[0] ?? null),
            default => true,
        };
    }

    private function checkIllnessFilter(string $operator, Employee $employee, array $filterValues): bool
    {
        $employeeIllnessIds = $employee->illnesses()
            ->where('is_active', true)
            ->pluck('illness_id')
            ->toArray();

        return match ($operator) {
            'in' => !empty(array_intersect($employeeIllnessIds, $filterValues)),
            'not_in' => empty(array_intersect($employeeIllnessIds, $filterValues)),
            default => true,
        };
    }
}
