<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmployeeImportHistory extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'employee_import_history';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'file_name',
        'file_path',
        'total_rows',
        'success_count',
        'error_count',
        'status',
        'imported_by',
        'started_at',
        'completed_at',
        'error_log',
        'import_mode',
        'selected_fields',
        'insert_count',
        'update_count',
        'skip_count',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'selected_fields' => 'array',
        ];
    }

    /**
     * The user who performed the import.
     */
    public function importedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }

    /**
     * The temporary import records belonging to this import history.
     */
    public function tempRecords(): HasMany
    {
        return $this->hasMany(EmployeeImportTemp::class, 'import_history_id');
    }
}
