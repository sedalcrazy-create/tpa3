<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
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
            'name' => $this->name,
            'generic_name' => $this->generic_name,
            'code' => $this->code,
            'item_type' => $this->item_type,
            'unit' => $this->unit,
            'dosage_form' => $this->dosage_form,
            'strength' => $this->strength,
            'manufacturer' => $this->manufacturer,
            'country' => $this->country,
            'is_otc' => $this->is_otc,
            'is_covered' => $this->is_covered,
            'is_active' => $this->is_active,
            'description' => $this->description,

            // Conditional relations
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'code' => $this->category->code,
            ]),
            'sub_category' => $this->whenLoaded('subCategory', fn () => [
                'id' => $this->subCategory->id,
                'name' => $this->subCategory->name,
                'code' => $this->subCategory->code,
            ]),
            'group' => $this->whenLoaded('group', fn () => [
                'id' => $this->group->id,
                'name' => $this->group->name,
                'code' => $this->group->code,
            ]),
            'current_price' => $this->whenLoaded('currentPrice', fn () => [
                'id' => $this->currentPrice->id,
                'price' => $this->currentPrice->price,
                'insurance_share_percentage' => $this->currentPrice->insurance_share_percentage,
                'patient_share_percentage' => $this->currentPrice->patient_share_percentage,
                'effective_from' => $this->currentPrice->effective_from?->toDateString(),
                'effective_to' => $this->currentPrice->effective_to?->toDateString(),
                'price_type' => $this->currentPrice->price_type,
            ]),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
