<?php

namespace App\Services;

use App\Models\Center;
use App\Models\Doctor;
use App\Models\InstitutionContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class CenterService
{
    /**
     * Get paginated list of centers with optional filters.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Center::query();

        // Search by name or code
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Filter by center_type
        if (!empty($filters['center_type'])) {
            $query->where('center_type', $filters['center_type']);
        }

        // Filter by province
        if (!empty($filters['province_id'])) {
            $query->where('province_id', $filters['province_id']);
        }

        // Filter by contracted status
        if (isset($filters['is_contracted'])) {
            $query->where('is_contracted', filter_var($filters['is_contracted'], FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by active status
        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        // Eager load relations
        $query->with(['province']);

        // Order by name
        $query->orderBy('name');

        return $query->paginate($perPage);
    }

    /**
     * Find a center by ID with all relations loaded.
     *
     * @param int $id
     * @return Center
     *
     * @throws ModelNotFoundException
     */
    public function find(int $id): Center
    {
        return Center::with([
            'province',
            'doctors',
            'contracts.contractType',
        ])->findOrFail($id);
    }

    /**
     * Create a new center.
     *
     * @param array<string, mixed> $data
     * @return Center
     */
    public function create(array $data): Center
    {
        // Set is_active to true by default
        if (!isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        $center = Center::create($data);

        return $center->load(['province']);
    }

    /**
     * Update an existing center.
     *
     * @param Center $center
     * @param array<string, mixed> $data
     * @return Center
     */
    public function update(Center $center, array $data): Center
    {
        $center->update($data);

        return $center->load(['province']);
    }

    /**
     * Soft delete a center.
     *
     * @param Center $center
     * @return void
     */
    public function delete(Center $center): void
    {
        $center->delete();
    }

    /**
     * Get paginated list of doctors for a specific center.
     *
     * @param int $centerId
     * @param int $perPage
     * @return LengthAwarePaginator
     *
     * @throws ModelNotFoundException
     */
    public function listDoctors(int $centerId, int $perPage = 15): LengthAwarePaginator
    {
        // Ensure center exists
        Center::findOrFail($centerId);

        return Doctor::where('center_id', $centerId)
            ->with(['center'])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($perPage);
    }

    /**
     * Add a new doctor.
     *
     * @param array<string, mixed> $data
     * @return Doctor
     */
    public function addDoctor(array $data): Doctor
    {
        // Set is_active to true by default
        if (!isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        $doctor = Doctor::create($data);

        return $doctor->load(['center']);
    }

    /**
     * Update an existing doctor.
     *
     * @param Doctor $doctor
     * @param array<string, mixed> $data
     * @return Doctor
     */
    public function updateDoctor(Doctor $doctor, array $data): Doctor
    {
        $doctor->update($data);

        return $doctor->load(['center']);
    }

    /**
     * Get list of contracts for a specific center.
     *
     * @param int $centerId
     * @return Collection
     *
     * @throws ModelNotFoundException
     */
    public function listContracts(int $centerId): Collection
    {
        // Ensure center exists
        Center::findOrFail($centerId);

        return InstitutionContract::where('center_id', $centerId)
            ->with(['center', 'contractType'])
            ->orderBy('start_date', 'desc')
            ->get();
    }

    /**
     * Add a new institution contract.
     *
     * @param array<string, mixed> $data
     * @return InstitutionContract
     */
    public function addContract(array $data): InstitutionContract
    {
        $contract = InstitutionContract::create($data);

        return $contract->load(['center', 'contractType']);
    }
}
