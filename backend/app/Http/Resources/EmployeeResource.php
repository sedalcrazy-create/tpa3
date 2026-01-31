<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
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
            'father_name' => $this->father_name,
            'gender' => [
                'value' => $this->gender?->value,
                'label' => $this->gender?->label(),
            ],
            'birth_date' => $this->birth_date?->toDateString(),
            'birth_date_jalali' => $this->birth_date_jalali,
            'id_number' => $this->id_number,
            'phone' => $this->phone,
            'mobile' => $this->mobile,
            'email' => $this->email,
            'address' => $this->address,
            'postal_code' => $this->postal_code,
            'status' => [
                'value' => $this->status?->value,
                'label' => $this->status?->label(),
            ],
            'employment_date' => $this->employment_date?->toDateString(),
            'employment_date_jalali' => $this->employment_date_jalali,
            'retirement_date' => $this->retirement_date?->toDateString(),
            'bank_account_number' => $this->bank_account_number,
            'iban' => $this->iban,
            'is_head_of_family' => $this->is_head_of_family,
            'is_active' => $this->is_active,
            'priority' => $this->priority,
            'description' => $this->description,
            'photo' => $this->photo,
            'branch_id' => $this->branch_id,
            'bazneshasegi_date' => $this->bazneshasegi_date,
            'hoghogh_branch_id' => $this->hoghogh_branch_id,

            // Conditional relations
            'province' => $this->whenLoaded('province', fn () => [
                'id' => $this->province->id,
                'name' => $this->province->name,
            ]),
            'location' => $this->whenLoaded('location', fn () => [
                'id' => $this->location->id,
                'name' => $this->location->name,
                'code' => $this->location->code,
            ]),
            'custom_employee_code' => $this->whenLoaded('customEmployeeCode', fn () => [
                'id' => $this->customEmployeeCode->id,
                'code' => $this->customEmployeeCode->code,
                'title' => $this->customEmployeeCode->title,
            ]),
            'special_employee_type' => $this->whenLoaded('specialEmployeeType', fn () => [
                'id' => $this->specialEmployeeType->id,
                'code' => $this->specialEmployeeType->code,
                'title' => $this->specialEmployeeType->title,
            ]),
            'relation_type' => $this->whenLoaded('relationType', fn () => [
                'id' => $this->relationType->id,
                'code' => $this->relationType->code,
                'title' => $this->relationType->title,
            ]),
            'guardianship_type' => $this->whenLoaded('guardianshipType', fn () => [
                'id' => $this->guardianshipType->id,
                'code' => $this->guardianshipType->code,
                'title' => $this->guardianshipType->title,
            ]),
            'marriage_status' => $this->whenLoaded('marriageStatus', fn () => [
                'id' => $this->marriageStatus->id,
                'code' => $this->marriageStatus->code,
                'title' => $this->marriageStatus->title,
            ]),
            'location_work' => $this->whenLoaded('locationWork', fn () => [
                'id' => $this->locationWork->id,
                'name' => $this->locationWork->name,
                'code' => $this->locationWork->code,
            ]),
            'parent' => $this->whenLoaded('parent', fn () => [
                'id' => $this->parent->id,
                'full_name' => $this->parent->full_name,
                'personnel_code' => $this->parent->personnel_code,
            ]),
            'active_insurance' => $this->whenLoaded('activeInsurance', fn () => [
                'id' => $this->activeInsurance->id,
                'insurance_number' => $this->activeInsurance->insurance_number,
                'status' => $this->activeInsurance->status,
                'annual_ceiling' => $this->activeInsurance->annual_ceiling,
                'remaining_amount' => $this->activeInsurance->remaining_amount,
            ]),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
