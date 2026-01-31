<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\LookupService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LookupController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly LookupService $lookupService
    ) {}

    /**
     * Get all active provinces.
     */
    public function provinces(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->provinces()
        );
    }

    /**
     * Get all active relation types.
     */
    public function relationTypes(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->relationTypes()
        );
    }

    /**
     * Get all active guardianship types.
     */
    public function guardianshipTypes(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->guardianshipTypes()
        );
    }

    /**
     * Get all active custom employee codes.
     */
    public function customEmployeeCodes(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->customEmployeeCodes()
        );
    }

    /**
     * Get all active special employee types.
     */
    public function specialEmployeeTypes(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->specialEmployeeTypes()
        );
    }

    /**
     * Get all active locations with optional province filter.
     */
    public function locations(Request $request): JsonResponse
    {
        $filters = $request->only(['province_id']);

        return $this->successResponse(
            $this->lookupService->locations($filters)
        );
    }

    /**
     * Get all active prescription types.
     */
    public function prescriptionTypes(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->prescriptionTypes()
        );
    }

    /**
     * Get all active document types.
     */
    public function documentTypes(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->documentTypes()
        );
    }

    /**
     * Get all active body part types with their body parts.
     */
    public function bodyPartTypes(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->bodyPartTypes()
        );
    }

    /**
     * Get all active commission case types.
     */
    public function commissionCaseTypes(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->commissionCaseTypes()
        );
    }

    /**
     * Get all active institution contract types.
     */
    public function institutionContractTypes(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->institutionContractTypes()
        );
    }

    /**
     * Get all active item categories with sub-categories.
     */
    public function itemCategories(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->itemCategories()
        );
    }

    /**
     * Get all active item groups.
     */
    public function itemGroups(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->itemGroups()
        );
    }

    /**
     * Get all active marriage statuses.
     */
    public function marriageStatuses(): JsonResponse
    {
        return $this->successResponse(
            $this->lookupService->marriageStatuses()
        );
    }
}
