<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settlement\StoreAggregationRequest;
use App\Http\Resources\InvoiceAggregationResource;
use App\Services\SettlementService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettlementController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly SettlementService $settlementService
    ) {}

    /**
     * Display a paginated list of invoice aggregations.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'center_id',
            'contract_id',
            'status',
            'date_from',
            'date_to',
        ]);

        $perPage = (int) $request->query('per_page', 15);

        $aggregations = $this->settlementService->list($filters, $perPage);

        return $this->paginatedResponse(
            InvoiceAggregationResource::collection($aggregations)
        );
    }

    /**
     * Display the specified invoice aggregation.
     */
    public function show(int $id): JsonResponse
    {
        $aggregation = $this->settlementService->find($id);

        return $this->successResponse(
            new InvoiceAggregationResource($aggregation)
        );
    }

    /**
     * Create a new invoice aggregation.
     */
    public function aggregate(StoreAggregationRequest $request): JsonResponse
    {
        $aggregation = $this->settlementService->aggregate($request->validated());

        return $this->createdResponse(
            new InvoiceAggregationResource($aggregation),
            'تجمیع فاکتورها با موفقیت انجام شد.'
        );
    }

    /**
     * Approve an invoice aggregation.
     */
    public function approve(int $id): JsonResponse
    {
        $aggregation = $this->settlementService->approve($id);

        return $this->successResponse(
            new InvoiceAggregationResource($aggregation),
            'تجمیع فاکتور با موفقیت تأیید شد.'
        );
    }

    /**
     * Mark an invoice aggregation as paid.
     */
    public function markPaid(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
        ], [
            'amount.required' => 'مبلغ پرداختی الزامی است.',
            'amount.numeric' => 'مبلغ پرداختی باید عدد باشد.',
            'amount.min' => 'مبلغ پرداختی نباید منفی باشد.',
        ]);

        $aggregation = $this->settlementService->markPaid($id, (float) $validated['amount']);

        return $this->successResponse(
            new InvoiceAggregationResource($aggregation),
            'تجمیع فاکتور با موفقیت به عنوان پرداخت شده ثبت شد.'
        );
    }
}
