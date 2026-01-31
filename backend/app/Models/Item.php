<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

class Item extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'items';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'generic_name',
        'code',
        'item_category_id',
        'item_sub_category_id',
        'item_group_id',
        'item_type',
        'unit',
        'dosage_form',
        'strength',
        'manufacturer',
        'country',
        'is_otc',
        'is_covered',
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
            'is_otc' => 'boolean',
            'is_covered' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The category that this item belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ItemCategory::class, 'item_category_id');
    }

    /**
     * The sub-category that this item belongs to.
     */
    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(ItemSubCategory::class, 'item_sub_category_id');
    }

    /**
     * The group that this item belongs to.
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(ItemGroup::class, 'item_group_id');
    }

    /**
     * The prices for this item.
     */
    public function prices(): HasMany
    {
        return $this->hasMany(ItemPrice::class);
    }

    /**
     * The current active price for this item.
     */
    public function currentPrice(): HasOne
    {
        return $this->hasOne(ItemPrice::class)
            ->where('is_active', true)
            ->where('effective_from', '<=', now())
            ->where(fn ($q) => $q->whereNull('effective_to')->orWhere('effective_to', '>=', now()))
            ->latest('effective_from');
    }

    /**
     * The drug interactions where this item is the primary item.
     */
    public function interactions(): HasMany
    {
        return $this->hasMany(DrugInteraction::class, 'item_id_1');
    }

    /**
     * The drug interactions where this item is the secondary item.
     */
    public function interactedBy(): HasMany
    {
        return $this->hasMany(DrugInteraction::class, 'item_id_2');
    }

    /**
     * The price conditions for this item.
     */
    public function priceConditions(): HasMany
    {
        return $this->hasMany(ItemPriceCondition::class);
    }

    /**
     * Scope a query to only include active items.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include covered items.
     */
    public function scopeCovered(Builder $query): Builder
    {
        return $query->where('is_covered', true);
    }

    /**
     * Scope a query to only include items of a given type.
     */
    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('item_type', $type);
    }
}
