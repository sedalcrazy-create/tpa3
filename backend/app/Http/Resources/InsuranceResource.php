<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InsuranceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'insurance_number' => $this->insurance_number,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'start_date_jalali' => $this->start_date_jalali,
            'end_date_jalali' => $this->end_date_jalali,
            'status' => [
                'value' => $this->status?->value,
                'label' => $this->status?->label(),
            ],
            'basic_premium' => $this->basic_premium,
            'supplementary_premium' => $this->supplementary_premium,
            'annual_ceiling' => $this->annual_ceiling,
            'used_amount' => $this->used_amount,
            'remaining_amount' => $this->remaining_amount,
            'is_active' => $this->is_active,
            'employee' => $this->whenLoaded('employee', fn () => [
                'id' => $this->employee->id,
                'full_name' => $this->employee->full_name,
                'personnel_code' => $this->employee->personnel_code,
                'national_code' => $this->employee->national_code,
            ]),
            'histories' => $this->whenLoaded('histories', fn () =>
                InsuranceHistoryResource::collection($this->histories)
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
