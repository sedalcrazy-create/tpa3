<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
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
            'invoice_number' => $this->invoice_number,
            'invoice_date' => $this->invoice_date?->toDateString(),
            'invoice_date_jalali' => $this->invoice_date_jalali,
            'total_amount' => $this->total_amount,
            'insurance_share' => $this->insurance_share,
            'patient_share' => $this->patient_share,
            'discount_amount' => $this->discount_amount,
            'deduction_amount' => $this->deduction_amount,
            'paid_amount' => $this->paid_amount,
            'status' => [
                'value' => $this->status?->value,
                'label' => $this->status?->label(),
            ],
            'calculated_at' => $this->calculated_at?->toIso8601String(),
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'notes' => $this->notes,

            // Conditional relations
            'employee' => $this->whenLoaded('employee', fn () => [
                'id' => $this->employee->id,
                'full_name' => $this->employee->full_name,
                'personnel_code' => $this->employee->personnel_code,
            ]),
            'prescription' => $this->whenLoaded('prescription', fn () => [
                'id' => $this->prescription->id,
                'prescription_number' => $this->prescription->prescription_number,
            ]),
            'center' => $this->whenLoaded('center', fn () => [
                'id' => $this->center->id,
                'name' => $this->center->name,
                'code' => $this->center->code,
            ]),
            'items' => InvoiceItemResource::collection($this->whenLoaded('items')),
            'claim' => $this->whenLoaded('claim', fn () => [
                'id' => $this->claim->id,
                'claim_number' => $this->claim->claim_number,
                'status' => $this->claim->status,
            ]),
            'created_by_user' => $this->whenLoaded('createdByUser', fn () => [
                'id' => $this->createdByUser->id,
                'name' => $this->createdByUser->name,
            ]),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
