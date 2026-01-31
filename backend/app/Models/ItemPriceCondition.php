<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class ItemPriceCondition extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'item_price_conditions';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'code',
        'item_id',
        'item_category_id',
        'item_sub_category_id',
        'coverage_percentage',
        'max_covered_amount',
        'patient_share_percentage',
        'fixed_patient_share',
        'max_quantity_per_prescription',
        'max_per_period',
        'period_type',
        'requires_pre_approval',
        'min_age',
        'max_age',
        'gender',
        'relation_type',
        'waiting_days',
        'effective_from',
        'effective_to',
        'priority',
        'is_active',
        'description',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'coverage_percentage' => 'decimal:2',
            'max_covered_amount' => 'decimal:2',
            'patient_share_percentage' => 'decimal:2',
            'fixed_patient_share' => 'decimal:2',
            'requires_pre_approval' => 'boolean',
            'effective_from' => 'date',
            'effective_to' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The item that this price condition belongs to.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * The item category that this price condition belongs to.
     */
    public function itemCategory(): BelongsTo
    {
        return $this->belongsTo(ItemCategory::class);
    }

    /**
     * The item sub-category that this price condition belongs to.
     */
    public function itemSubCategory(): BelongsTo
    {
        return $this->belongsTo(ItemSubCategory::class);
    }

    /**
     * The filters for this price condition.
     */
    public function filters(): HasMany
    {
        return $this->hasMany(ItemPriceConditionFilter::class);
    }

    /**
     * The restrictions for this price condition.
     */
    public function restrictions(): HasMany
    {
        return $this->hasMany(ItemPriceConditionRestriction::class);
    }

    /**
     * Scope a query to only include active item price conditions.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include currently effective item price conditions.
     */
    public function scopeEffective(Builder $query): Builder
    {
        return $query->where('effective_from', '<=', now())
            ->where(fn (Builder $q) => $q->whereNull('effective_to')->orWhere('effective_to', '>=', now()));
    }
}
