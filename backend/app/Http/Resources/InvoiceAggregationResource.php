<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceAggregationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'aggregation_number' => $this->aggregation_number,
            'period_start' => $this->period_start?->toDateString(),
            'period_end' => $this->period_end?->toDateString(),
            'total_invoices' => $this->total_invoices,
            'total_amount' => $this->total_amount,
            'approved_amount' => $this->approved_amount,
            'deduction_amount' => $this->deduction_amount,
            'paid_amount' => $this->paid_amount,
            'status' => $this->status,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'notes' => $this->notes,

            // Conditional relations
            'center' => $this->whenLoaded('center', fn () => [
                'id' => $this->center->id,
                'name' => $this->center->name,
                'code' => $this->center->code,
            ]),
            'contract' => $this->whenLoaded('contract', fn () => [
                'id' => $this->contract->id,
                'contract_number' => $this->contract->contract_number,
                'title' => $this->contract->title,
            ]),
            'approvedByUser' => $this->whenLoaded('approvedByUser', fn () => [
                'id' => $this->approvedByUser->id,
                'name' => $this->approvedByUser->name,
            ]),

            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
