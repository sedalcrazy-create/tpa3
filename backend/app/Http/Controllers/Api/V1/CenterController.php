<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Center\StoreCenterRequest;
use App\Http\Requests\Center\StoreDoctorRequest;
use App\Http\Requests\Center\UpdateCenterRequest;
use App\Http\Resources\CenterResource;
use App\Http\Resources\DoctorResource;
use App\Http\Resources\InstitutionContractResource;
use App\Services\CenterService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CenterController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly CenterService $centerService
    ) {}

    /**
     * Display a paginated list of centers.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'center_type',
            'province_id',
            'is_contracted',
            'is_active',
        ]);

        $perPage = (int) $request->query('per_page', 15);

        $centers = $this->centerService->list($filters, $perPage);

        return $this->paginatedResponse(
            CenterResource::collection($centers)
        );
    }

    /**
     * Store a newly created center.
     */
    public function store(StoreCenterRequest $request): JsonResponse
    {
        $center = $this->centerService->create($request->validated());

        return $this->createdResponse(
            new CenterResource($center),
            'مرکز درمانی با موفقیت ایجاد شد.'
        );
    }

    /**
     * Display the specified center.
     */
    public function show(int $id): JsonResponse
    {
        $center = $this->centerService->find($id);

        return $this->successResponse(
            new CenterResource($center)
        );
    }

    /**
     * Update the specified center.
     */
    public function update(UpdateCenterRequest $request, int $id): JsonResponse
    {
        $center = $this->centerService->find($id);
        $center = $this->centerService->update($center, $request->validated());

        return $this->successResponse(
            new CenterResource($center),
            'اطلاعات مرکز درمانی با موفقیت به‌روزرسانی شد.'
        );
    }

    /**
     * Remove the specified center (soft delete).
     */
    public function destroy(int $id): JsonResponse
    {
        $center = $this->centerService->find($id);
        $this->centerService->delete($center);

        return $this->successResponse(
            message: 'مرکز درمانی با موفقیت حذف شد.'
        );
    }

    /**
     * List doctors for a specific center.
     */
    public function doctors(Request $request, int $centerId): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);

        $doctors = $this->centerService->listDoctors($centerId, $perPage);

        return $this->paginatedResponse(
            DoctorResource::collection($doctors)
        );
    }

    /**
     * Add a new doctor.
     */
    public function addDoctor(StoreDoctorRequest $request): JsonResponse
    {
        $doctor = $this->centerService->addDoctor($request->validated());

        return $this->createdResponse(
            new DoctorResource($doctor),
            'پزشک با موفقیت ایجاد شد.'
        );
    }

    /**
     * List contracts for a specific center.
     */
    public function contracts(int $centerId): JsonResponse
    {
        $contracts = $this->centerService->listContracts($centerId);

        return $this->successResponse(
            InstitutionContractResource::collection($contracts)
        );
    }
}
