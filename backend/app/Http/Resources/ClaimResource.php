<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClaimResource extends JsonResource
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
            'claim_number' => $this->claim_number,
            'claim_type' => $this->claim_type,
            'status' => [
                'value' => $this->status?->value,
                'label' => $this->status?->label(),
            ],
            'total_amount' => $this->total_amount,
            'approved_amount' => $this->approved_amount,
            'paid_amount' => $this->paid_amount,
            'deduction_amount' => $this->deduction_amount,

            'admission_date' => $this->admission_date?->toDateString(),
            'discharge_date' => $this->discharge_date?->toDateString(),
            'admission_date_jalali' => $this->admission_date_jalali,
            'discharge_date_jalali' => $this->discharge_date_jalali,

            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'checked_at' => $this->checked_at?->toIso8601String(),
            'confirmed_at' => $this->confirmed_at?->toIso8601String(),
            'settled_at' => $this->settled_at?->toIso8601String(),
            'notes' => $this->notes,

            // Conditional relations
            'employee' => $this->whenLoaded('employee', fn () => [
                'id' => $this->employee->id,
                'full_name' => $this->employee->full_name,
                'personnel_code' => $this->employee->personnel_code,
                'national_code' => $this->employee->national_code,
            ]),
            'invoice' => $this->whenLoaded('invoice', fn () => [
                'id' => $this->invoice->id,
                'invoice_number' => $this->invoice->invoice_number,
                'total_amount' => $this->invoice->total_amount,
                'status' => $this->invoice->status,
            ]),
            'checkedByUser' => $this->whenLoaded('checkedByUser', fn () => [
                'id' => $this->checkedByUser->id,
                'name' => $this->checkedByUser->name,
            ]),
            'confirmedByUser' => $this->whenLoaded('confirmedByUser', fn () => [
                'id' => $this->confirmedByUser->id,
                'name' => $this->confirmedByUser->name,
            ]),
            'createdByUser' => $this->whenLoaded('createdByUser', fn () => [
                'id' => $this->createdByUser->id,
                'name' => $this->createdByUser->name,
            ]),
            'claimNotes' => $this->whenLoaded('claimNotes', fn () =>
                ClaimNoteResource::collection($this->claimNotes)
            ),
            'attachments' => $this->whenLoaded('attachments', fn () =>
                ClaimAttachmentResource::collection($this->attachments)
            ),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
