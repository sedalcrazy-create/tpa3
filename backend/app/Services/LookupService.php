<?php

namespace App\Services;

use App\Models\BodyPartType;
use App\Models\CommissionCaseType;
use App\Models\CustomEmployeeCode;
use App\Models\DocumentType;
use App\Models\GuardianshipType;
use App\Models\InstitutionContractType;
use App\Models\ItemCategory;
use App\Models\ItemGroup;
use App\Models\Location;
use App\Models\MarriageStatus;
use App\Models\PrescriptionType;
use App\Models\Province;
use App\Models\RelationType;
use App\Models\SpecialEmployeeType;
use Illuminate\Support\Collection;

class LookupService
{
    /**
     * Get all active provinces ordered by name.
     *
     * @return Collection
     */
    public function provinces(): Collection
    {
        return Province::active()->orderBy('name')->get();
    }

    /**
     * Get all active relation types ordered by title.
     *
     * @return Collection
     */
    public function relationTypes(): Collection
    {
        return RelationType::active()->orderBy('title')->get();
    }

    /**
     * Get all active guardianship types ordered by title.
     *
     * @return Collection
     */
    public function guardianshipTypes(): Collection
    {
        return GuardianshipType::active()->orderBy('title')->get();
    }

    /**
     * Get all active custom employee codes ordered by title.
     *
     * @return Collection
     */
    public function customEmployeeCodes(): Collection
    {
        return CustomEmployeeCode::active()->orderBy('title')->get();
    }

    /**
     * Get all active special employee types ordered by title.
     *
     * @return Collection
     */
    public function specialEmployeeTypes(): Collection
    {
        return SpecialEmployeeType::active()->orderBy('title')->get();
    }

    /**
     * Get all active locations with optional province filter, ordered by name.
     *
     * @param array<string, mixed> $filters
     * @return Collection
     */
    public function locations(array $filters = []): Collection
    {
        $query = Location::active();

        if (!empty($filters['province_id'])) {
            $query->where('province_id', $filters['province_id']);
        }

        return $query->orderBy('name')->get();
    }

    /**
     * Get all active prescription types ordered by name.
     *
     * @return Collection
     */
    public function prescriptionTypes(): Collection
    {
        return PrescriptionType::active()->orderBy('name')->get();
    }

    /**
     * Get all active document types ordered by name.
     *
     * @return Collection
     */
    public function documentTypes(): Collection
    {
        return DocumentType::active()->orderBy('name')->get();
    }

    /**
     * Get all active body part types with their body parts, ordered by name.
     *
     * @return Collection
     */
    public function bodyPartTypes(): Collection
    {
        return BodyPartType::active()
            ->with('bodyParts')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get all active commission case types ordered by name.
     *
     * @return Collection
     */
    public function commissionCaseTypes(): Collection
    {
        return CommissionCaseType::active()->orderBy('name')->get();
    }

    /**
     * Get all active institution contract types ordered by name.
     *
     * @return Collection
     */
    public function institutionContractTypes(): Collection
    {
        return InstitutionContractType::active()->orderBy('name')->get();
    }

    /**
     * Get all active item categories with their sub-categories, ordered by name.
     *
     * @return Collection
     */
    public function itemCategories(): Collection
    {
        return ItemCategory::active()
            ->with('subCategories')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get all active item groups ordered by name.
     *
     * @return Collection
     */
    public function itemGroups(): Collection
    {
        return ItemGroup::active()->orderBy('name')->get();
    }

    /**
     * Get all active marriage statuses ordered by id.
     *
     * @return Collection
     */
    public function marriageStatuses(): Collection
    {
        return MarriageStatus::active()->orderBy('id')->get();
    }
}
