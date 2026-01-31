<?php

namespace App\Services;

use App\Models\Prescription;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class PrescriptionService
{
    /**
     * Get paginated list of prescriptions with optional filters.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Prescription::query();

        // Filter by employee
        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        // Filter by doctor
        if (!empty($filters['doctor_id'])) {
            $query->where('doctor_id', $filters['doctor_id']);
        }

        // Filter by center
        if (!empty($filters['center_id'])) {
            $query->where('center_id', $filters['center_id']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by date range
        if (!empty($filters['date_from'])) {
            $query->where('prescription_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('prescription_date', '<=', $filters['date_to']);
        }

        // Search by prescription_number or diagnosis_code
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('prescription_number', 'like', "%{$search}%")
                    ->orWhere('diagnosis_code', 'like', "%{$search}%");
            });
        }

        // Eager load relations
        $query->with([
            'employee',
            'doctor',
            'center',
            'prescriptionType',
            'illness',
        ]);

        // Order by prescription_date desc
        $query->orderBy('prescription_date', 'desc');

        return $query->paginate($perPage);
    }

    /**
     * Find a prescription by ID with all relations loaded.
     *
     * @param int $id
     * @return Prescription
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function find(int $id): Prescription
    {
        return Prescription::with([
            'employee',
            'doctor',
            'center',
            'prescriptionType',
            'illness',
            'createdByUser',
            'invoices',
        ])->findOrFail($id);
    }

    /**
     * Create a new prescription.
     *
     * @param array<string, mixed> $data
     * @return Prescription
     */
    public function create(array $data): Prescription
    {
        // Generate unique prescription number
        $data['prescription_number'] = 'PRX-' . date('Ymd') . '-' . str_pad(random_int(1, 99999), 5, '0', STR_PAD_LEFT);

        // Set created_by to authenticated user
        $data['created_by'] = Auth::id();

        $prescription = Prescription::create($data);

        return $prescription->load([
            'employee',
            'doctor',
            'center',
            'prescriptionType',
            'illness',
            'createdByUser',
        ]);
    }

    /**
     * Update an existing prescription.
     *
     * @param Prescription $prescription
     * @param array<string, mixed> $data
     * @return Prescription
     */
    public function update(Prescription $prescription, array $data): Prescription
    {
        $prescription->update($data);

        return $prescription->load([
            'employee',
            'doctor',
            'center',
            'prescriptionType',
            'illness',
            'createdByUser',
        ]);
    }

    /**
     * Cancel a prescription.
     *
     * @param Prescription $prescription
     * @return Prescription
     */
    public function cancel(Prescription $prescription): Prescription
    {
        $prescription->update(['status' => 'cancelled']);

        return $prescription;
    }
}
