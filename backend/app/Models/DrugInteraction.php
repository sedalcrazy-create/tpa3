<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class DrugInteraction extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'drug_interactions';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'item_id_1',
        'item_id_2',
        'severity',
        'description',
        'recommendation',
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
            'is_active' => 'boolean',
        ];
    }

    /**
     * The first item in the drug interaction.
     */
    public function item1(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id_1');
    }

    /**
     * The second item in the drug interaction.
     */
    public function item2(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id_2');
    }

    /**
     * Scope a query to only include active drug interactions.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include severe or contraindicated drug interactions.
     */
    public function scopeSevere(Builder $query): Builder
    {
        return $query->whereIn('severity', ['severe', 'contraindicated']);
    }
}
