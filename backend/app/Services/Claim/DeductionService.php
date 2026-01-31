<?php

namespace App\Services\Claim;

use App\Models\Claim;

class DeductionService
{
    /**
     * Apply deductions from invoice items to the claim.
     *
     * Sums all deduction_amounts from the invoice items and updates
     * the claim's deduction_amount and approved_amount accordingly.
     *
     * @param Claim $claim
     * @return Claim
     */
    public function applyDeductions(Claim $claim): Claim
    {
        $claim->load('invoice.items');

        $totalDeductions = 0;

        if ($claim->invoice && $claim->invoice->items) {
            $totalDeductions = $claim->invoice->items->sum('deduction_amount');
        }

        $claim->update([
            'deduction_amount' => $totalDeductions,
            'approved_amount' => $claim->total_amount - $totalDeductions,
        ]);

        return $claim;
    }
}
