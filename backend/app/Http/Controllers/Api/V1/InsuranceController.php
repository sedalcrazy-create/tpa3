<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Insurance\StoreInsuranceRequest;
use App\Http\Requests\Insurance\UpdateInsuranceRequest;
use App\Http\Resources\InsuranceResource;
use App\Services\InsuranceService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InsuranceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly InsuranceService $insuranceService
    ) {}

    /**
     * Display a listing of insurances.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['employee_id', 'status', 'is_active', 'search']);
        $perPage = $request->integer('per_page', 15);

        $insurances = $this->insuranceService->list($filters, $perPage);

        return $this->paginatedResponse(
            InsuranceResource::collection($insurances)
        );
    }

    /**
     * Store a newly created insurance.
     */
    public function store(StoreInsuranceRequest $request): JsonResponse
    {
        $insurance = $this->insuranceService->create($request->validated());

        return $this->createdResponse(
            new InsuranceResource($insurance),
            'بیمه با موفقیت ایجاد شد.'
        );
    }

    /**
     * Display the specified insurance.
     */
    public function show(int $id): JsonResponse
    {
        $insurance = $this->insuranceService->find($id);

        return $this->successResponse(
            new InsuranceResource($insurance)
        );
    }

    /**
     * Update the specified insurance.
     */
    public function update(UpdateInsuranceRequest $request, int $id): JsonResponse
    {
        $insurance = $this->insuranceService->find($id);
        $updated = $this->insuranceService->update($insurance, $request->validated());

        return $this->successResponse(
            new InsuranceResource($updated),
            'بیمه با موفقیت به‌روزرسانی شد.'
        );
    }

    /**
     * Remove the specified insurance.
     */
    public function destroy(int $id): JsonResponse
    {
        $insurance = $this->insuranceService->find($id);
        $this->insuranceService->delete($insurance);

        return $this->successResponse(
            message: 'بیمه با موفقیت حذف شد.'
        );
    }

    /**
     * Inquiry insurance status by national code.
     */
    public function inquiry(Request $request): JsonResponse
    {
        $request->validate([
            'national_code' => ['required', 'string'],
        ], [
            'national_code.required' => 'کد ملی الزامی است.',
            'national_code.string' => 'کد ملی باید رشته باشد.',
        ]);

        $result = $this->insuranceService->inquiry($request->input('national_code'));

        return $this->successResponse($result, 'استعلام بیمه با موفقیت انجام شد.');
    }

    /**
     * Check insurance ceiling for a given amount.
     */
    public function checkCeiling(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
        ], [
            'amount.required' => 'مبلغ الزامی است.',
            'amount.numeric' => 'مبلغ باید عددی باشد.',
            'amount.min' => 'مبلغ نمی‌تواند منفی باشد.',
        ]);

        $result = $this->insuranceService->checkCeiling($id, (float) $request->input('amount'));

        return $this->successResponse($result, 'بررسی سقف بیمه با موفقیت انجام شد.');
    }
}
