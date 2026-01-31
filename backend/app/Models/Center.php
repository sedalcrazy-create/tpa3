<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Center extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'centers';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'code',
        'center_type',
        'province_id',
        'city',
        'address',
        'phone',
        'fax',
        'email',
        'license_number',
        'is_contracted',
        'contract_start_date',
        'contract_end_date',
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
            'is_contracted' => 'boolean',
            'contract_start_date' => 'date',
            'contract_end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The province that this center belongs to.
     */
    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    /**
     * The doctors belonging to this center.
     */
    public function doctors(): HasMany
    {
        return $this->hasMany(Doctor::class);
    }

    /**
     * The institution contracts belonging to this center.
     */
    public function contracts(): HasMany
    {
        return $this->hasMany(InstitutionContract::class);
    }

    /**
     * The invoices belonging to this center.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * The invoice aggregations belonging to this center.
     */
    public function invoiceAggregations(): HasMany
    {
        return $this->hasMany(InvoiceAggregation::class);
    }

    /**
     * Scope a query to only include active centers.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include contracted centers.
     */
    public function scopeContracted(Builder $query): Builder
    {
        return $query->where('is_contracted', true);
    }
}
