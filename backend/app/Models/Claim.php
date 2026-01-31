<?php

namespace App\Models;

use App\Enums\ClaimStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Claim extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'claims';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'claim_number',
        'employee_id',
        'invoice_id',
        'claim_type',
        'status',
        'total_amount',
        'approved_amount',
        'paid_amount',
        'deduction_amount',
        'admission_date',
        'discharge_date',
        'admission_date_jalali',
        'discharge_date_jalali',
        'submitted_at',
        'checked_at',
        'confirmed_at',
        'settled_at',
        'checked_by',
        'confirmed_by',
        'created_by',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ClaimStatus::class,
            'total_amount' => 'decimal:2',
            'approved_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'deduction_amount' => 'decimal:2',
            'admission_date' => 'date',
            'discharge_date' => 'date',
            'submitted_at' => 'datetime',
            'checked_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'settled_at' => 'datetime',
        ];
    }

    /**
     * The employee that this claim belongs to.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * The invoice that this claim belongs to.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * The notes belonging to this claim.
     */
    public function claimNotes(): HasMany
    {
        return $this->hasMany(ClaimNote::class);
    }

    /**
     * The attachments belonging to this claim.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(ClaimAttachment::class);
    }

    /**
     * The user who checked this claim.
     */
    public function checkedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_by');
    }

    /**
     * The user who confirmed this claim.
     */
    public function confirmedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    /**
     * The user who created this claim.
     */
    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include claims with a given status.
     */
    public function scopeOfStatus(Builder $query, ClaimStatus $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include claims of a given type.
     */
    public function scopeOfType(Builder $query, $type): Builder
    {
        return $query->where('claim_type', $type);
    }
}
