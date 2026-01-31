<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionResource extends JsonResource
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
            'prescription_number' => $this->prescription_number,
            'prescription_date' => $this->prescription_date?->toDateString(),
            'prescription_date_jalali' => $this->prescription_date_jalali,
            'diagnosis_code' => $this->diagnosis_code,
            'notes' => $this->notes,
            'is_emergency' => $this->is_emergency,
            'is_chronic' => $this->is_chronic,
            'status' => $this->status,

            // Conditional relations
            'employee' => $this->whenLoaded('employee', fn () => [
                'id' => $this->employee->id,
                'full_name' => $this->employee->full_name,
                'personnel_code' => $this->employee->personnel_code,
                'national_code' => $this->employee->national_code,
            ]),
            'doctor' => $this->whenLoaded('doctor', fn () => [
                'id' => $this->doctor->id,
                'full_name' => $this->doctor->full_name,
                'specialty' => $this->doctor->specialty,
                'medical_council_code' => $this->doctor->medical_council_code,
            ]),
            'center' => $this->whenLoaded('center', fn () => [
                'id' => $this->center->id,
                'name' => $this->center->name,
                'code' => $this->center->code,
            ]),
            'prescription_type' => $this->whenLoaded('prescriptionType', fn () => [
                'id' => $this->prescriptionType->id,
                'name' => $this->prescriptionType->name,
                'code' => $this->prescriptionType->code,
            ]),
            'illness' => $this->whenLoaded('illness', fn () => [
                'id' => $this->illness->id,
                'icd_code' => $this->illness->icd_code,
                'name' => $this->illness->name,
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
