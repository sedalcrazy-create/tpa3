<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Item\StoreItemPriceRequest;
use App\Http\Requests\Item\StoreItemRequest;
use App\Http\Requests\Item\UpdateItemRequest;
use App\Http\Resources\DrugInteractionResource;
use App\Http\Resources\ItemCollection;
use App\Http\Resources\ItemPriceResource;
use App\Http\Resources\ItemResource;
use App\Services\ItemService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly ItemService $itemService
    ) {}

    /**
     * Display a paginated list of items.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'item_type',
            'item_category_id',
            'item_sub_category_id',
            'item_group_id',
            'is_covered',
            'is_active',
        ]);

        $perPage = (int) $request->query('per_page', 15);

        $items = $this->itemService->list($filters, $perPage);

        return $this->paginatedResponse(
            new ItemCollection($items)
        );
    }

    /**
     * Store a newly created item.
     */
    public function store(StoreItemRequest $request): JsonResponse
    {
        $item = $this->itemService->create($request->validated());

        return $this->createdResponse(
            new ItemResource($item),
            'آیتم با موفقیت ایجاد شد.'
        );
    }

    /**
     * Display the specified item.
     */
    public function show(int $id): JsonResponse
    {
        $item = $this->itemService->find($id);

        return $this->successResponse(
            new ItemResource($item)
        );
    }

    /**
     * Update the specified item.
     */
    public function update(UpdateItemRequest $request, int $id): JsonResponse
    {
        $item = $this->itemService->find($id);
        $item = $this->itemService->update($item, $request->validated());

        return $this->successResponse(
            new ItemResource($item),
            'آیتم با موفقیت به‌روزرسانی شد.'
        );
    }

    /**
     * Remove the specified item (soft delete).
     */
    public function destroy(int $id): JsonResponse
    {
        $item = $this->itemService->find($id);
        $this->itemService->delete($item);

        return $this->successResponse(
            message: 'آیتم با موفقیت حذف شد.'
        );
    }

    /**
     * Get the price for an item on a specific date.
     */
    public function price(int $id, Request $request): JsonResponse
    {
        $date = $request->query('date');

        $price = $this->itemService->getPriceOnDate($id, $date);

        if (!$price) {
            return $this->errorResponse(
                'قیمتی برای این آیتم در تاریخ مورد نظر یافت نشد.',
                404
            );
        }

        return $this->successResponse(
            new ItemPriceResource($price)
        );
    }

    /**
     * Add a new price record for an item.
     */
    public function addPrice(StoreItemPriceRequest $request): JsonResponse
    {
        $price = $this->itemService->addPrice($request->validated());

        return $this->createdResponse(
            new ItemPriceResource($price),
            'قیمت آیتم با موفقیت ثبت شد.'
        );
    }

    /**
     * Check drug interactions between a list of items.
     */
    public function interactions(Request $request): JsonResponse
    {
        $request->validate([
            'item_ids' => ['required', 'array', 'min:2'],
            'item_ids.*' => ['required', 'integer', 'exists:items,id'],
        ], [
            'item_ids.required' => 'لیست آیتم‌ها الزامی است.',
            'item_ids.array' => 'لیست آیتم‌ها باید آرایه باشد.',
            'item_ids.min' => 'حداقل دو آیتم برای بررسی تداخل لازم است.',
            'item_ids.*.required' => 'شناسه آیتم الزامی است.',
            'item_ids.*.integer' => 'شناسه آیتم باید عدد صحیح باشد.',
            'item_ids.*.exists' => 'آیتم انتخاب شده معتبر نیست.',
        ]);

        $interactions = $this->itemService->checkInteractions($request->input('item_ids'));

        return $this->successResponse(
            DrugInteractionResource::collection($interactions)
        );
    }
}
