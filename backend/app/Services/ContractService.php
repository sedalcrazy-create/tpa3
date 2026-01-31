<?php

namespace App\Services;

use App\Models\Contract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ContractService
{
    /**
     * List contracts with filters and pagination.
     */
    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Contract::query();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('contract_number', 'like', '%' . $search . '%')
                  ->orWhere('title', 'like', '%' . $search . '%');
            });
        }

        return $query->orderBy('start_date', 'desc')->paginate($perPage);
    }

    /**
     * Find a contract by ID with relations.
     */
    public function find(int $id): Contract
    {
        return Contract::with('invoiceAggregations')->findOrFail($id);
    }

    /**
     * Create a new contract record.
     */
    public function create(array $data): Contract
    {
        $data['is_active'] = $data['is_active'] ?? true;
        $data['used_budget'] = $data['used_budget'] ?? 0;

        return Contract::create($data);
    }

    /**
     * Update an existing contract record.
     */
    public function update(Contract $contract, array $data): Contract
    {
        $contract->update($data);

        return $contract;
    }

    /**
     * Delete a contract record.
     */
    public function delete(Contract $contract): void
    {
        $contract->delete();
    }
}
