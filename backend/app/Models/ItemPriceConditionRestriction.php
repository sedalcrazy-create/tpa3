<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemPriceConditionRestriction extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'item_price_condition_restrictions';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'item_price_condition_id',
        'restriction_type',
        'restriction_value',
        'conflict_item_id',
        'body_part_type_id',
        'max_count',
        'period_type',
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
            'restriction_value' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The price condition that this restriction belongs to.
     */
    public function condition(): BelongsTo
    {
        return $this->belongsTo(ItemPriceCondition::class, 'item_price_condition_id');
    }

    /**
     * The conflicting item for this restriction.
     */
    public function conflictItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'conflict_item_id');
    }
}
