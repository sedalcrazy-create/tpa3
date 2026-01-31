<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Claim\AddClaimNoteRequest;
use App\Http\Requests\Claim\StoreClaimRequest;
use App\Http\Requests\Claim\TransitionClaimRequest;
use App\Http\Requests\Claim\UpdateClaimRequest;
use App\Http\Resources\ClaimAttachmentResource;
use App\Http\Resources\ClaimNoteResource;
use App\Http\Resources\ClaimResource;
use App\Services\Claim\ClaimService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClaimController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly ClaimService $claimService,
    ) {}

    /**
     * Display a paginated list of claims.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'employee_id',
            'status',
            'claim_type',
            'date_from',
            'date_to',
            'search',
        ]);

        $perPage = (int) $request->query('per_page', 15);

        $claims = $this->claimService->list($filters, $perPage);

        return $this->paginatedResponse(
            ClaimResource::collection($claims)
        );
    }

    /**
     * Store a newly created claim.
     */
    public function store(StoreClaimRequest $request): JsonResponse
    {
        $claim = $this->claimService->create($request->validated());

        return $this->createdResponse(
            new ClaimResource($claim),
            'پرونده با موفقیت ایجاد شد.'
        );
    }

    /**
     * Display the specified claim.
     */
    public function show(int $id): JsonResponse
    {
        $claim = $this->claimService->find($id);

        return $this->successResponse(
            new ClaimResource($claim)
        );
    }

    /**
     * Update the specified claim.
     */
    public function update(UpdateClaimRequest $request, int $id): JsonResponse
    {
        $claim = $this->claimService->find($id);
        $claim = $this->claimService->update($claim, $request->validated());

        return $this->successResponse(
            new ClaimResource($claim),
            'پرونده با موفقیت به‌روزرسانی شد.'
        );
    }

    /**
     * Transition the claim to a new status.
     */
    public function transition(TransitionClaimRequest $request, int $id): JsonResponse
    {
        $claim = $this->claimService->find($id);

        $claim = $this->claimService->transition(
            $claim,
            $request->validated('status'),
            $request->validated('note')
        );

        return $this->successResponse(
            new ClaimResource($claim),
            'وضعیت پرونده با موفقیت تغییر کرد.'
        );
    }

    /**
     * Add a note to the specified claim.
     */
    public function addNote(AddClaimNoteRequest $request, int $id): JsonResponse
    {
        $claim = $this->claimService->find($id);
        $note = $this->claimService->addNote($claim, $request->validated());

        return $this->createdResponse(
            new ClaimNoteResource($note),
            'یادداشت با موفقیت اضافه شد.'
        );
    }

    /**
     * Add an attachment to the specified claim.
     */
    public function addAttachment(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:20480'],
            'document_type_id' => ['nullable', 'exists:document_types,id'],
        ], [
            'file.required' => 'فایل الزامی است.',
            'file.file' => 'فایل آپلود شده معتبر نیست.',
            'file.max' => 'حجم فایل نباید بیشتر از ۲۰ مگابایت باشد.',
            'document_type_id.exists' => 'نوع مدرک انتخاب شده معتبر نیست.',
        ]);

        $claim = $this->claimService->find($id);

        $attachment = $this->claimService->addAttachment(
            $claim,
            $request->file('file'),
            $request->input('document_type_id')
        );

        return $this->createdResponse(
            new ClaimAttachmentResource($attachment),
            'فایل با موفقیت آپلود شد.'
        );
    }

    /**
     * Get all claim statuses.
     */
    public function statuses(): JsonResponse
    {
        $statuses = $this->claimService->getStatuses();

        return $this->successResponse($statuses);
    }

    /**
     * Get allowed next statuses for the specified claim.
     */
    public function nextStatuses(int $id): JsonResponse
    {
        $claim = $this->claimService->find($id);
        $nextStatuses = $this->claimService->getNextStatuses($claim);

        return $this->successResponse($nextStatuses);
    }
}
