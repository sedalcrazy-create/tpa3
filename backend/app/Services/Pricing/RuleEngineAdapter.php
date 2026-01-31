<?php

namespace App\Services\Pricing;

use App\Models\Employee;
use App\Models\Item;
use App\Models\ItemPriceCondition;
use Carbon\Carbon;
use Ruler\Context;
use Ruler\Operator;
use Ruler\Rule;
use Ruler\RuleBuilder;
use Ruler\RuleSet;
use Ruler\Variable;

class RuleEngineAdapter
{
    /**
     * Evaluate complex rules using bobthecow/ruler for a given context.
     *
     * The ruler library allows us to build rules programmatically from DB conditions
     * and evaluate them against a context of employee/item data.
     */
    public function evaluate(
        ItemPriceCondition $condition,
        Employee $employee,
        Item $item,
        array $additionalContext = []
    ): bool {
        $context = $this->buildContext($employee, $item, $additionalContext);
        $rule = $this->buildRule($condition);

        if ($rule === null) {
            return true; // No complex rule defined, condition passes
        }

        return $rule->evaluate($context);
    }

    /**
     * Build a Ruler context from employee and item data.
     */
    private function buildContext(Employee $employee, Item $item, array $additional): Context
    {
        $age = $employee->birth_date
            ? Carbon::parse($employee->birth_date)->age
            : 0;

        $workYears = $employee->employment_date
            ? Carbon::parse($employee->employment_date)->diffInYears(Carbon::today())
            : 0;

        $context = new Context([
            'employee_age' => $age,
            'employee_gender' => $employee->gender?->value ?? '',
            'employee_status' => $employee->status?->value ?? '',
            'employee_work_years' => $workYears,
            'employee_province_id' => $employee->province_id ?? 0,
            'employee_location_id' => $employee->location_id ?? 0,
            'employee_code_id' => $employee->custom_employee_code_id ?? 0,
            'employee_special_type_id' => $employee->special_employee_type_id ?? 0,
            'employee_is_head' => $employee->is_head_of_family ? 1 : 0,
            'employee_relation' => $employee->relationType?->code ?? 'self',
            'item_type' => $item->item_type ?? '',
            'item_category_id' => $item->item_category_id ?? 0,
            'item_sub_category_id' => $item->item_sub_category_id ?? 0,
            'item_group_id' => $item->item_group_id ?? 0,
            'item_is_otc' => $item->is_otc ? 1 : 0,
        ]);

        // Merge additional context (e.g. usage counts, body part)
        foreach ($additional as $key => $value) {
            $context[$key] = $value;
        }

        return $context;
    }

    /**
     * Build a Ruler rule from a price condition's JSON definition.
     *
     * condition_json format example:
     * {
     *   "operator": "and",
     *   "conditions": [
     *     {"variable": "employee_age", "operator": ">=", "value": 18},
     *     {"variable": "employee_work_years", "operator": ">=", "value": 5},
     *     {"variable": "item_type", "operator": "==", "value": "drug"}
     *   ]
     * }
     */
    private function buildRule(ItemPriceCondition $condition): ?Rule
    {
        $conditionJson = $condition->condition_json;
        if (empty($conditionJson)) {
            return null;
        }

        $rb = new RuleBuilder();

        try {
            $proposition = $this->buildProposition($rb, $conditionJson);
            if ($proposition === null) {
                return null;
            }

            return new Rule($proposition);
        } catch (\Throwable) {
            return null; // Invalid rule definition, treat as pass
        }
    }

    /**
     * Recursively build propositions from JSON condition definition.
     */
    private function buildProposition(RuleBuilder $rb, array $definition): ?Operator\Proposition
    {
        $operator = $definition['operator'] ?? null;

        // Compound operators (and/or)
        if ($operator === 'and' && isset($definition['conditions'])) {
            $propositions = array_filter(
                array_map(fn ($c) => $this->buildProposition($rb, $c), $definition['conditions'])
            );
            if (empty($propositions)) {
                return null;
            }
            return $this->combineWithAnd($propositions);
        }

        if ($operator === 'or' && isset($definition['conditions'])) {
            $propositions = array_filter(
                array_map(fn ($c) => $this->buildProposition($rb, $c), $definition['conditions'])
            );
            if (empty($propositions)) {
                return null;
            }
            return $this->combineWithOr($propositions);
        }

        // Leaf comparison operator
        $variable = $definition['variable'] ?? null;
        $value = $definition['value'] ?? null;

        if ($variable === null || $operator === null) {
            return null;
        }

        $var = $rb[$variable];

        return match ($operator) {
            '=', '==' => $var->equalTo($value),
            '!=' => $var->notEqualTo($value),
            '>' => $var->greaterThan($value),
            '>=' => $var->greaterThanOrEqualTo($value),
            '<' => $var->lessThan($value),
            '<=' => $var->lessThanOrEqualTo($value),
            default => null,
        };
    }

    private function combineWithAnd(array $propositions): Operator\Proposition
    {
        $result = array_shift($propositions);
        foreach ($propositions as $prop) {
            $result = new Operator\LogicalAnd([$result, $prop]);
        }
        return $result;
    }

    private function combineWithOr(array $propositions): Operator\Proposition
    {
        $result = array_shift($propositions);
        foreach ($propositions as $prop) {
            $result = new Operator\LogicalOr([$result, $prop]);
        }
        return $result;
    }
}
