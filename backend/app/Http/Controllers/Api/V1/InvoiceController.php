<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoice\StoreInvoiceRequest;
use App\Http\Requests\Invoice\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Services\InvoiceService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly InvoiceService $invoiceService
    ) {}

    /**
     * Display a paginated list of invoices.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'employee_id',
            'center_id',
            'status',
            'date_from',
            'date_to',
            'search',
        ]);

        $perPage = (int) $request->query('per_page', 15);

        $invoices = $this->invoiceService->list($filters, $perPage);

        return $this->paginatedResponse(
            InvoiceResource::collection($invoices)
        );
    }

    /**
     * Store a newly created invoice.
     */
    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $invoice = $this->invoiceService->create($request->validated());

        return $this->createdResponse(
            new InvoiceResource($invoice),
            'صورتحساب با موفقیت ایجاد شد.'
        );
    }

    /**
     * Display the specified invoice.
     */
    public function show(int $id): JsonResponse
    {
        $invoice = $this->invoiceService->find($id);

        return $this->successResponse(
            new InvoiceResource($invoice)
        );
    }

    /**
     * Update the specified invoice.
     */
    public function update(UpdateInvoiceRequest $request, int $id): JsonResponse
    {
        $invoice = $this->invoiceService->find($id);
        $invoice = $this->invoiceService->update($invoice, $request->validated());

        return $this->successResponse(
            new InvoiceResource($invoice),
            'صورتحساب با موفقیت به‌روزرسانی شد.'
        );
    }

    /**
     * Remove the specified invoice (soft delete).
     */
    public function destroy(int $id): JsonResponse
    {
        $invoice = $this->invoiceService->find($id);
        $this->invoiceService->delete($invoice);

        return $this->successResponse(
            message: 'صورتحساب با موفقیت حذف شد.'
        );
    }

    /**
     * Calculate pricing for the specified invoice.
     */
    public function calculate(int $id): JsonResponse
    {
        $invoice = $this->invoiceService->calculate($id);

        return $this->successResponse(
            new InvoiceResource($invoice),
            'محاسبه صورتحساب انجام شد.'
        );
    }

    /**
     * Submit the specified invoice.
     */
    public function submit(int $id): JsonResponse
    {
        $invoice = $this->invoiceService->submit($id);

        return $this->successResponse(
            new InvoiceResource($invoice),
            'صورتحساب با موفقیت ارسال شد.'
        );
    }
}
