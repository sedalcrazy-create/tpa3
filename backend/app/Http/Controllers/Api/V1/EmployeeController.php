<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\BulkDeleteRequest;
use App\Http\Requests\Employee\ImportApplyRequest;
use App\Http\Requests\Employee\ImportEmployeeRequest;
use App\Http\Requests\Employee\ImportStageRequest;
use App\Http\Requests\Employee\StoreFamilyRequest;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\StoreIllnessRequest;
use App\Http\Requests\Employee\StoreInfractionRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeCollection;
use App\Http\Resources\EmployeeFamilyResource;
use App\Http\Resources\EmployeeResource;
use App\Services\EmployeeImportService;
use App\Services\EmployeeService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly EmployeeService $employeeService,
        private readonly EmployeeImportService $employeeImportService
    ) {}

    /**
     * Display a paginated list of employees.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'status',
            'province_id',
            'location_id',
            'is_head_of_family',
            'parent_id',
            'special_employee_type_id',
            'relation_type_id',
            'guardianship_type_id',
            'gender',
            'sort_by',
            'sort_order',
        ]);

        $perPage = (int) $request->query('per_page', 15);

        $employees = $this->employeeService->list($filters, $perPage);

        return $this->paginatedResponse(
            new EmployeeCollection($employees)
        );
    }

    /**
     * Store a newly created employee.
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('employees/photos', 'public');
        }

        $employee = $this->employeeService->create($data);

        return $this->createdResponse(
            new EmployeeResource($employee),
            'کارمند با موفقیت ایجاد شد.'
        );
    }

    /**
     * Display the specified employee.
     */
    public function show(int $id): JsonResponse
    {
        $employee = $this->employeeService->find($id);

        return $this->successResponse(
            new EmployeeResource($employee)
        );
    }

    /**
     * Update the specified employee.
     */
    public function update(UpdateEmployeeRequest $request, int $id): JsonResponse
    {
        $employee = $this->employeeService->find($id);
        $data = $request->validated();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('employees/photos', 'public');
        }

        $employee = $this->employeeService->update($employee, $data);

        return $this->successResponse(
            new EmployeeResource($employee),
            'اطلاعات کارمند با موفقیت به‌روزرسانی شد.'
        );
    }

    /**
     * Remove the specified employee (soft delete).
     */
    public function destroy(int $id): JsonResponse
    {
        $employee = $this->employeeService->find($id);
        $this->employeeService->delete($employee);

        return $this->successResponse(
            message: 'کارمند با موفقیت حذف شد.'
        );
    }

    /**
     * Bulk delete employees.
     */
    public function bulkDestroy(BulkDeleteRequest $request): JsonResponse
    {
        $count = $this->employeeService->bulkDelete($request->validated()['ids']);

        return $this->successResponse(
            ['deleted_count' => $count],
            "{$count} کارمند با موفقیت حذف شدند."
        );
    }

    /**
     * Search employees by query.
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->query('q', '');
        $results = $this->employeeService->search($query);

        return $this->successResponse($results);
    }

    // ── Family ─────────────────────────────────────────

    /**
     * Get family members of the specified employee.
     */
    public function family(int $id): JsonResponse
    {
        $family = $this->employeeService->getFamily($id);

        return $this->successResponse(
            EmployeeFamilyResource::collection($family)
        );
    }

    /**
     * Add a family member (dependent) to an employee.
     */
    public function storeFamily(StoreFamilyRequest $request, int $id): JsonResponse
    {
        $member = $this->employeeService->storeFamily($id, $request->validated());

        return $this->createdResponse(
            new EmployeeFamilyResource($member),
            'عضو خانواده با موفقیت اضافه شد.'
        );
    }

    /**
     * Update a family member.
     */
    public function updateFamily(Request $request, int $id, int $familyId): JsonResponse
    {
        $member = $this->employeeService->updateFamily($id, $familyId, $request->all());

        return $this->successResponse(
            new EmployeeFamilyResource($member),
            'اطلاعات عضو خانواده با موفقیت به‌روزرسانی شد.'
        );
    }

    /**
     * Remove a family member.
     */
    public function destroyFamily(int $id, int $familyId): JsonResponse
    {
        $this->employeeService->deleteFamily($id, $familyId);

        return $this->successResponse(
            message: 'عضو خانواده با موفقیت حذف شد.'
        );
    }

    // ── Insurance ──────────────────────────────────────

    /**
     * Get insurance history of the specified employee.
     */
    public function insurance(int $id): JsonResponse
    {
        $insurances = $this->employeeService->getInsuranceHistory($id);

        return $this->successResponse($insurances);
    }

    // ── Illnesses ──────────────────────────────────────

    /**
     * Get illnesses for an employee.
     */
    public function illnesses(int $id): JsonResponse
    {
        $illnesses = $this->employeeService->getIllnesses($id);

        return $this->successResponse($illnesses);
    }

    /**
     * Add an illness to an employee.
     */
    public function storeIllness(StoreIllnessRequest $request, int $id): JsonResponse
    {
        $illness = $this->employeeService->storeIllness($id, $request->validated(), $request->user()->id);

        return $this->createdResponse($illness, 'بیماری با موفقیت ثبت شد.');
    }

    /**
     * Update an illness record.
     */
    public function updateIllness(Request $request, int $id, int $illnessId): JsonResponse
    {
        $illness = $this->employeeService->updateIllness($id, $illnessId, $request->all());

        return $this->successResponse($illness, 'بیماری با موفقیت به‌روزرسانی شد.');
    }

    /**
     * Delete an illness record.
     */
    public function destroyIllness(int $id, int $illnessId): JsonResponse
    {
        $this->employeeService->deleteIllness($id, $illnessId);

        return $this->successResponse(message: 'بیماری با موفقیت حذف شد.');
    }

    // ── Infractions ────────────────────────────────────

    /**
     * Get infractions for an employee.
     */
    public function infractions(int $id): JsonResponse
    {
        $infractions = $this->employeeService->getInfractions($id);

        return $this->successResponse($infractions);
    }

    /**
     * Add an infraction to an employee.
     */
    public function storeInfraction(StoreInfractionRequest $request, int $id): JsonResponse
    {
        $infraction = $this->employeeService->storeInfraction($id, $request->validated(), $request->user()->id);

        return $this->createdResponse($infraction, 'تخلف با موفقیت ثبت شد.');
    }

    /**
     * Update an infraction record.
     */
    public function updateInfraction(Request $request, int $id, int $infractionId): JsonResponse
    {
        $infraction = $this->employeeService->updateInfraction($id, $infractionId, $request->all());

        return $this->successResponse($infraction, 'تخلف با موفقیت به‌روزرسانی شد.');
    }

    /**
     * Delete an infraction record.
     */
    public function destroyInfraction(int $id, int $infractionId): JsonResponse
    {
        $this->employeeService->deleteInfraction($id, $infractionId);

        return $this->successResponse(message: 'تخلف با موفقیت حذف شد.');
    }

    // ── Import ─────────────────────────────────────────

    /**
     * Legacy import (direct CSV upload).
     */
    public function import(ImportEmployeeRequest $request): JsonResponse
    {
        $importHistory = $this->employeeImportService->import(
            $request->file('file'),
            $request->user()->id
        );

        return $this->createdResponse(
            $importHistory,
            'عملیات ورود اطلاعات با موفقیت انجام شد.'
        );
    }

    /**
     * Get import history list.
     */
    public function importHistory(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 20);
        $history = $this->employeeImportService->getHistory($perPage);

        return $this->successResponse($history);
    }

    /**
     * Get import history detail.
     */
    public function importHistoryDetail(int $historyId): JsonResponse
    {
        $detail = $this->employeeImportService->getHistoryDetail($historyId);

        return $this->successResponse($detail);
    }

    /**
     * Download import template.
     */
    public function importTemplate(): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        return $this->employeeImportService->generateTemplate();
    }

    /**
     * Stage import: upload XLSX, parse, validate, write to temp.
     */
    public function importStage(ImportStageRequest $request): JsonResponse
    {
        $importHistory = $this->employeeImportService->stage(
            $request->file('file'),
            $request->user()->id
        );

        return $this->createdResponse(
            $importHistory,
            'فایل با موفقیت بارگذاری و پردازش شد. لطفاً نتایج را بررسی کنید.'
        );
    }

    /**
     * Preview staged import data.
     */
    public function importPreview(int $importId): JsonResponse
    {
        $preview = $this->employeeImportService->preview($importId);

        return $this->successResponse($preview);
    }

    /**
     * Apply staged import.
     */
    public function importApply(ImportApplyRequest $request, int $importId): JsonResponse
    {
        $result = $this->employeeImportService->apply(
            $importId,
            $request->validated()['import_mode'],
            $request->validated()['selected_fields'] ?? null
        );

        return $this->successResponse($result, 'عملیات ورود اطلاعات با موفقیت انجام شد.');
    }

    /**
     * Sync employees from HR system (placeholder).
     */
    public function sync(Request $request): JsonResponse
    {
        return $this->successResponse(
            message: 'همگام‌سازی با سیستم منابع انسانی هنوز پیاده‌سازی نشده است.'
        );
    }
}
