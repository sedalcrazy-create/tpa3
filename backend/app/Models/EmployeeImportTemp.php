<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeImportTemp extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'employees_import_temp';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'import_history_id',
        'row_number',
        'personnel_code',
        'national_code',
        'first_name',
        'last_name',
        'new_p_code',
        'action',
        'matched_employee_id',
        'diff_data',
        'raw_data',
        'status',
        'error_message',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'raw_data' => 'array',
            'diff_data' => 'array',
        ];
    }

    /**
     * The import history that this temporary record belongs to.
     */
    public function importHistory(): BelongsTo
    {
        return $this->belongsTo(EmployeeImportHistory::class, 'import_history_id');
    }
}
