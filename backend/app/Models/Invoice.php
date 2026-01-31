<?php

namespace App\Models;

use App\Enums\InvoiceStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'invoices';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'invoice_number',
        'prescription_id',
        'employee_id',
        'center_id',
        'invoice_date',
        'invoice_date_jalali',
        'total_amount',
        'insurance_share',
        'patient_share',
        'discount_amount',
        'deduction_amount',
        'paid_amount',
        'status',
        'calculated_at',
        'submitted_at',
        'notes',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'invoice_date' => 'date',
            'total_amount' => 'decimal:2',
            'insurance_share' => 'decimal:2',
            'patient_share' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'deduction_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'calculated_at' => 'datetime',
            'submitted_at' => 'datetime',
            'status' => InvoiceStatus::class,
        ];
    }

    /**
     * The prescription that this invoice belongs to.
     */
    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    /**
     * The employee that this invoice belongs to.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * The center that this invoice belongs to.
     */
    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    /**
     * The items belonging to this invoice.
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * The claim associated with this invoice.
     */
    public function claim(): HasOne
    {
        return $this->hasOne(Claim::class);
    }

    /**
     * The user who created this invoice.
     */
    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include invoices with a given status.
     */
    public function scopeOfStatus(Builder $query, $status): Builder
    {
        return $query->where('status', $status);
    }
}
