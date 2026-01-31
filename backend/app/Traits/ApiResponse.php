<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    protected function successResponse(
        mixed $data = null,
        string $message = 'عملیات با موفقیت انجام شد',
        int $code = 200
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }

    protected function errorResponse(
        string $message = 'خطایی رخ داده است',
        int $code = 400,
        mixed $errors = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    protected function paginatedResponse(
        ResourceCollection $collection,
        string $message = 'عملیات با موفقیت انجام شد'
    ): JsonResponse {
        $paginated = $collection->response()->getData(true);

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginated['data'],
            'meta' => $paginated['meta'] ?? null,
            'links' => $paginated['links'] ?? null,
        ]);
    }

    protected function createdResponse(
        mixed $data = null,
        string $message = 'رکورد با موفقیت ایجاد شد'
    ): JsonResponse {
        return $this->successResponse($data, $message, 201);
    }

    protected function noContentResponse(): JsonResponse
    {
        return response()->json(null, 204);
    }
}
