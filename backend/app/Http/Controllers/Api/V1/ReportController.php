<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClaimResource;
use App\Services\ReportService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly ReportService $reportService
    ) {}

    /**
     * Get dashboard summary statistics.
     */
    public function dashboard(): JsonResponse
    {
        $data = $this->reportService->dashboard();

        return $this->successResponse($data, 'اطلاعات داشبورد با موفقیت دریافت شد.');
    }

    /**
     * Get paginated claims report with filters.
     */
    public function claims(Request $request): JsonResponse
    {
        $filters = $request->only([
            'status',
            'claim_type',
            'date_from',
            'date_to',
            'employee_id',
            'center_id',
            'min_amount',
            'max_amount',
        ]);

        $claims = $this->reportService->claimsReport($filters);

        return $this->paginatedResponse(
            ClaimResource::collection($claims)
        );
    }

    /**
     * Get financial report with filters.
     */
    public function financial(Request $request): JsonResponse
    {
        $filters = $request->only([
            'date_from',
            'date_to',
            'center_id',
            'status',
        ]);

        $data = $this->reportService->financialReport($filters);

        return $this->successResponse($data, 'گزارش مالی با موفقیت دریافت شد.');
    }
}
