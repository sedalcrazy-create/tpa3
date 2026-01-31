<?php

namespace App\Services;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Services\Pricing\PricingService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class InvoiceService
{
    public function __construct(
        private readonly PricingService $pricingService
    ) {}

    /**
     * Get paginated list of invoices with optional filters.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Invoice::query();

        // Filter by employee
        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
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
            $query->where('invoice_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('invoice_date', '<=', $filters['date_to']);
        }

        // Search by invoice_number
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('invoice_number', 'like', "%{$search}%");
        }

        // Eager load relations
        $query->with([
            'employee',
            'center',
            'prescription',
        ]);

        // Order by invoice_date desc
        $query->orderBy('invoice_date', 'desc');

        return $query->paginate($perPage);
    }

    /**
     * Find an invoice by ID with all relations loaded.
     *
     * @param int $id
     * @return Invoice
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function find(int $id): Invoice
    {
        return Invoice::with([
            'employee',
            'center',
            'prescription',
            'items.item',
            'items.bodyPart',
            'items.itemPrice',
            'items.appliedCondition',
            'claim',
            'createdByUser',
        ])->findOrFail($id);
    }

    /**
     * Create a new invoice with its items.
     *
     * @param array<string, mixed> $data
     * @return Invoice
     */
    public function create(array $data): Invoice
    {
        // Generate unique invoice number
        $data['invoice_number'] = 'INV-' . date('Ymd') . '-' . str_pad(random_int(1, 99999), 5, '0', STR_PAD_LEFT);

        // Set created_by to authenticated user
        $data['created_by'] = Auth::id();

        // Extract items before creating invoice
        $items = $data['items'];
        unset($data['items']);

        // Create the invoice
        $invoice = Invoice::create($data);

        // Create invoice items
        foreach ($items as $itemData) {
            $invoice->items()->create([
                'item_id' => $itemData['item_id'],
                'quantity' => $itemData['quantity'],
                'unit_price' => $itemData['unit_price'] ?? null,
                'body_part_id' => $itemData['body_part_id'] ?? null,
            ]);
        }

        return $invoice->load([
            'employee',
            'center',
            'prescription',
            'items.item',
            'items.bodyPart',
            'createdByUser',
        ]);
    }

    /**
     * Update an existing invoice and optionally its items.
     *
     * @param Invoice $invoice
     * @param array<string, mixed> $data
     * @return Invoice
     */
    public function update(Invoice $invoice, array $data): Invoice
    {
        // Extract items if provided
        $items = $data['items'] ?? null;
        unset($data['items']);

        // Update invoice fields
        $invoice->update($data);

        // If items provided, delete old items and create new ones
        if ($items !== null) {
            $invoice->items()->delete();

            foreach ($items as $itemData) {
                $invoice->items()->create([
                    'item_id' => $itemData['item_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'] ?? null,
                    'body_part_id' => $itemData['body_part_id'] ?? null,
                ]);
            }
        }

        return $invoice->load([
            'employee',
            'center',
            'prescription',
            'items.item',
            'items.bodyPart',
            'createdByUser',
        ]);
    }

    /**
     * Soft delete an invoice.
     *
     * @param Invoice $invoice
     * @return void
     */
    public function delete(Invoice $invoice): void
    {
        $invoice->delete();
    }

    /**
     * Calculate pricing for all items in an invoice.
     *
     * @param int $invoiceId
     * @return Invoice
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function calculate(int $invoiceId): Invoice
    {
        $invoice = Invoice::with(['items.item', 'employee'])->findOrFail($invoiceId);

        // Build items array for PricingService
        $pricingItems = [];
        foreach ($invoice->items as $invoiceItem) {
            $pricingItems[] = [
                'item_id' => $invoiceItem->item_id,
                'quantity' => $invoiceItem->quantity,
                'unit_price' => $invoiceItem->unit_price,
                'body_part_id' => $invoiceItem->body_part_id,
            ];
        }

        // Calculate via PricingService
        $result = $this->pricingService->calculateInvoice(
            $pricingItems,
            $invoice->employee
        );

        // Update each invoice item with pricing results
        foreach ($invoice->items as $index => $invoiceItem) {
            if (!isset($result['items'][$index])) {
                continue;
            }

            $itemResult = $result['items'][$index];

            $invoiceItem->update([
                'total_price' => $invoiceItem->unit_price
                    ? $invoiceItem->unit_price * $invoiceItem->quantity
                    : $itemResult['total_price'],
                'insurance_share' => $itemResult['insurance_share'],
                'patient_share' => $itemResult['patient_share'],
                'coverage_percentage' => $itemResult['coverage_percentage'],
                'discount_amount' => $itemResult['discount_amount'],
                'deduction_amount' => $itemResult['deduction_amount'],
                'deduction_reason' => !empty($itemResult['deduction_reasons'])
                    ? implode(' | ', $itemResult['deduction_reasons'])
                    : null,
                'is_covered' => $itemResult['is_covered'],
                'applied_condition_id' => $itemResult['applied_condition_id'],
                'pricing_details' => $itemResult['pricing_details'],
            ]);
        }

        // Refresh items to get updated values
        $invoice->load('items');

        // Update invoice totals
        $invoice->update([
            'total_amount' => $invoice->items->sum('total_price'),
            'insurance_share' => $invoice->items->sum('insurance_share'),
            'patient_share' => $invoice->items->sum('patient_share'),
            'discount_amount' => $invoice->items->sum('discount_amount'),
            'deduction_amount' => $invoice->items->sum('deduction_amount'),
            'status' => InvoiceStatus::Calculated,
            'calculated_at' => now(),
        ]);

        return $invoice->load([
            'employee',
            'center',
            'prescription',
            'items.item',
            'items.bodyPart',
            'items.itemPrice',
            'items.appliedCondition',
            'claim',
            'createdByUser',
        ]);
    }

    /**
     * Submit an invoice.
     *
     * @param int $invoiceId
     * @return Invoice
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function submit(int $invoiceId): Invoice
    {
        $invoice = Invoice::findOrFail($invoiceId);

        $invoice->update([
            'status' => InvoiceStatus::Submitted,
            'submitted_at' => now(),
        ]);

        return $invoice->load([
            'employee',
            'center',
            'prescription',
            'items.item',
            'items.bodyPart',
            'items.itemPrice',
            'items.appliedCondition',
            'claim',
            'createdByUser',
        ]);
    }
}
