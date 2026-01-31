<?php

namespace App\Models;

use App\Enums\EmployeeStatus;
use App\Enums\Gender;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'employees';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'personnel_code',
        'national_code',
        'first_name',
        'last_name',
        'father_name',
        'gender',
        'birth_date',
        'birth_date_jalali',
        'id_number',
        'phone',
        'mobile',
        'email',
        'address',
        'postal_code',
        'province_id',
        'location_id',
        'custom_employee_code_id',
        'special_employee_type_id',
        'relation_type_id',
        'guardianship_type_id',
        'parent_id',
        'employment_date',
        'employment_date_jalali',
        'retirement_date',
        'status',
        'bank_account_number',
        'iban',
        'is_head_of_family',
        'is_active',
        'priority',
        'description',
        'photo',
        'marriage_status_id',
        'location_work_id',
        'branch_id',
        'bazneshasegi_date',
        'hoghogh_branch_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'employment_date' => 'date',
            'retirement_date' => 'date',
            'is_head_of_family' => 'boolean',
            'is_active' => 'boolean',
            'gender' => Gender::class,
            'status' => EmployeeStatus::class,
        ];
    }

    /**
     * The province that the employee belongs to.
     */
    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    /**
     * The location that the employee belongs to.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * The custom employee code that the employee belongs to.
     */
    public function customEmployeeCode(): BelongsTo
    {
        return $this->belongsTo(CustomEmployeeCode::class);
    }

    /**
     * The special employee type that the employee belongs to.
     */
    public function specialEmployeeType(): BelongsTo
    {
        return $this->belongsTo(SpecialEmployeeType::class);
    }

    /**
     * The relation type that the employee belongs to.
     */
    public function relationType(): BelongsTo
    {
        return $this->belongsTo(RelationType::class);
    }

    /**
     * The guardianship type that the employee belongs to.
     */
    public function guardianshipType(): BelongsTo
    {
        return $this->belongsTo(GuardianshipType::class);
    }

    /**
     * The marriage status of the employee.
     */
    public function marriageStatus(): BelongsTo
    {
        return $this->belongsTo(MarriageStatus::class);
    }

    /**
     * The work location of the employee.
     */
    public function locationWork(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_work_id');
    }

    /**
     * The parent employee (head of family).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'parent_id');
    }

    /**
     * The dependent employees under this employee.
     */
    public function dependents(): HasMany
    {
        return $this->hasMany(Employee::class, 'parent_id');
    }

    /**
     * The insurances belonging to the employee.
     */
    public function insurances(): HasMany
    {
        return $this->hasMany(Insurance::class);
    }

    /**
     * The active insurance of the employee.
     */
    public function activeInsurance(): HasOne
    {
        return $this->hasOne(Insurance::class)->where('status', 'active')->latest();
    }

    /**
     * The prescriptions belonging to the employee.
     */
    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    /**
     * The claims belonging to the employee.
     */
    public function claims(): HasMany
    {
        return $this->hasMany(Claim::class);
    }

    /**
     * The illnesses belonging to the employee.
     */
    public function illnesses(): HasMany
    {
        return $this->hasMany(EmployeeIllness::class);
    }

    /**
     * The infractions belonging to the employee.
     */
    public function infractions(): HasMany
    {
        return $this->hasMany(EmployeeInfraction::class);
    }

    /**
     * The special discounts belonging to the employee.
     */
    public function specialDiscounts(): HasMany
    {
        return $this->hasMany(EmployeeSpecialDiscount::class);
    }

    /**
     * Scope a query to only include active employees.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include head of family employees.
     */
    public function scopeHeadOfFamily(Builder $query): Builder
    {
        return $query->where('is_head_of_family', true);
    }

    /**
     * Get the employee's full name.
     */
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }
}
