<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Illness extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'illnesses';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'icd_code',
        'name',
        'name_en',
        'category',
        'parent_id',
        'is_chronic',
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
            'is_chronic' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The parent illness.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Illness::class, 'parent_id');
    }

    /**
     * The child illnesses.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Illness::class, 'parent_id');
    }

    /**
     * Scope a query to only include active illnesses.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include chronic illnesses.
     */
    public function scopeChronic(Builder $query): Builder
    {
        return $query->where('is_chronic', true);
    }
}
