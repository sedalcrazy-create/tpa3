<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contract extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'contracts';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'contract_number',
        'title',
        'start_date',
        'end_date',
        'start_date_jalali',
        'end_date_jalali',
        'total_budget',
        'used_budget',
        'status',
        'description',
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
            'start_date' => 'date',
            'end_date' => 'date',
            'total_budget' => 'decimal:2',
            'used_budget' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The invoice aggregations belonging to this contract.
     */
    public function invoiceAggregations(): HasMany
    {
        return $this->hasMany(InvoiceAggregation::class);
    }

    /**
     * Scope a query to only include active contracts.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
