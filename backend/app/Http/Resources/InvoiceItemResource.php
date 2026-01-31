<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceItemResource extends JsonResource
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
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'total_price' => $this->total_price,
            'insurance_share' => $this->insurance_share,
            'patient_share' => $this->patient_share,
            'coverage_percentage' => $this->coverage_percentage,
            'discount_amount' => $this->discount_amount,
            'deduction_amount' => $this->deduction_amount,
            'deduction_reason' => $this->deduction_reason,
            'is_covered' => $this->is_covered,
            'is_approved' => $this->is_approved,
            'rejection_reason' => $this->rejection_reason,
            'pricing_details' => $this->pricing_details,

            // Conditional relations
            'item' => $this->whenLoaded('item', fn () => [
                'id' => $this->item->id,
                'name' => $this->item->name,
                'code' => $this->item->code,
                'item_type' => $this->item->item_type,
            ]),
            'item_price' => $this->whenLoaded('itemPrice', fn () => [
                'id' => $this->itemPrice->id,
                'price' => $this->itemPrice->price,
            ]),
            'body_part' => $this->whenLoaded('bodyPart', fn () => [
                'id' => $this->bodyPart->id,
                'name' => $this->bodyPart->name,
                'code' => $this->bodyPart->code,
            ]),
            'applied_condition' => $this->whenLoaded('appliedCondition', fn () => [
                'id' => $this->appliedCondition->id,
                'name' => $this->appliedCondition->name,
                'code' => $this->appliedCondition->code,
            ]),
        ];
    }
}
