<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DoctorResource extends JsonResource
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
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'national_code' => $this->national_code,
            'medical_council_code' => $this->medical_council_code,
            'specialty' => $this->specialty,
            'sub_specialty' => $this->sub_specialty,
            'phone' => $this->phone,
            'is_active' => $this->is_active,

            // Conditional relations
            'center' => $this->whenLoaded('center', fn () => [
                'id' => $this->center->id,
                'name' => $this->center->name,
                'code' => $this->center->code,
            ]),

            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
