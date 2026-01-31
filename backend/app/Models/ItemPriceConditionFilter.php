<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemPriceConditionFilter extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'item_price_condition_filters';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'item_price_condition_id',
        'filter_type',
        'filter_operator',
        'filter_value',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'filter_value' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The price condition that this filter belongs to.
     */
    public function condition(): BelongsTo
    {
        return $this->belongsTo(ItemPriceCondition::class, 'item_price_condition_id');
    }
}
