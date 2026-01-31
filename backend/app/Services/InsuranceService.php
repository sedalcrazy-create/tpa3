<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Insurance;
use App\Models\InsuranceHistory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class InsuranceService
{
    /**
     * List insurances with filters and pagination.
     */
    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Insurance::query()->with('employee');

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['search'])) {
            $query->where('insurance_number', 'like', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('start_date', 'desc')->paginate($perPage);
    }

    /**
     * Find an insurance by ID with relations.
     */
    public function find(int $id): Insurance
    {
        return Insurance::with(['employee', 'histories.changedByUser'])->findOrFail($id);
    }

    /**
     * Create a new insurance record.
     */
    public function create(array $data): Insurance
    {
        $data['is_active'] = $data['is_active'] ?? true;
        $data['used_amount'] = $data['used_amount'] ?? 0;

        $annualCeiling = $data['annual_ceiling'] ?? 0;
        $usedAmount = $data['used_amount'];
        $data['remaining_amount'] = $annualCeiling - $usedAmount;

        $insurance = Insurance::create($data);

        return $insurance->load('employee');
    }

    /**
     * Update an existing insurance record with change tracking.
     */
    public function update(Insurance $insurance, array $data): Insurance
    {
        $trackedFields = [
            'employee_id',
            'insurance_number',
            'start_date',
            'end_date',
            'start_date_jalali',
            'end_date_jalali',
            'status',
            'basic_premium',
            'supplementary_premium',
            'annual_ceiling',
            'used_amount',
            'remaining_amount',
            'is_active',
        ];

        $userId = auth()->id();

        foreach ($trackedFields as $field) {
            if (array_key_exists($field, $data)) {
                $oldValue = $insurance->getRawOriginal($field);
                $newValue = $data[$field];

                if ((string) $oldValue !== (string) $newValue) {
                    InsuranceHistory::create([
                        'insurance_id' => $insurance->id,
                        'field_name' => $field,
                        'old_value' => $oldValue,
                        'new_value' => $newValue,
                        'changed_by' => $userId,
                    ]);
                }
            }
        }

        $insurance->update($data);

        return $insurance->load('employee');
    }

    /**
     * Soft delete an insurance record.
     */
    public function delete(Insurance $insurance): void
    {
        $insurance->delete();
    }

    /**
     * Inquiry insurance status by national code.
     */
    public function inquiry(string $nationalCode): array
    {
        $employee = Employee::where('national_code', $nationalCode)->first();

        if (!$employee) {
            throw new ModelNotFoundException('کارمندی با این کد ملی یافت نشد.');
        }

        $insurance = Insurance::where('employee_id', $employee->id)
            ->where('status', 'active')
            ->where('is_active', true)
            ->latest('start_date')
            ->first();

        if (!$insurance) {
            throw new ModelNotFoundException('بیمه فعالی برای این کارمند یافت نشد.');
        }

        return [
            'employee' => [
                'id' => $employee->id,
                'full_name' => $employee->full_name,
                'personnel_code' => $employee->personnel_code,
                'national_code' => $employee->national_code,
            ],
            'insurance' => [
                'id' => $insurance->id,
                'insurance_number' => $insurance->insurance_number,
                'status' => [
                    'value' => $insurance->status->value,
                    'label' => $insurance->status->label(),
                ],
                'remaining_ceiling' => $insurance->remaining_amount,
                'annual_ceiling' => $insurance->annual_ceiling,
                'used_amount' => $insurance->used_amount,
            ],
            'is_valid' => true,
        ];
    }

    /**
     * Check if insurance has enough ceiling for the requested amount.
     */
    public function checkCeiling(int $insuranceId, float $amount): array
    {
        $insurance = Insurance::findOrFail($insuranceId);

        $remainingAmount = (float) $insurance->remaining_amount;
        $hasCeiling = $remainingAmount >= $amount;

        $result = [
            'has_ceiling' => $hasCeiling,
            'remaining_amount' => $remainingAmount,
            'requested_amount' => $amount,
        ];

        if (!$hasCeiling) {
            $result['shortfall'] = $amount - $remainingAmount;
        }

        return $result;
    }

    /**
     * Deduct an amount from the insurance ceiling.
     */
    public function deductFromCeiling(int $insuranceId, float $amount): Insurance
    {
        $insurance = Insurance::findOrFail($insuranceId);

        $oldUsedAmount = (float) $insurance->used_amount;
        $oldRemainingAmount = (float) $insurance->remaining_amount;

        $newUsedAmount = $oldUsedAmount + $amount;
        $newRemainingAmount = $oldRemainingAmount - $amount;

        $userId = auth()->id();

        InsuranceHistory::create([
            'insurance_id' => $insurance->id,
            'field_name' => 'used_amount',
            'old_value' => $oldUsedAmount,
            'new_value' => $newUsedAmount,
            'changed_by' => $userId,
        ]);

        InsuranceHistory::create([
            'insurance_id' => $insurance->id,
            'field_name' => 'remaining_amount',
            'old_value' => $oldRemainingAmount,
            'new_value' => $newRemainingAmount,
            'changed_by' => $userId,
        ]);

        $insurance->update([
            'used_amount' => $newUsedAmount,
            'remaining_amount' => $newRemainingAmount,
        ]);

        return $insurance->fresh();
    }
}
