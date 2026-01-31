<?php

namespace App\Services;

use App\Models\Illness;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class DiagnosisService
{
    /**
     * Search illnesses by ICD code, name, or English name.
     *
     * @param string $query
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function search(string $query, int $perPage = 15): LengthAwarePaginator
    {
        return Illness::where(function ($q) use ($query) {
            $q->where('icd_code', 'like', "%{$query}%")
                ->orWhere('name', 'like', "%{$query}%")
                ->orWhere('name_en', 'like', "%{$query}%");
        })
            ->orderBy('icd_code')
            ->paginate($perPage);
    }

    /**
     * Find an illness by ID with parent and children loaded.
     *
     * @param int $id
     * @return Illness
     *
     * @throws ModelNotFoundException
     */
    public function find(int $id): Illness
    {
        return Illness::with(['parent', 'children'])
            ->findOrFail($id);
    }

    /**
     * Find an illness by ICD code.
     *
     * @param string $icdCode
     * @return Illness|null
     */
    public function getByCode(string $icdCode): ?Illness
    {
        return Illness::where('icd_code', $icdCode)->first();
    }
}
