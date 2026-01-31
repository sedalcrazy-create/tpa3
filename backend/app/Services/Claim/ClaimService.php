<?php

namespace App\Services\Claim;

use App\Enums\ClaimStatus;
use App\Models\Claim;
use App\Models\ClaimAttachment;
use App\Models\ClaimNote;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;

class ClaimService
{
    /**
     * Create a new ClaimService instance.
     */
    public function __construct(
        private readonly ClaimStateMachine $stateMachine,
        private readonly DeductionService $deductionService,
    ) {}

    /**
     * Get paginated list of claims with optional filters.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Claim::query();

        // Filter by employee
        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        // Filter by status (integer value)
        if (isset($filters['status']) && $filters['status'] !== '') {
            $query->where('status', (int) $filters['status']);
        }

        // Filter by claim type
        if (!empty($filters['claim_type'])) {
            $query->where('claim_type', $filters['claim_type']);
        }

        // Filter by date range
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Search by claim number
        if (!empty($filters['search'])) {
            $query->where('claim_number', 'like', "%{$filters['search']}%");
        }

        // Eager load relations
        $query->with(['employee', 'invoice', 'createdByUser']);

        // Order by newest first
        $query->orderBy('created_at', 'desc');

        return $query->paginate($perPage);
    }

    /**
     * Find a claim by ID with all relations loaded.
     *
     * @param int $id
     * @return Claim
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function find(int $id): Claim
    {
        return Claim::with([
            'employee',
            'invoice',
            'checkedByUser',
            'confirmedByUser',
            'createdByUser',
            'claimNotes.user',
            'attachments.documentType',
            'attachments.uploadedByUser',
        ])->findOrFail($id);
    }

    /**
     * Create a new claim.
     *
     * @param array<string, mixed> $data
     * @return Claim
     */
    public function create(array $data): Claim
    {
        $data['claim_number'] = 'CLM-' . date('Ymd') . '-' . str_pad(random_int(1, 99999), 5, '0', STR_PAD_LEFT);
        $data['status'] = ClaimStatus::Register;
        $data['created_by'] = Auth::id();

        $claim = Claim::create($data);

        return $claim->load([
            'employee',
            'invoice',
            'createdByUser',
        ]);
    }

    /**
     * Update an existing claim.
     *
     * @param Claim $claim
     * @param array<string, mixed> $data
     * @return Claim
     */
    public function update(Claim $claim, array $data): Claim
    {
        $claim->update($data);

        return $claim->load([
            'employee',
            'invoice',
            'checkedByUser',
            'confirmedByUser',
            'createdByUser',
        ]);
    }

    /**
     * Transition a claim to a new status.
     *
     * @param Claim $claim
     * @param int $newStatus
     * @param string|null $note
     * @return Claim
     *
     * @throws \InvalidArgumentException
     */
    public function transition(Claim $claim, int $newStatus, ?string $note = null): Claim
    {
        $from = $claim->status;
        $to = ClaimStatus::from($newStatus);

        // Validate the transition via state machine
        $this->stateMachine->validateTransition($from, $to);

        // Build update data
        $updateData = ['status' => $to];

        // Set appropriate timestamps based on the target status
        if ($to === ClaimStatus::WaitCheck) {
            $updateData['checked_at'] = now();
            $updateData['checked_by'] = Auth::id();
        }

        if ($from === ClaimStatus::WaitConfirm && $to === ClaimStatus::WaitFinancial) {
            $updateData['confirmed_at'] = now();
            $updateData['confirmed_by'] = Auth::id();
        }

        if ($to === ClaimStatus::Archived) {
            $updateData['settled_at'] = now();
        }

        $claim->update($updateData);

        // Create a note if provided
        if ($note) {
            $noteType = $this->determineNoteType($to);

            $claim->claimNotes()->create([
                'user_id' => Auth::id(),
                'note' => $note,
                'note_type' => $noteType,
                'is_internal' => false,
            ]);
        }

        // Apply deductions when transitioning to WaitFinancial
        if ($to === ClaimStatus::WaitFinancial) {
            $this->deductionService->applyDeductions($claim);
        }

        return $claim->load([
            'employee',
            'invoice',
            'checkedByUser',
            'confirmedByUser',
            'createdByUser',
            'claimNotes.user',
        ]);
    }

    /**
     * Add a note to a claim.
     *
     * @param Claim $claim
     * @param array<string, mixed> $data
     * @return ClaimNote
     */
    public function addNote(Claim $claim, array $data): ClaimNote
    {
        $data['claim_id'] = $claim->id;
        $data['user_id'] = Auth::id();

        $claimNote = ClaimNote::create($data);

        return $claimNote->load('user');
    }

    /**
     * Add an attachment to a claim.
     *
     * @param Claim $claim
     * @param UploadedFile $file
     * @param int|null $documentTypeId
     * @return ClaimAttachment
     */
    public function addAttachment(Claim $claim, UploadedFile $file, ?int $documentTypeId = null): ClaimAttachment
    {
        $path = $file->store("claims/{$claim->id}", 'public');

        $attachment = ClaimAttachment::create([
            'claim_id' => $claim->id,
            'document_type_id' => $documentTypeId,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getClientMimeType(),
            'uploaded_by' => Auth::id(),
        ]);

        return $attachment->load(['documentType', 'uploadedByUser']);
    }

    /**
     * Get all claim statuses with their values and labels.
     *
     * @return array<int, array{value: int, label: string}>
     */
    public function getStatuses(): array
    {
        return array_map(fn (ClaimStatus $status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ], ClaimStatus::cases());
    }

    /**
     * Get allowed next statuses for a given claim.
     *
     * @param Claim $claim
     * @return array<int, array{value: int, label: string}>
     */
    public function getNextStatuses(Claim $claim): array
    {
        return $this->stateMachine->getNextStatuses($claim->status);
    }

    /**
     * Determine the note type based on the target status of a transition.
     *
     * @param ClaimStatus $to
     * @return string
     */
    private function determineNoteType(ClaimStatus $to): string
    {
        return match ($to) {
            ClaimStatus::Returned => 'return',
            ClaimStatus::WaitFinancial, ClaimStatus::Archived => 'approval',
            default => 'general',
        };
    }
}
