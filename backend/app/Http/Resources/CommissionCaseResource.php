<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommissionCaseResource extends JsonResource
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
            'case_number' => $this->case_number,
            'subject' => $this->subject,
            'description' => $this->description,
            'status' => $this->status,
            'verdict' => $this->verdict,
            'verdict_date' => $this->verdict_date?->toDateString(),
            'verdict_date_jalali' => $this->verdict_date_jalali,

            // Conditional relations
            'employee' => $this->whenLoaded('employee', fn () => [
                'id' => $this->employee->id,
                'full_name' => $this->employee->full_name,
                'personnel_code' => $this->employee->personnel_code,
            ]),
            'caseType' => $this->whenLoaded('caseType', fn () => [
                'id' => $this->caseType->id,
                'name' => $this->caseType->name,
                'code' => $this->caseType->code,
            ]),
            'claim' => $this->whenLoaded('claim', fn () => [
                'id' => $this->claim->id,
                'claim_number' => $this->claim->claim_number,
            ]),
            'verdictTemplate' => $this->whenLoaded('verdictTemplate', fn () => [
                'id' => $this->verdictTemplate->id,
                'title' => $this->verdictTemplate->title,
            ]),
            'assignedToUser' => $this->whenLoaded('assignedToUser', fn () => [
                'id' => $this->assignedToUser->id,
                'name' => $this->assignedToUser->name,
            ]),
            'createdByUser' => $this->whenLoaded('createdByUser', fn () => [
                'id' => $this->createdByUser->id,
                'name' => $this->createdByUser->name,
            ]),

            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
