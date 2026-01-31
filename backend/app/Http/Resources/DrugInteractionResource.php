<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DrugInteractionResource extends JsonResource
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
            'severity' => $this->severity,
            'description' => $this->description,
            'recommendation' => $this->recommendation,
            'is_active' => $this->is_active,
            'item1' => [
                'id' => $this->item1->id,
                'name' => $this->item1->name,
                'code' => $this->item1->code,
            ],
            'item2' => [
                'id' => $this->item2->id,
                'name' => $this->item2->name,
                'code' => $this->item2->code,
            ],
        ];
    }
}
