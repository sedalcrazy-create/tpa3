<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InsuranceRule extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'insurance_rules';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'code',
        'rule_type',
        'condition_json',
        'value',
        'value_type',
        'waiting_days',
        'applies_to_relation',
        'is_active',
        'priority',
        'effective_from',
        'effective_to',
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
            'condition_json' => 'array',
            'value' => 'decimal:2',
            'effective_from' => 'date',
            'effective_to' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Scope a query to only include active insurance rules.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include currently effective insurance rules.
     */
    public function scopeEffective(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where('effective_from', '<=', now())
            ->where(function (Builder $query) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', now());
            });
    }
}
