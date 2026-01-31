<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceAggregation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;

class SettlementService
{
    /**
     * Get paginated list of invoice aggregations with optional filters.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = InvoiceAggregation::query();

        // Filter by center_id
        if (!empty($filters['center_id'])) {
            $query->where('center_id', $filters['center_id']);
        }

        // Filter by contract_id
        if (!empty($filters['contract_id'])) {
            $query->where('contract_id', $filters['contract_id']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by date range
        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        // Eager load relations
        $query->with(['center', 'contract']);

        // Order by created_at descending
        $query->orderBy('created_at', 'desc');

        return $query->paginate($perPage);
    }

    /**
     * Find an invoice aggregation by ID with all relations loaded.
     *
     * @param int $id
     * @return InvoiceAggregation
     *
     * @throws ModelNotFoundException
     */
    public function find(int $id): InvoiceAggregation
    {
        return InvoiceAggregation::with([
            'center',
            'contract',
            'approvedByUser',
        ])->findOrFail($id);
    }

    /**
     * Create an invoice aggregation for a center within a date period.
     *
     * @param array<string, mixed> $data
     * @return InvoiceAggregation
     */
    public function aggregate(array $data): InvoiceAggregation
    {
        // Generate aggregation number
        $aggregationNumber = 'AGG-' . date('Ymd') . '-' . str_pad(random_int(1, 99999), 5, '0', STR_PAD_LEFT);

        // Query invoices for this center within the period with status 'approved'
        $invoicesQuery = Invoice::where('center_id', $data['center_id'])
            ->whereBetween('invoice_date', [$data['period_start'], $data['period_end']])
            ->where('status', 'approved');

        // Calculate aggregation values
        $totalInvoices = $invoicesQuery->count();
        $totalAmount = (float) $invoicesQuery->sum('total_amount');
        $approvedAmount = (float) $invoicesQuery->sum('insurance_share');
        $deductionAmount = (float) $invoicesQuery->sum('deduction_amount');

        // Create the aggregation record
        $aggregation = InvoiceAggregation::create([
            'aggregation_number' => $aggregationNumber,
            'center_id' => $data['center_id'],
            'contract_id' => $data['contract_id'] ?? null,
            'period_start' => $data['period_start'],
            'period_end' => $data['period_end'],
            'total_invoices' => $totalInvoices,
            'total_amount' => $totalAmount,
            'approved_amount' => $approvedAmount,
            'deduction_amount' => $deductionAmount,
            'paid_amount' => 0,
            'status' => 'pending',
            'notes' => $data['notes'] ?? null,
        ]);

        return $aggregation->load(['center', 'contract', 'approvedByUser']);
    }

    /**
     * Approve an invoice aggregation.
     *
     * @param int $id
     * @return InvoiceAggregation
     *
     * @throws ModelNotFoundException
     */
    public function approve(int $id): InvoiceAggregation
    {
        $aggregation = InvoiceAggregation::findOrFail($id);

        $aggregation->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return $aggregation->load(['center', 'contract', 'approvedByUser']);
    }

    /**
     * Mark an invoice aggregation as paid.
     *
     * @param int $id
     * @param float $amount
     * @return InvoiceAggregation
     *
     * @throws ModelNotFoundException
     */
    public function markPaid(int $id, float $amount): InvoiceAggregation
    {
        $aggregation = InvoiceAggregation::findOrFail($id);

        $aggregation->update([
            'status' => 'paid',
            'paid_amount' => $amount,
            'paid_at' => now(),
        ]);

        return $aggregation->load(['center', 'contract', 'approvedByUser']);
    }
}
