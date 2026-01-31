<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InstitutionContractResource extends JsonResource
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
            'contract_number' => $this->contract_number,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'discount_percentage' => $this->discount_percentage,
            'max_amount' => $this->max_amount,
            'terms' => $this->terms,
            'is_active' => $this->is_active,

            // Conditional relations
            'center' => $this->whenLoaded('center', fn () => [
                'id' => $this->center->id,
                'name' => $this->center->name,
                'code' => $this->center->code,
            ]),
            'contractType' => $this->whenLoaded('contractType', fn () => [
                'id' => $this->contractType->id,
                'name' => $this->contractType->name,
                'code' => $this->contractType->code,
            ]),
        ];
    }
}
