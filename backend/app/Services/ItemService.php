<?php

namespace App\Services;

use App\Models\DrugInteraction;
use App\Models\Item;
use App\Models\ItemPrice;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class ItemService
{
    /**
     * Get paginated list of items with optional filters.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Item::query();

        // Search by name, generic_name, or code
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('generic_name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Filter by item_type
        if (!empty($filters['item_type'])) {
            $query->where('item_type', $filters['item_type']);
        }

        // Filter by item_category_id
        if (!empty($filters['item_category_id'])) {
            $query->where('item_category_id', $filters['item_category_id']);
        }

        // Filter by item_sub_category_id
        if (!empty($filters['item_sub_category_id'])) {
            $query->where('item_sub_category_id', $filters['item_sub_category_id']);
        }

        // Filter by item_group_id
        if (!empty($filters['item_group_id'])) {
            $query->where('item_group_id', $filters['item_group_id']);
        }

        // Filter by is_covered
        if (isset($filters['is_covered'])) {
            $query->where('is_covered', filter_var($filters['is_covered'], FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by is_active
        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        // Eager load relations
        $query->with([
            'category',
            'subCategory',
            'group',
            'currentPrice',
        ]);

        // Order by name
        $query->orderBy('name');

        return $query->paginate($perPage);
    }

    /**
     * Find an item by ID with all relations loaded.
     *
     * @param int $id
     * @return Item
     *
     * @throws ModelNotFoundException
     */
    public function find(int $id): Item
    {
        return Item::with([
            'category',
            'subCategory',
            'group',
            'currentPrice',
            'prices' => function ($query) {
                $query->orderBy('effective_from', 'desc');
            },
        ])->findOrFail($id);
    }

    /**
     * Create a new item.
     *
     * @param array<string, mixed> $data
     * @return Item
     */
    public function create(array $data): Item
    {
        // Set is_active to true by default
        if (!isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        $item = Item::create($data);

        return $item->load([
            'category',
            'subCategory',
            'group',
            'currentPrice',
        ]);
    }

    /**
     * Update an existing item.
     *
     * @param Item $item
     * @param array<string, mixed> $data
     * @return Item
     */
    public function update(Item $item, array $data): Item
    {
        $item->update($data);

        return $item->load([
            'category',
            'subCategory',
            'group',
            'currentPrice',
        ]);
    }

    /**
     * Soft delete an item.
     *
     * @param Item $item
     * @return void
     */
    public function delete(Item $item): void
    {
        $item->delete();
    }

    /**
     * Get the price for an item on a specific date.
     *
     * @param int $itemId
     * @param string|null $date
     * @return ItemPrice|null
     */
    public function getPriceOnDate(int $itemId, ?string $date = null): ?ItemPrice
    {
        $date = $date ?? now()->toDateString();

        return ItemPrice::where('item_id', $itemId)
            ->where('is_active', true)
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            })
            ->orderBy('effective_from', 'desc')
            ->first();
    }

    /**
     * Add a new price record for an item.
     *
     * @param array<string, mixed> $data
     * @return ItemPrice
     */
    public function addPrice(array $data): ItemPrice
    {
        $itemPrice = ItemPrice::create($data);

        return $itemPrice->load('item');
    }

    /**
     * Check drug interactions between a list of item IDs.
     *
     * @param array<int> $itemIds
     * @return Collection
     */
    public function checkInteractions(array $itemIds): Collection
    {
        return DrugInteraction::where(function ($query) use ($itemIds) {
            $query->whereIn('item_id_1', $itemIds)
                ->whereIn('item_id_2', $itemIds);
        })
            ->with(['item1', 'item2'])
            ->get();
    }

    /**
     * Search for an item by exact code match.
     *
     * @param string $code
     * @return Item|null
     */
    public function searchByCode(string $code): ?Item
    {
        return Item::where('code', $code)
            ->with('currentPrice')
            ->first();
    }
}
