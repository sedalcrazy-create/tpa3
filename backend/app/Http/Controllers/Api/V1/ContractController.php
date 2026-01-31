<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contract\StoreContractRequest;
use App\Http\Requests\Contract\UpdateContractRequest;
use App\Http\Resources\ContractResource;
use App\Services\ContractService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly ContractService $contractService
    ) {}

    /**
     * Display a listing of contracts.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'search']);
        $perPage = $request->integer('per_page', 15);

        $contracts = $this->contractService->list($filters, $perPage);

        return $this->paginatedResponse(
            ContractResource::collection($contracts)
        );
    }

    /**
     * Store a newly created contract.
     */
    public function store(StoreContractRequest $request): JsonResponse
    {
        $contract = $this->contractService->create($request->validated());

        return $this->createdResponse(
            new ContractResource($contract),
            'قرارداد با موفقیت ایجاد شد.'
        );
    }

    /**
     * Display the specified contract.
     */
    public function show(int $id): JsonResponse
    {
        $contract = $this->contractService->find($id);

        return $this->successResponse(
            new ContractResource($contract)
        );
    }

    /**
     * Update the specified contract.
     */
    public function update(UpdateContractRequest $request, int $id): JsonResponse
    {
        $contract = $this->contractService->find($id);
        $updated = $this->contractService->update($contract, $request->validated());

        return $this->successResponse(
            new ContractResource($updated),
            'قرارداد با موفقیت به‌روزرسانی شد.'
        );
    }

    /**
     * Remove the specified contract.
     */
    public function destroy(int $id): JsonResponse
    {
        $contract = $this->contractService->find($id);
        $this->contractService->delete($contract);

        return $this->successResponse(
            message: 'قرارداد با موفقیت حذف شد.'
        );
    }
}
