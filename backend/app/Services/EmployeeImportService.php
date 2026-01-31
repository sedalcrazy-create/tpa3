<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeImportHistory;
use App\Models\EmployeeImportTemp;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Morilog\Jalali\Jalalian;
use PhpOffice\PhpSpreadsheet\IOFactory;
use XMLReader;

class EmployeeImportService
{
    /**
     * 33-column Excel mapping: Excel header -> TPA3 column.
     */
    protected const COLUMN_MAP = [
        'NewPCode'                => 'personnel_code',
        'employee_active'         => 'is_active',
        'employee_priority'       => 'priority',
        'employee_status'         => 'status',
        'id_cec'                  => 'custom_employee_code_id',
        'id_set'                  => 'special_employee_type_id',
        'id_employee_parent'      => 'parent_id',
        'employee_discription'    => 'description',
        'employee_craete_date'    => '_create_date',
        'employee_first_name'     => 'first_name',
        'employee_last_name'      => 'last_name',
        'employee_phone_number'   => 'phone',
        'employee_mobile_number'  => 'mobile',
        'employee_personnel_code' => '_festno',
        'employee_account_number' => 'bank_account_number',
        'employee_email'          => 'email',
        'employee_picture'        => 'photo',
        'id_rt'                   => 'relation_type_id',
        'employee_meli_code'      => 'national_code',
        'id_gt'                   => 'guardianship_type_id',
        'id_gender'               => 'gender',
        'id_ms'                   => 'marriage_status_id',
        'employee_birthday'       => 'birth_date_jalali',
        'id_location'             => 'location_id',
        'id_location_work'        => 'location_work_id',
        'employee_father_name'    => 'father_name',
        'id_branch'               => 'branch_id',
        'employee_start_date'     => 'employment_date_jalali',
        'employee_out_date'       => '_retirement_date_jalali',
        'BazDate'                 => 'bazneshasegi_date',
        'Shenasname'              => 'id_number',
        'Hoghogh'                 => 'hoghogh_branch_id',
        'Address'                 => 'address',
    ];

    /**
     * Fields that are valid for direct insert/update on the employees table.
     */
    protected const EMPLOYEE_FIELDS = [
        'personnel_code', 'national_code', 'first_name', 'last_name', 'father_name',
        'gender', 'birth_date', 'birth_date_jalali', 'id_number', 'phone', 'mobile',
        'email', 'address', 'location_id', 'custom_employee_code_id',
        'special_employee_type_id', 'relation_type_id', 'guardianship_type_id',
        'parent_id', 'employment_date', 'employment_date_jalali', 'retirement_date',
        'status', 'bank_account_number', 'is_active', 'priority', 'photo',
        'marriage_status_id', 'location_work_id', 'branch_id', 'bazneshasegi_date',
        'hoghogh_branch_id', 'description',
    ];

    /**
     * Status mappings from HR system numeric codes.
     */
    protected const STATUS_MAP = [
        1 => 'active',
        2 => 'inactive',
        3 => 'retired',
        4 => 'deceased',
    ];

    // ── Legacy import (kept for backward compat) ──────

