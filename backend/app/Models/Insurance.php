<?php

namespace App\Models;

use App\Enums\InsuranceStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Insurance extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'insurances';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',
        'insurance_number',
        'start_date',
        'end_date',
        'start_date_jalali',
        'end_date_jalali',
        'status',
        'basic_premium',
        'supplementary_premium',
        'annual_ceiling',
        'used_amount',
        'remaining_amount',
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
            'basic_premium' => 'decimal:2',
            'supplementary_premium' => 'decimal:2',
            'annual_ceiling' => 'decimal:2',
            'used_amount' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
            'is_active' => 'boolean',
            'status' => InsuranceStatus::class,
        ];
    }

    /**
     * The employee that owns the insurance.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * The history records belonging to this insurance.
     */
    public function histories(): HasMany
    {
        return $this->hasMany(InsuranceHistory::class);
    }

    /**
     * Scope a query to only include active insurances.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include valid (active and not expired) insurances.
     */
    public function scopeValid(Builder $query): Builder
    {
        return $query->where('status', 'active')->where('end_date', '>=', now());
    }
}
