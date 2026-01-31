<?php

namespace App\Services;

use App\Models\Claim;
use App\Models\Employee;
use App\Models\Invoice;
use App\Models\Insurance;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Get dashboard summary statistics.
     *
     * @return array<string, mixed>
     */
    public function dashboard(): array
    {
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        $totalEmployees = Employee::active()->count();
        $totalInsured = Insurance::active()->count();

        $totalClaimsThisMonth = Claim::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $totalClaimsPending = Claim::whereIn('status', [2, 3, 4, 5, 8])->count();

        $invoicesThisMonth = Invoice::whereBetween('created_at', [$startOfMonth, $endOfMonth]);
        $totalInvoicesThisMonth = (clone $invoicesThisMonth)->count();
        $totalAmountThisMonth = (clone $invoicesThisMonth)->sum('total_amount');
        $totalInsurancePaidThisMonth = (clone $invoicesThisMonth)->sum('insurance_share');

        $claimsByStatus = DB::table('claims')
            ->select(DB::raw('status, count(*) as count'))
            ->whereNull('deleted_at')
            ->groupBy('status')
            ->get();

        $claimsByType = DB::table('claims')
            ->select(DB::raw('claim_type, count(*) as count'))
            ->whereNull('deleted_at')
            ->groupBy('claim_type')
            ->get();

        $topCenters = DB::table('invoices')
            ->join('centers', 'invoices.center_id', '=', 'centers.id')
            ->select('centers.id as center_id', 'centers.name as center_name', DB::raw('count(invoices.id) as invoice_count'))
            ->whereBetween('invoices.created_at', [$startOfMonth, $endOfMonth])
            ->whereNull('invoices.deleted_at')
            ->groupBy('centers.id', 'centers.name')
            ->orderByDesc('invoice_count')
            ->limit(5)
            ->get();

        return [
            'total_employees' => $totalEmployees,
            'total_insured' => $totalInsured,
            'total_claims_this_month' => $totalClaimsThisMonth,
            'total_claims_pending' => $totalClaimsPending,
            'total_invoices_this_month' => $totalInvoicesThisMonth,
            'total_amount_this_month' => $totalAmountThisMonth,
            'total_insurance_paid_this_month' => $totalInsurancePaidThisMonth,
            'claims_by_status' => $claimsByStatus,
            'claims_by_type' => $claimsByType,
            'top_centers' => $topCenters,
        ];
    }

    /**
     * Get paginated claims report with filters.
     *
     * @param array<string, mixed> $filters
     * @return LengthAwarePaginator
     */
    public function claimsReport(array $filters): LengthAwarePaginator
    {
        $query = Claim::query()
            ->with(['employee', 'invoice.center']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['claim_type'])) {
            $query->where('claim_type', $filters['claim_type']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['center_id'])) {
            $query->whereHas('invoice', function ($q) use ($filters) {
                $q->where('center_id', $filters['center_id']);
            });
        }

        if (!empty($filters['min_amount'])) {
            $query->where('total_amount', '>=', $filters['min_amount']);
        }

        if (!empty($filters['max_amount'])) {
            $query->where('total_amount', '<=', $filters['max_amount']);
        }

        $query->orderBy('created_at', 'desc');

        return $query->paginate(20);
    }

    /**
     * Get financial report with filters.
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function financialReport(array $filters): array
    {
        $query = Invoice::query();

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['center_id'])) {
            $query->where('center_id', $filters['center_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $totalInvoices = (clone $query)->count();
        $totalAmount = (clone $query)->sum('total_amount');
        $totalInsuranceShare = (clone $query)->sum('insurance_share');
        $totalPatientShare = (clone $query)->sum('patient_share');
        $totalDeductions = (clone $query)->sum('deduction_amount');
        $totalDiscounts = (clone $query)->sum('discount_amount');

        // By center: top 20 centers by total amount
        $byCenter = DB::table('invoices')
            ->join('centers', 'invoices.center_id', '=', 'centers.id')
            ->select(
                'centers.id as center_id',
                'centers.name as center_name',
                DB::raw('count(invoices.id) as invoice_count'),
                DB::raw('sum(invoices.total_amount) as total_amount')
            )
            ->whereNull('invoices.deleted_at');

        if (!empty($filters['date_from'])) {
            $byCenter->where('invoices.created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $byCenter->where('invoices.created_at', '<=', $filters['date_to']);
        }
        if (!empty($filters['center_id'])) {
            $byCenter->where('invoices.center_id', $filters['center_id']);
        }
        if (!empty($filters['status'])) {
            $byCenter->where('invoices.status', $filters['status']);
        }

        $byCenter = $byCenter
            ->groupBy('centers.id', 'centers.name')
            ->orderByDesc('total_amount')
            ->limit(20)
            ->get();

        // By month: group by year-month
        $byMonth = DB::table('invoices')
            ->select(
                DB::raw('YEAR(invoices.created_at) as year'),
                DB::raw('MONTH(invoices.created_at) as month'),
                DB::raw('count(invoices.id) as invoice_count'),
                DB::raw('sum(invoices.total_amount) as total_amount'),
                DB::raw('sum(invoices.insurance_share) as insurance_share')
            )
            ->whereNull('invoices.deleted_at');

        if (!empty($filters['date_from'])) {
            $byMonth->where('invoices.created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $byMonth->where('invoices.created_at', '<=', $filters['date_to']);
        }
        if (!empty($filters['center_id'])) {
            $byMonth->where('invoices.center_id', $filters['center_id']);
        }
        if (!empty($filters['status'])) {
            $byMonth->where('invoices.status', $filters['status']);
        }

        $byMonth = $byMonth
            ->groupBy(DB::raw('YEAR(invoices.created_at)'), DB::raw('MONTH(invoices.created_at)'))
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        return [
            'total_invoices' => $totalInvoices,
            'total_amount' => $totalAmount,
            'total_insurance_share' => $totalInsuranceShare,
            'total_patient_share' => $totalPatientShare,
            'total_deductions' => $totalDeductions,
            'total_discounts' => $totalDiscounts,
            'by_center' => $byCenter,
            'by_month' => $byMonth,
        ];
    }
}
