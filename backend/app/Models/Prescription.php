<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Prescription extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'prescriptions';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'prescription_number',
        'employee_id',
        'doctor_id',
        'center_id',
        'prescription_type_id',
        'prescription_date',
        'prescription_date_jalali',
        'diagnosis_code',
        'illness_id',
        'notes',
        'is_emergency',
        'is_chronic',
        'status',
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
            'prescription_date' => 'date',
            'is_emergency' => 'boolean',
            'is_chronic' => 'boolean',
        ];
    }

    /**
     * The employee that this prescription belongs to.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * The doctor that this prescription belongs to.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * The center that this prescription belongs to.
     */
    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    /**
     * The prescription type that this prescription belongs to.
     */
    public function prescriptionType(): BelongsTo
    {
        return $this->belongsTo(PrescriptionType::class);
    }

    /**
     * The illness that this prescription belongs to.
     */
    public function illness(): BelongsTo
    {
        return $this->belongsTo(Illness::class);
    }

    /**
     * The invoices belonging to this prescription.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * The user who created this prescription.
     */
    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include active prescriptions.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