    public function import(UploadedFile $file, int $userId): EmployeeImportHistory
    {
        $filePath = $file->store('imports/employees', 'local');

        $importHistory = EmployeeImportHistory::create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'total_rows' => 0,
            'success_count' => 0,
            'error_count' => 0,
            'status' => 'processing',
            'imported_by' => $userId,
            'started_at' => now(),
        ]);

        $successCount = 0;
        $errorCount = 0;
        $totalRows = 0;
        $errors = [];

        try {
            $handle = fopen($file->getRealPath(), 'r');

            if ($handle === false) {
                $this->markAsFailed($importHistory, 'خطا در باز کردن فایل.');
                return $importHistory;
            }

            $header = fgetcsv($handle);
            if ($header === false) {
                fclose($handle);
                $this->markAsFailed($importHistory, 'فایل خالی است یا فرمت آن نامعتبر است.');
                return $importHistory;
            }

            while (($row = fgetcsv($handle)) !== false) {
                $totalRows++;
                $rowNumber = $totalRows + 1;
                $rowData = $this->mapLegacyRowData($row);
                $validationResult = $this->validateLegacyRow($rowData);

                $tempRecord = EmployeeImportTemp::create([
                    'import_history_id' => $importHistory->id,
                    'row_number' => $rowNumber,
                    'personnel_code' => $rowData['personnel_code'] ?? null,
                    'national_code' => $rowData['national_code'] ?? null,
                    'first_name' => $rowData['first_name'] ?? null,
                    'last_name' => $rowData['last_name'] ?? null,
                    'raw_data' => $rowData,
                    'status' => $validationResult['valid'] ? 'valid' : 'error',
                    'error_message' => $validationResult['valid'] ? null : implode(' | ', $validationResult['errors']),
                ]);

                if ($validationResult['valid']) {
                    try {
                        DB::beginTransaction();
                        $employeeData = array_filter($rowData, fn ($v) => $v !== null && $v !== '');
                        Employee::updateOrCreate(
                            ['national_code' => $rowData['national_code']],
                            array_merge($employeeData, ['is_active' => true])
                        );
                        $tempRecord->update(['status' => 'imported']);
                        DB::commit();
                        $successCount++;
                    } catch (\Exception $e) {
                        DB::rollBack();
                        $errorCount++;
                        $errors[] = "سطر {$rowNumber}: {$e->getMessage()}";
                        $tempRecord->update(['status' => 'error', 'error_message' => $e->getMessage()]);
                    }
                } else {
                    $errorCount++;
                    $errors[] = "سطر {$rowNumber}: " . implode(' | ', $validationResult['errors']);
                }
            }

            fclose($handle);

            $importHistory->update([
                'total_rows' => $totalRows,
                'success_count' => $successCount,
                'error_count' => $errorCount,
                'status' => $errorCount === 0 ? 'completed' : 'completed_with_errors',
                'completed_at' => now(),
                'error_log' => !empty($errors) ? implode("\n", $errors) : null,
            ]);
        } catch (\Exception $e) {
            Log::error('Employee import failed', ['import_history_id' => $importHistory->id, 'error' => $e->getMessage()]);
            $this->markAsFailed($importHistory, $e->getMessage());
        }

        return $importHistory->fresh();
    }

    // ── Staged import flow ────────────────────────────

    /**
     * Stage: Upload XLSX, parse with PhpSpreadsheet, map columns, validate,
     * write to temp table, compute diffs.
     */
    public function stage(UploadedFile $file, int $userId): EmployeeImportHistory
    {
        $filePath = $file->store('imports/employees', 'local');

        $importHistory = EmployeeImportHistory::create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'total_rows' => 0,
            'success_count' => 0,
            'error_count' => 0,
            'status' => 'staged',
            'imported_by' => $userId,
            'started_at' => now(),
            'import_mode' => 'both',
        ]);

        try {
            $realPath = $file->getRealPath();

            $totalRows = 0;
            $insertCount = 0;
            $updateCount = 0;
            $errorCount = 0;
            $skipCount = 0;
            $tempRecords = [];

            foreach ($this->streamParseXlsx($realPath) as $mapped) {
                $totalRows++;

                if (empty($mapped['personnel_code']) && empty($mapped['national_code'])) {
                    $skipCount++;
                    continue;
                }

                $transformed = $this->transformRow($mapped);

                // Check if employee exists
                $existingEmployee = null;
                if (!empty($transformed['personnel_code'])) {
                    $existingEmployee = Employee::where('personnel_code', $transformed['personnel_code'])->first();
                }
                if (!$existingEmployee && !empty($transformed['national_code'])) {
                    $existingEmployee = Employee::where('national_code', $transformed['national_code'])->first();
                }

                $action = 'insert';
                $diffData = null;

                if ($existingEmployee) {
                    $action = 'update';
                    $diffData = $this->computeDiff($existingEmployee, $transformed);
                }

                $validation = $this->validateStagedRow($transformed, $existingEmployee);
                if (!$validation['valid']) {
                    $action = 'error';
                    $errorCount++;
                } else {
                    if ($action === 'insert') $insertCount++;
                    else $updateCount++;
                }

                $tempRecords[] = [
                    'import_history_id' => $importHistory->id,
                    'row_number' => $totalRows,
                    'personnel_code' => $transformed['personnel_code'] ?? null,
                    'national_code' => $transformed['national_code'] ?? null,
                    'first_name' => $transformed['first_name'] ?? null,
                    'last_name' => $transformed['last_name'] ?? null,
                    'new_p_code' => $mapped['personnel_code'] ?? null,
                    'action' => $action,
                    'matched_employee_id' => $existingEmployee?->id,
                    'diff_data' => $diffData ? json_encode($diffData) : null,
                    'raw_data' => json_encode($transformed),
                    'status' => $action === 'error' ? 'error' : 'staged',
                    'error_message' => $action === 'error' ? implode(' | ', $validation['errors']) : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Flush every 1000 rows
                if (count($tempRecords) >= 1000) {
                    DB::table('employees_import_temp')->insert($tempRecords);
                    $tempRecords = [];
                }
            }

            // Flush remaining
            if (!empty($tempRecords)) {
                DB::table('employees_import_temp')->insert($tempRecords);
            }

            $importHistory->update([
                'total_rows' => $totalRows,
                'insert_count' => $insertCount,
                'update_count' => $updateCount,
                'skip_count' => $skipCount,
                'error_count' => $errorCount,
                'status' => 'staged',
            ]);
        } catch (\Exception $e) {
            Log::error('Employee stage import failed', [
                'import_history_id' => $importHistory->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            $this->markAsFailed($importHistory, $e->getMessage());
        }

        return $importHistory->fresh();
    }

    /**
     * Preview staged data.
     */
    public function preview(int $importId): array
    {
        $history = EmployeeImportHistory::findOrFail($importId);

        $summary = [
            'id' => $history->id,
            'file_name' => $history->file_name,
            'total_rows' => $history->total_rows,
            'insert_count' => $history->insert_count,
            'update_count' => $history->update_count,
            'skip_count' => $history->skip_count,
            'error_count' => $history->error_count,
            'status' => $history->status,
        ];

        // Get sample rows (first 100 of each type)
        $inserts = EmployeeImportTemp::where('import_history_id', $importId)
            ->where('action', 'insert')
            ->limit(100)
            ->get(['id', 'row_number', 'personnel_code', 'national_code', 'first_name', 'last_name', 'action', 'raw_data']);

        $updates = EmployeeImportTemp::where('import_history_id', $importId)
            ->where('action', 'update')
            ->limit(100)
            ->get(['id', 'row_number', 'personnel_code', 'national_code', 'first_name', 'last_name', 'action', 'diff_data', 'matched_employee_id']);

        $errors = EmployeeImportTemp::where('import_history_id', $importId)
            ->where('action', 'error')
            ->limit(100)
            ->get(['id', 'row_number', 'personnel_code', 'national_code', 'first_name', 'last_name', 'error_message']);

        return [
            'summary' => $summary,
            'inserts' => $inserts,
            'updates' => $updates,
            'errors' => $errors,
        ];
    }

    /**
     * Apply staged import with selected mode and fields.
     * Two-pass: first pass for all non-parent fields, second for parent_id resolution.
     */
    public function apply(int $importId, string $importMode, ?array $selectedFields = null): array
    {
        $history = EmployeeImportHistory::findOrFail($importId);

        if ($history->status !== 'staged') {
            throw new \RuntimeException('این ورود قبلاً اعمال شده است.');
        }

        $history->update([
            'status' => 'processing',
            'import_mode' => $importMode,
            'selected_fields' => $selectedFields,
        ]);

        $insertCount = 0;
        $updateCount = 0;
        $errorCount = 0;
        $errors = [];

        // Determine valid actions based on mode
        $validActions = match ($importMode) {
            'insert_only' => ['insert'],
            'update_only' => ['update'],
            default => ['insert', 'update'],
        };

        // Pass 1: Insert/Update all rows (skip parent_id)
        $query = EmployeeImportTemp::where('import_history_id', $importId)
            ->whereIn('action', $validActions)
            ->where('status', 'staged');

        $query->chunkById(500, function ($rows) use (
            &$insertCount, &$updateCount, &$errorCount, &$errors, $selectedFields, $history
        ) {
            foreach ($rows as $row) {
                try {
                    DB::beginTransaction();

                    $data = is_string($row->raw_data) ? json_decode($row->raw_data, true) : ($row->raw_data ?? []);

                    // Filter to selected fields if specified
                    if ($selectedFields) {
                        $data = array_intersect_key($data, array_flip($selectedFields));
                        // Always keep identifiers
                        if (!empty($row->personnel_code)) {
                            $data['personnel_code'] = $row->personnel_code;
                        }
                        if (!empty($row->national_code)) {
                            $data['national_code'] = $row->national_code;
                        }
                    }

                    // Remove parent_id for first pass
                    $parentRef = $data['parent_id'] ?? null;
                    unset($data['parent_id']);

                    // Only keep valid employee fields
                    $data = array_intersect_key($data, array_flip(self::EMPLOYEE_FIELDS));

                    // Nullify FK fields that reference non-existent records
                    $data = $this->sanitizeForeignKeys($data);

                    if ($row->action === 'insert') {
                        if (!isset($data['is_active'])) {
                            $data['is_active'] = true;
                        }
                        Employee::create($data);
                        $insertCount++;
                    } elseif ($row->action === 'update' && $row->matched_employee_id) {
                        $employee = Employee::find($row->matched_employee_id);
                        if ($employee) {
                            // COALESCE: only update non-null new values
                            $updateData = array_filter($data, fn ($v) => $v !== null && $v !== '');
                            unset($updateData['personnel_code']); // Don't change PK on update
                            $employee->update($updateData);
                            $updateCount++;
                        }
                    }

                    $row->update(['status' => 'applied']);
                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollBack();
                    $errorCount++;
                    $errors[] = "ردیف {$row->row_number}: {$e->getMessage()}";
                    $row->update(['status' => 'error', 'error_message' => $e->getMessage()]);
                    Log::warning('Import apply row failed', [
                        'import_id' => $history->id,
                        'row' => $row->row_number,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        });

        // Pass 2: Resolve parent_id via personnel_code
        EmployeeImportTemp::where('import_history_id', $importId)
            ->where('status', 'applied')
            ->orderBy('id')
            ->chunk(500, function ($rows) {
                foreach ($rows as $row) {
                    try {
                        $data = is_string($row->raw_data) ? json_decode($row->raw_data, true) : ($row->raw_data ?? []);
                        $parentRef = $data['parent_id'] ?? null;

                        if ($parentRef && is_numeric($parentRef)) {
                            // parent_id is a personnel_code reference from the Excel
                            $parentEmployee = Employee::where('personnel_code', (string) $parentRef)->first();
                            if ($parentEmployee) {
                                $employee = Employee::where('personnel_code', $row->personnel_code)->first();
                                if ($employee && $employee->id !== $parentEmployee->id) {
                                    $employee->update(['parent_id' => $parentEmployee->id]);
                                }
                            }
                        }
                    } catch (\Exception $e) {
                        Log::warning('Parent resolution failed', [
                            'row' => $row->row_number,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            });

        $history->update([
            'status' => $errorCount === 0 ? 'completed' : 'completed_with_errors',
            'completed_at' => now(),
            'insert_count' => $insertCount,
            'update_count' => $updateCount,
            'error_count' => $errorCount,
            'error_log' => !empty($errors) ? implode("\n", $errors) : null,
        ]);

        return [
            'insert_count' => $insertCount,
            'update_count' => $updateCount,
            'error_count' => $errorCount,
            'total_processed' => $insertCount + $updateCount + $errorCount,
        ];
    }

    // ── History ────────────────────────────────────────

    public function getHistory(int $perPage = 20)
    {
        return EmployeeImportHistory::with('importedByUser:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getHistoryDetail(int $id): array
    {
        $history = EmployeeImportHistory::with('importedByUser:id,name')->findOrFail($id);

        $tempRecords = EmployeeImportTemp::where('import_history_id', $id)
            ->orderBy('row_number')
            ->limit(500)
            ->get();

        return [
            'history' => $history,
            'records' => $tempRecords,
        ];
    }

    // ── Template ──────────────────────────────────────

    public function generateTemplate(): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $headers = array_keys(self::COLUMN_MAP);

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        foreach ($headers as $col => $header) {
            $sheet->setCellValueByColumnAndRow($col + 1, 1, $header);
        }

        $tempPath = storage_path('app/temp/employee_import_template.xlsx');
        $dir = dirname($tempPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save($tempPath);

        return response()->download($tempPath, 'employee_import_template.xlsx')->deleteFileAfterSend(true);
    }

    // ── Private helpers ───────────────────────────────

    /**
     * Stream-parse an XLSX file using XMLReader (memory-efficient for large files).
     * Reads shared strings then streams through sheet rows.
     *
     * @return \Generator yields mapped row arrays (header => value)
     */
    private function streamParseXlsx(string $filePath): \Generator
    {
        $zip = new \ZipArchive();
        if ($zip->open($filePath) !== true) {
            throw new \RuntimeException('Cannot open XLSX file');
        }

        // 1. Load shared strings
        $sharedStrings = [];
        $ssXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($ssXml) {
            $reader = new XMLReader();
            $reader->XML($ssXml);
            $idx = 0;
            $inT = false;
            $currentText = '';
            while ($reader->read()) {
                if ($reader->nodeType === XMLReader::ELEMENT && $reader->name === 'si') {
                    $currentText = '';
                }
                if ($reader->nodeType === XMLReader::ELEMENT && $reader->name === 't') {
                    $inT = true;
                }
                if ($inT && $reader->nodeType === XMLReader::TEXT) {
                    $currentText .= $reader->value;
                }
                if ($reader->nodeType === XMLReader::END_ELEMENT && $reader->name === 't') {
                    $inT = false;
                }
                if ($reader->nodeType === XMLReader::END_ELEMENT && $reader->name === 'si') {
                    $sharedStrings[$idx] = $currentText;
                    $idx++;
                    $currentText = '';
                }
            }
            $reader->close();
            unset($ssXml);
        }

        // 2. Find the first worksheet path
        $sheetPath = null;
        foreach (['xl/worksheets/sheet1.xml', 'xl/worksheets/sheet.xml'] as $path) {
            if ($zip->locateName($path) !== false) {
                $sheetPath = $path;
                break;
            }
        }
        if (!$sheetPath) {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = $zip->getNameIndex($i);
                if (str_contains($name, 'worksheets/sheet')) {
                    $sheetPath = $name;
                    break;
                }
            }
        }

        $zip->close();

        if (!$sheetPath) {
            throw new \RuntimeException('No worksheet found in XLSX');
        }

        // 3. Stream-parse sheet via zip:// URI (no temp file needed)
        $reader = new XMLReader();
        $zipUri = 'zip://' . realpath($filePath) . '#' . $sheetPath;
        $reader->open($zipUri);

        $headers = [];
        $headerMap = [];
        $isFirstRow = true;

        while ($reader->read()) {
            if ($reader->nodeType !== XMLReader::ELEMENT || $reader->name !== 'row') {
                continue;
            }

            $rowXml = $reader->readOuterXml();
            $rowDoc = new \DOMDocument();
            $rowDoc->loadXML($rowXml);

            $cells = [];
            foreach ($rowDoc->getElementsByTagName('c') as $cell) {
                $ref = $cell->getAttribute('r');
                $type = $cell->getAttribute('t');
                $vNode = $cell->getElementsByTagName('v')->item(0);
                $value = $vNode ? $vNode->textContent : null;

                // Resolve shared string
                if ($type === 's' && $value !== null && isset($sharedStrings[(int) $value])) {
                    $value = $sharedStrings[(int) $value];
                }

                // Extract column letter from cell ref (e.g., "AG2" -> "AG")
                $colLetter = preg_replace('/[0-9]+/', '', $ref);
                $cells[$colLetter] = $value;
            }

            if ($isFirstRow) {
                $headers = $cells;
                $headerMap = $this->buildHeaderMap($headers);
                $isFirstRow = false;
                continue;
            }

            if (empty($headerMap)) {
                continue;
            }

            // Map using headerMap
            $mapped = $this->mapXlsxRow($cells, $headerMap);
            yield $mapped;
        }

        $reader->close();
    }

    /**
     * Build a mapping from Excel column letters to our field names.
     */
    private function buildHeaderMap(array $headerRow): array
    {
        $map = [];
        foreach ($headerRow as $colLetter => $headerValue) {
            $headerValue = trim((string) $headerValue);
            if (isset(self::COLUMN_MAP[$headerValue])) {
                $map[$colLetter] = self::COLUMN_MAP[$headerValue];
            }
        }
        return $map;
    }

    /**
     * Map a single XLSX row using the header map.
     */
    private function mapXlsxRow(array $row, array $headerMap): array
    {
        $mapped = [];
        foreach ($headerMap as $colLetter => $field) {
            $value = $row[$colLetter] ?? null;
            if (is_string($value)) {
                $value = trim($value);
                // The HR system exports literal "NULL" for empty values
                if (strtoupper($value) === 'NULL') {
                    $value = null;
                }
            }
            $mapped[$field] = ($value !== '' && $value !== null) ? $value : null;
        }
        return $mapped;
    }

    /**
     * Transform raw mapped data to proper employee format.
     */
    private function transformRow(array $data): array
    {
        // Gender: 1=male, 2=female
        if (isset($data['gender']) && is_numeric($data['gender'])) {
            $data['gender'] = match ((int) $data['gender']) {
                1 => 'male',
                2 => 'female',
                default => null,
            };
        }

        // is_active: 1=true
        if (isset($data['is_active'])) {
            $data['is_active'] = (bool) $data['is_active'];
        }

        // Status mapping
        if (isset($data['status']) && is_numeric($data['status'])) {
            $data['status'] = self::STATUS_MAP[(int) $data['status']] ?? 'active';
        }

        // Convert Jalali dates to Gregorian
        if (!empty($data['birth_date_jalali'])) {
            $data['birth_date'] = $this->jalaliToGregorian($data['birth_date_jalali']);
        }

        if (!empty($data['employment_date_jalali'])) {
            $data['employment_date'] = $this->jalaliToGregorian($data['employment_date_jalali']);
        }

        if (!empty($data['_retirement_date_jalali'])) {
            $data['retirement_date'] = $this->jalaliToGregorian($data['_retirement_date_jalali']);
            unset($data['_retirement_date_jalali']);
        }

        // Remove internal-only fields
        unset($data['_festno'], $data['_create_date']);

        // Ensure FK fields are integer or null
        $fkFields = [
            'custom_employee_code_id', 'special_employee_type_id', 'relation_type_id',
            'guardianship_type_id', 'marriage_status_id', 'location_id', 'location_work_id',
            'branch_id', 'hoghogh_branch_id', 'priority',
        ];
        foreach ($fkFields as $field) {
            if (isset($data[$field]) && $data[$field] !== null) {
                $data[$field] = is_numeric($data[$field]) ? (int) $data[$field] : null;
            }
        }

        return $data;
    }

    /**
     * Convert Jalali date string to Gregorian Y-m-d.
     */
    private function jalaliToGregorian(?string $jalali): ?string
    {
        if (!$jalali) return null;

        try {
            // Handle various formats: 1404/08/11, 1404-08-11, 14040811
            $clean = str_replace(['/', '-'], '', $jalali);
            if (strlen($clean) === 8) {
                $year = (int) substr($clean, 0, 4);
                $month = (int) substr($clean, 4, 2);
                $day = (int) substr($clean, 6, 2);

                if ($year > 0 && $month >= 1 && $month <= 12 && $day >= 1 && $day <= 31) {
                    return Jalalian::fromFormat('Y/m/d', "{$year}/{$month}/{$day}")
                        ->toCarbon()
                        ->format('Y-m-d');
                }
            }
        } catch (\Exception $e) {
            Log::debug('Jalali date conversion failed', ['input' => $jalali, 'error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Compute diff between existing employee and incoming data.
     */
    private function computeDiff(Employee $existing, array $incoming): array
    {
        $diff = [];

        foreach ($incoming as $field => $newValue) {
            if ($newValue === null || str_starts_with($field, '_')) {
                continue;
            }

            if (!in_array($field, self::EMPLOYEE_FIELDS)) {
                continue;
            }

            $oldValue = $existing->{$field};

            // Normalize for comparison
            if ($oldValue instanceof \BackedEnum) {
                $oldValue = $oldValue->value;
            }
            if ($oldValue instanceof \DateTimeInterface) {
                $oldValue = $oldValue->format('Y-m-d');
            }
            if (is_bool($oldValue)) {
                $oldValue = $oldValue ? '1' : '0';
            }

            $newStr = (string) $newValue;
            $oldStr = (string) ($oldValue ?? '');

            if ($newStr !== $oldStr) {
                $diff[$field] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $diff;
    }

    /**
     * Validate a staged row.
     */
    private function validateStagedRow(array $data, ?Employee $existing): array
    {
        $rules = [
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'national_code' => ['nullable', 'string', 'max:10'],
        ];

        // For new inserts, require key fields
        if (!$existing) {
            $rules['personnel_code'] = ['required', 'string', 'max:20'];
            $rules['first_name'] = ['required', 'string', 'max:255'];
            $rules['last_name'] = ['required', 'string', 'max:255'];
        }

        $validator = Validator::make($data, $rules, [
            'personnel_code.required' => 'کد پرسنلی برای رکوردهای جدید الزامی است',
            'first_name.required' => 'نام برای رکوردهای جدید الزامی است',
            'last_name.required' => 'نام خانوادگی برای رکوردهای جدید الزامی است',
        ]);

        if ($validator->fails()) {
            return ['valid' => false, 'errors' => $validator->errors()->all()];
        }

        return ['valid' => true, 'errors' => []];
    }

    /**
     * Nullify FK fields that reference non-existent records.
     */
    private function sanitizeForeignKeys(array $data): array
    {
        $fkChecks = [
            'location_id' => 'locations',
            'location_work_id' => 'locations',
            'custom_employee_code_id' => 'custom_employee_codes',
            'special_employee_type_id' => 'special_employee_types',
            'relation_type_id' => 'relation_types',
            'guardianship_type_id' => 'guardianship_types',
            'marriage_status_id' => 'marriage_statuses',
        ];

        foreach ($fkChecks as $field => $table) {
            if (!empty($data[$field]) && is_numeric($data[$field])) {
                $exists = DB::table($table)->where('id', (int) $data[$field])->exists();
                if (!$exists) {
                    $data[$field] = null;
                }
            }
        }

        return $data;
    }

    // ── Legacy helpers ────────────────────────────────

    private array $legacyColumnMap = [
        0 => 'personnel_code',
        1 => 'national_code',
        2 => 'first_name',
        3 => 'last_name',
        4 => 'father_name',
        5 => 'gender',
        6 => 'birth_date',
        7 => 'mobile',
        8 => 'email',
    ];

    private function mapLegacyRowData(array $row): array
    {
        $data = [];
        foreach ($this->legacyColumnMap as $index => $column) {
            $data[$column] = isset($row[$index]) ? trim($row[$index]) : null;
        }
        return $data;
    }

    private function validateLegacyRow(array $data): array
    {
        $validator = Validator::make($data, [
            'personnel_code' => ['required', 'string', 'max:20'],
            'national_code' => ['required', 'string', 'size:10'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
        ], [
            'personnel_code.required' => 'کد پرسنلی الزامی است',
            'national_code.required' => 'کد ملی الزامی است',
            'national_code.size' => 'کد ملی باید ۱۰ رقم باشد',
            'first_name.required' => 'نام الزامی است',
            'last_name.required' => 'نام خانوادگی الزامی است',
        ]);

        if ($validator->fails()) {
            return ['valid' => false, 'errors' => $validator->errors()->all()];
        }
        return ['valid' => true, 'errors' => []];
    }

    private function markAsFailed(EmployeeImportHistory $importHistory, string $errorMessage): void
    {
        $importHistory->update([
            'status' => 'failed',
            'completed_at' => now(),
            'error_log' => $errorMessage,
        ]);
    }
}
