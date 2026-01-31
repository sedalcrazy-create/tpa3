<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClaimAttachmentResource extends JsonResource
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
            'file_name' => $this->file_name,
            'file_path' => $this->file_path,
            'file_size' => $this->file_size,
            'mime_type' => $this->mime_type,
            'created_at' => $this->created_at?->toIso8601String(),

            // Conditional relations
            'documentType' => $this->whenLoaded('documentType', fn () => [
                'id' => $this->documentType->id,
                'name' => $this->documentType->name,
                'code' => $this->documentType->code,
            ]),
            'uploadedByUser' => $this->whenLoaded('uploadedByUser', fn () => [
                'id' => $this->uploadedByUser->id,
                'name' => $this->uploadedByUser->name,
            ]),
        ];
    }
}
