<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeIllness;
use App\Models\EmployeeInfraction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class EmployeeService
{
    /**
     * Standard eager-load relations.
     */
    private const LIST_RELATIONS = [
        'province',
        'location',
        'relationType',
        'customEmployeeCode',
        'activeInsurance',
        'marriageStatus',
        'locationWork',
    ];

    private const DETAIL_RELATIONS = [
        'province',
        'location',
        'relationType',
        'customEmployeeCode',
        'specialEmployeeType',
        'guardianshipType',
        'parent',
        'activeInsurance',
        'marriageStatus',
        'locationWork',
    ];

    /**
     * Get paginated list of employees with optional filters.
     */
    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Employee::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('national_code', 'like', "%{$search}%")
                    ->orWhere('personnel_code', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['province_id'])) {
            $query->where('province_id', $filters['province_id']);
        }

        if (!empty($filters['location_id'])) {
            $query->where('location_id', $filters['location_id']);
        }

        if (isset($filters['is_head_of_family'])) {
            $query->where('is_head_of_family', filter_var($filters['is_head_of_family'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['parent_id'])) {
            $query->where('parent_id', $filters['parent_id']);
        }

        if (!empty($filters['special_employee_type_id'])) {
            $query->where('special_employee_type_id', $filters['special_employee_type_id']);
        }

        if (!empty($filters['relation_type_id'])) {
            $query->where('relation_type_id', $filters['relation_type_id']);
        }

        if (!empty($filters['guardianship_type_id'])) {
            $query->where('guardianship_type_id', $filters['guardianship_type_id']);
        }

        if (!empty($filters['gender'])) {
            $query->where('gender', $filters['gender']);
        }

        $query->with(self::LIST_RELATIONS);

        $allowedSorts = ['id', 'first_name', 'last_name', 'personnel_code', 'national_code', 'employment_date', 'custom_employee_code'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSorts) ? $filters['sort_by'] : 'last_name';
        $sortOrder = ($filters['sort_order'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    /**
     * Find an employee by ID with all relations loaded.
     */
    public function find(int $id): Employee
    {
        return Employee::with(self::DETAIL_RELATIONS)->findOrFail($id);
    }

    /**
     * Create a new employee.
     */
    public function create(array $data): Employee
    {
        if (!isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        $employee = Employee::create($data);

        return $employee->load(self::DETAIL_RELATIONS);
    }

    /**
     * Update an existing employee.
     */
    public function update(Employee $employee, array $data): Employee
    {
        $employee->update($data);

        return $employee->load(self::DETAIL_RELATIONS);
    }

    /**
     * Soft delete an employee.
     */
    public function delete(Employee $employee): void
    {
        $employee->delete();
    }

    /**
     * Bulk soft-delete employees.
     */
    public function bulkDelete(array $ids): int
    {
        return Employee::whereIn('id', $ids)->delete();
    }

    /**
     * Search employees by query string (lightweight).
     */
    public function search(string $query): Collection
    {
        if (empty($query)) {
            return collect();
        }

        return Employee::where(function ($q) use ($query) {
            $q->where('first_name', 'like', "%{$query}%")
                ->orWhere('last_name', 'like', "%{$query}%")
                ->orWhere('national_code', 'like', "%{$query}%")
                ->orWhere('personnel_code', 'like', "%{$query}%");
        })
            ->select('id', 'first_name', 'last_name', 'personnel_code', 'national_code')
            ->limit(20)
            ->get();
    }

    // ── Family ─────────────────────────────────────────

    /**
     * Get family members of an employee.
     */
    public function getFamily(int $employeeId): Collection
    {
        $employee = Employee::findOrFail($employeeId);

        if ($employee->is_head_of_family) {
            return Employee::where('parent_id', $employeeId)
                ->with('relationType')
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get();
        }

        if ($employee->parent_id) {
            return Employee::where('parent_id', $employee->parent_id)
                ->orWhere('id', $employee->parent_id)
                ->with('relationType')
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get();
        }

        return collect();
    }

    /**
     * Add a family member (dependent) to an employee.
     */
    public function storeFamily(int $employeeId, array $data): Employee
    {
        Employee::findOrFail($employeeId);

        $data['parent_id'] = $employeeId;
        if (!isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        $member = Employee::create($data);

        return $member->load('relationType');
    }

    /**
     * Update a family member.
     */
    public function updateFamily(int $employeeId, int $familyId, array $data): Employee
    {
        $member = Employee::where('id', $familyId)
            ->where('parent_id', $employeeId)
            ->firstOrFail();

        $member->update($data);

        return $member->load('relationType');
    }

    /**
     * Delete a family member.
     */
    public function deleteFamily(int $employeeId, int $familyId): void
    {
        $member = Employee::where('id', $familyId)
            ->where('parent_id', $employeeId)
            ->firstOrFail();

        $member->delete();
    }

    // ── Insurance ──────────────────────────────────────

    /**
     * Get insurance history for an employee.
     */
    public function getInsuranceHistory(int $employeeId): Collection
    {
        $employee = Employee::findOrFail($employeeId);

        return $employee->insurances()
            ->orderBy('start_date', 'desc')
            ->get();
    }

    // ── Illnesses ──────────────────────────────────────

    /**
     * Get illnesses for an employee.
     */
    public function getIllnesses(int $employeeId): Collection
    {
        Employee::findOrFail($employeeId);

        return EmployeeIllness::where('employee_id', $employeeId)
            ->with('illness')
            ->orderBy('diagnosed_date', 'desc')
            ->get();
    }

    /**
     * Add an illness to an employee.
     */
    public function storeIllness(int $employeeId, array $data, int $userId): EmployeeIllness
    {
        Employee::findOrFail($employeeId);

        return EmployeeIllness::create(array_merge($data, [
            'employee_id' => $employeeId,
            'created_by' => $userId,
        ]));
    }

    /**
     * Update an illness record.
     */
    public function updateIllness(int $employeeId, int $illnessId, array $data): EmployeeIllness
    {
        $illness = EmployeeIllness::where('id', $illnessId)
            ->where('employee_id', $employeeId)
            ->firstOrFail();

        $illness->update($data);

        return $illness;
    }

    /**
     * Delete an illness record.
     */
    public function deleteIllness(int $employeeId, int $illnessId): void
    {
        EmployeeIllness::where('id', $illnessId)
            ->where('employee_id', $employeeId)
            ->firstOrFail()
            ->delete();
    }

    // ── Infractions ────────────────────────────────────

    /**
     * Get infractions for an employee.
     */
    public function getInfractions(int $employeeId): Collection
    {
        Employee::findOrFail($employeeId);

        return EmployeeInfraction::where('employee_id', $employeeId)
            ->orderBy('infraction_date', 'desc')
            ->get();
    }

    /**
     * Add an infraction to an employee.
     */
    public function storeInfraction(int $employeeId, array $data, int $userId): EmployeeInfraction
    {
        Employee::findOrFail($employeeId);

        return EmployeeInfraction::create(array_merge($data, [
            'employee_id' => $employeeId,
            'created_by' => $userId,
        ]));
    }

    /**
     * Update an infraction record.
     */
    public function updateInfraction(int $employeeId, int $infractionId, array $data): EmployeeInfraction
    {
        $infraction = EmployeeInfraction::where('id', $infractionId)
            ->where('employee_id', $employeeId)
            ->firstOrFail();

        $infraction->update($data);

        return $infraction;
    }

    /**
     * Delete an infraction record.
     */
    public function deleteInfraction(int $employeeId, int $infractionId): void
    {
        EmployeeInfraction::where('id', $infractionId)
            ->where('employee_id', $employeeId)
            ->firstOrFail()
            ->delete();
    }
}
