<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SocialWorkCaseResource extends JsonResource
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
            'resolution' => $this->resolution,
            'resolved_at' => $this->resolved_at?->toIso8601String(),

            // Conditional relations
            'employee' => $this->whenLoaded('employee', fn () => [
                'id' => $this->employee->id,
                'full_name' => $this->employee->full_name,
                'personnel_code' => $this->employee->personnel_code,
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
