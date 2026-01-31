<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionCase extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'commission_cases';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'case_number',
        'employee_id',
        'commission_case_type_id',
        'claim_id',
        'subject',
        'description',
        'status',
        'verdict',
        'verdict_template_id',
        'verdict_date',
        'verdict_date_jalali',
        'assigned_to',
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
            'verdict_date' => 'date',
        ];
    }

    /**
     * The employee that this case belongs to.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * The commission case type that this case belongs to.
     */
    public function caseType(): BelongsTo
    {
        return $this->belongsTo(CommissionCaseType::class, 'commission_case_type_id');
    }

    /**
     * The claim that this case belongs to.
     */
    public function claim(): BelongsTo
    {
        return $this->belongsTo(Claim::class);
    }

    /**
     * The verdict template used for this case.
     */
    public function verdictTemplate(): BelongsTo
    {
        return $this->belongsTo(VerdictTemplate::class);
    }

    /**
     * The user assigned to this case.
     */
    public function assignedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * The user who created this case.
     */
    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
