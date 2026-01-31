<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Prescription\StorePrescriptionRequest;
use App\Http\Requests\Prescription\UpdatePrescriptionRequest;
use App\Http\Resources\PrescriptionResource;
use App\Services\PrescriptionService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly PrescriptionService $prescriptionService
    ) {}

    /**
     * Display a paginated list of prescriptions.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'employee_id',
            'doctor_id',
            'center_id',
            'status',
            'date_from',
            'date_to',
            'search',
        ]);

        $perPage = (int) $request->query('per_page', 15);

        $prescriptions = $this->prescriptionService->list($filters, $perPage);

        return $this->paginatedResponse(
            PrescriptionResource::collection($prescriptions)
        );
    }

    /**
     * Store a newly created prescription.
     */
    public function store(StorePrescriptionRequest $request): JsonResponse
    {
        $prescription = $this->prescriptionService->create($request->validated());

        return $this->createdResponse(
            new PrescriptionResource($prescription),
            'نسخه با موفقیت ایجاد شد.'
        );
    }

    /**
     * Display the specified prescription.
     */
    public function show(int $id): JsonResponse
    {
        $prescription = $this->prescriptionService->find($id);

        return $this->successResponse(
            new PrescriptionResource($prescription)
        );
    }

    /**
     * Update the specified prescription.
     */
    public function update(UpdatePrescriptionRequest $request, int $id): JsonResponse
    {
        $prescription = $this->prescriptionService->find($id);
        $prescription = $this->prescriptionService->update($prescription, $request->validated());

        return $this->successResponse(
            new PrescriptionResource($prescription),
            'نسخه با موفقیت به‌روزرسانی شد.'
        );
    }

    /**
     * Cancel the specified prescription.
     */
    public function destroy(int $id): JsonResponse
    {
        $prescription = $this->prescriptionService->find($id);
        $this->prescriptionService->cancel($prescription);

        return $this->successResponse(
            message: 'نسخه با موفقیت لغو شد.'
        );
    }
}
