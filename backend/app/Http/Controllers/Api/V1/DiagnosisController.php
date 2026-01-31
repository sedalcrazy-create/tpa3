<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\IllnessResource;
use App\Services\DiagnosisService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiagnosisController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly DiagnosisService $diagnosisService
    ) {}

    /**
     * Search and list illnesses.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $perPage = (int) $request->query('per_page', 15);

        $illnesses = $this->diagnosisService->search($search, $perPage);

        return $this->paginatedResponse(
            IllnessResource::collection($illnesses)
        );
    }

    /**
     * Display the specified illness.
     */
    public function show(int $id): JsonResponse
    {
        $illness = $this->diagnosisService->find($id);

        return $this->successResponse(
            new IllnessResource($illness)
        );
    }

    /**
     * Find an illness by ICD code.
     */
    public function findByCode(string $code): JsonResponse
    {
        $illness = $this->diagnosisService->getByCode($code);

        if (!$illness) {
            return $this->errorResponse(
                'بیماری با این کد ICD یافت نشد.',
                404
            );
        }

        return $this->successResponse(
            new IllnessResource($illness)
        );
    }
}
