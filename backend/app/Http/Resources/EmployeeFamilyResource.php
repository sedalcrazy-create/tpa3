<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeFamilyResource extends JsonResource
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
            'personnel_code' => $this->personnel_code,
            'national_code' => $this->national_code,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'gender' => [
                'value' => $this->gender?->value,
                'label' => $this->gender?->label(),
            ],
            'birth_date' => $this->birth_date?->toDateString(),
            'birth_date_jalali' => $this->birth_date_jalali,
            'relation_type' => $this->whenLoaded('relationType', fn () => [
                'id' => $this->relationType->id,
                'title' => $this->relationType->title,
                'code' => $this->relationType->code,
            ]),
            'status' => [
                'value' => $this->status?->value,
                'label' => $this->status?->label(),
            ],
            'is_active' => $this->is_active,
        ];
    }
}
