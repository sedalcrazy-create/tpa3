<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Commission\StoreCommissionCaseRequest;
use App\Http\Requests\Commission\StoreSocialWorkCaseRequest;
use App\Http\Resources\CommissionCaseResource;
use App\Http\Resources\SocialWorkCaseResource;
use App\Services\CommissionService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly CommissionService $commissionService
    ) {}

    /**
     * Display a paginated list of commission cases.
     */
    public function cases(Request $request): JsonResponse
    {
        $filters = $request->only([
            'employee_id',
            'status',
            'commission_case_type_id',
            'search',
        ]);

        $perPage = (int) $request->query('per_page', 15);

        $cases = $this->commissionService->listCases($filters, $perPage);

        return $this->paginatedResponse(
            CommissionCaseResource::collection($cases)
        );
    }

    /**
     * Display the specified commission case.
     */
    public function showCase(int $id): JsonResponse
    {
        $case = $this->commissionService->findCase($id);

        return $this->successResponse(
            new CommissionCaseResource($case)
        );
    }

    /**
     * Create a new commission case.
     */
    public function createCase(StoreCommissionCaseRequest $request): JsonResponse
    {
        $case = $this->commissionService->createCase($request->validated());

        return $this->createdResponse(
            new CommissionCaseResource($case),
            'پرونده کمیسیون پزشکی با موفقیت ایجاد شد.'
        );
    }

    /**
     * Update the specified commission case.
     */
    public function updateCase(Request $request, int $id): JsonResponse
    {
        $case = $this->commissionService->findCase($id);

        $validated = $request->validate([
            'employee_id' => ['sometimes', 'exists:employees,id'],
            'commission_case_type_id' => ['sometimes', 'nullable', 'exists:commission_case_types,id'],
            'claim_id' => ['sometimes', 'nullable', 'exists:claims,id'],
            'subject' => ['sometimes', 'string', 'max:500'],
            'description' => ['sometimes', 'nullable', 'string'],
            'assigned_to' => ['sometimes', 'nullable', 'exists:users,id'],
            'status' => ['sometimes', 'string', 'max:50'],
        ], [
            'employee_id.exists' => 'کارمند انتخاب شده معتبر نیست.',
            'commission_case_type_id.exists' => 'نوع پرونده کمیسیون معتبر نیست.',
            'claim_id.exists' => 'پرونده خسارت انتخاب شده معتبر نیست.',
            'subject.string' => 'موضوع باید متن باشد.',
            'subject.max' => 'موضوع نباید بیشتر از ۵۰۰ کاراکتر باشد.',
            'description.string' => 'توضیحات باید متن باشد.',
            'assigned_to.exists' => 'کاربر ارجاع شده معتبر نیست.',
            'status.string' => 'وضعیت باید متن باشد.',
        ]);

        $case = $this->commissionService->updateCase($case, $validated);

        return $this->successResponse(
            new CommissionCaseResource($case),
            'پرونده کمیسیون پزشکی با موفقیت به‌روزرسانی شد.'
        );
    }

    /**
     * Issue a verdict for the specified commission case.
     */
    public function issueVerdict(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'verdict' => ['required', 'string'],
            'verdict_template_id' => ['nullable', 'exists:verdict_templates,id'],
        ], [
            'verdict.required' => 'رأی کمیسیون الزامی است.',
            'verdict.string' => 'رأی کمیسیون باید متن باشد.',
            'verdict_template_id.exists' => 'قالب رأی انتخاب شده معتبر نیست.',
        ]);

        $case = $this->commissionService->findCase($id);

        $case = $this->commissionService->issueVerdict(
            $case,
            $validated['verdict'],
            $validated['verdict_template_id'] ?? null
        );

        return $this->successResponse(
            new CommissionCaseResource($case),
            'رأی کمیسیون پزشکی با موفقیت صادر شد.'
        );
    }

    /**
     * Display a paginated list of social work cases.
     */
    public function socialWork(Request $request): JsonResponse
    {
        $filters = $request->only([
            'employee_id',
            'status',
            'search',
        ]);

        $perPage = (int) $request->query('per_page', 15);

        $cases = $this->commissionService->listSocialWork($filters, $perPage);

        return $this->paginatedResponse(
            SocialWorkCaseResource::collection($cases)
        );
    }

    /**
     * Display the specified social work case.
     */
    public function showSocialWork(int $id): JsonResponse
    {
        $case = $this->commissionService->findSocialWork($id);

        return $this->successResponse(
            new SocialWorkCaseResource($case)
        );
    }

    /**
     * Create a new social work case.
     */
    public function createSocialWork(StoreSocialWorkCaseRequest $request): JsonResponse
    {
        $case = $this->commissionService->createSocialWork($request->validated());

        return $this->createdResponse(
            new SocialWorkCaseResource($case),
            'پرونده مددکاری با موفقیت ایجاد شد.'
        );
    }

    /**
     * Resolve a social work case.
     */
    public function resolveSocialWork(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'resolution' => ['required', 'string'],
        ], [
            'resolution.required' => 'نتیجه مددکاری الزامی است.',
            'resolution.string' => 'نتیجه مددکاری باید متن باشد.',
        ]);

        $case = $this->commissionService->findSocialWork($id);

        $case = $this->commissionService->resolveSocialWork($case, $validated['resolution']);

        return $this->successResponse(
            new SocialWorkCaseResource($case),
            'پرونده مددکاری با موفقیت حل شد.'
        );
    }
}
