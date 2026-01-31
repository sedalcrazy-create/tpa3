<?php

namespace App\Services;

use App\Models\CommissionCase;
use App\Models\SocialWorkCase;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;

class CommissionService
{
    /**
     * Get paginated list of commission cases with optional filters.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function listCases(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = CommissionCase::query();

        // Filter by employee_id
        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by commission_case_type_id
        if (!empty($filters['commission_case_type_id'])) {
            $query->where('commission_case_type_id', $filters['commission_case_type_id']);
        }

        // Search by case_number or subject
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('case_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        // Eager load relations
        $query->with(['employee', 'caseType', 'assignedToUser']);

        // Order by created_at descending
        $query->orderBy('created_at', 'desc');

        return $query->paginate($perPage);
    }

    /**
     * Find a commission case by ID with all relations loaded.
     *
     * @param int $id
     * @return CommissionCase
     *
     * @throws ModelNotFoundException
     */
    public function findCase(int $id): CommissionCase
    {
        return CommissionCase::with([
            'employee',
            'caseType',
            'claim',
            'verdictTemplate',
            'assignedToUser',
            'createdByUser',
        ])->findOrFail($id);
    }

    /**
     * Create a new commission case.
     *
     * @param array<string, mixed> $data
     * @return CommissionCase
     */
    public function createCase(array $data): CommissionCase
    {
        // Generate case number
        $data['case_number'] = 'COM-' . date('Ymd') . '-' . str_pad(random_int(1, 99999), 5, '0', STR_PAD_LEFT);

        // Set created_by to authenticated user
        $data['created_by'] = Auth::id();

        // Set default status
        if (!isset($data['status'])) {
            $data['status'] = 'pending';
        }

        $case = CommissionCase::create($data);

        return $case->load([
            'employee',
            'caseType',
            'claim',
            'verdictTemplate',
            'assignedToUser',
            'createdByUser',
        ]);
    }

    /**
     * Update an existing commission case.
     *
     * @param CommissionCase $case
     * @param array<string, mixed> $data
     * @return CommissionCase
     */
    public function updateCase(CommissionCase $case, array $data): CommissionCase
    {
        $case->update($data);

        return $case->load([
            'employee',
            'caseType',
            'claim',
            'verdictTemplate',
            'assignedToUser',
            'createdByUser',
        ]);
    }

    /**
     * Issue a verdict for a commission case.
     *
     * @param CommissionCase $case
     * @param string $verdict
     * @param int|null $verdictTemplateId
     * @return CommissionCase
     */
    public function issueVerdict(CommissionCase $case, string $verdict, ?int $verdictTemplateId = null): CommissionCase
    {
        $case->update([
            'verdict' => $verdict,
            'verdict_template_id' => $verdictTemplateId,
            'verdict_date' => now()->toDateString(),
            'status' => 'verdict_issued',
        ]);

        return $case->load([
            'employee',
            'caseType',
            'claim',
            'verdictTemplate',
            'assignedToUser',
            'createdByUser',
        ]);
    }

    /**
     * Get paginated list of social work cases with optional filters.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function listSocialWork(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = SocialWorkCase::query();

        // Filter by employee_id
        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Search by case_number or subject
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('case_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        // Eager load relations
        $query->with(['employee', 'assignedToUser', 'createdByUser']);

        // Order by created_at descending
        $query->orderBy('created_at', 'desc');

        return $query->paginate($perPage);
    }

    /**
     * Find a social work case by ID with all relations loaded.
     *
     * @param int $id
     * @return SocialWorkCase
     *
     * @throws ModelNotFoundException
     */
    public function findSocialWork(int $id): SocialWorkCase
    {
        return SocialWorkCase::with([
            'employee',
            'assignedToUser',
            'createdByUser',
        ])->findOrFail($id);
    }

    /**
     * Create a new social work case.
     *
     * @param array<string, mixed> $data
     * @return SocialWorkCase
     */
    public function createSocialWork(array $data): SocialWorkCase
    {
        // Generate case number
        $data['case_number'] = 'SW-' . date('Ymd') . '-' . str_pad(random_int(1, 99999), 5, '0', STR_PAD_LEFT);

        // Set created_by to authenticated user
        $data['created_by'] = Auth::id();

        // Set default status
        if (!isset($data['status'])) {
            $data['status'] = 'pending';
        }

        $case = SocialWorkCase::create($data);

        return $case->load([
            'employee',
            'assignedToUser',
            'createdByUser',
        ]);
    }

    /**
     * Resolve a social work case.
     *
     * @param SocialWorkCase $case
     * @param string $resolution
     * @return SocialWorkCase
     */
    public function resolveSocialWork(SocialWorkCase $case, string $resolution): SocialWorkCase
    {
        $case->update([
            'resolution' => $resolution,
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        return $case->load([
            'employee',
            'assignedToUser',
            'createdByUser',
        ]);
    }
}
