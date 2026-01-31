<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IllnessResource extends JsonResource
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
            'icd_code' => $this->icd_code,
            'name' => $this->name,
            'name_en' => $this->name_en,
            'category' => $this->category,
            'is_chronic' => $this->is_chronic,
            'is_active' => $this->is_active,

            // Conditional relations
            'parent' => $this->whenLoaded('parent', fn () => [
                'id' => $this->parent->id,
                'icd_code' => $this->parent->icd_code,
                'name' => $this->parent->name,
            ]),
            'children' => IllnessResource::collection($this->whenLoaded('children')),
        ];
    }
}
