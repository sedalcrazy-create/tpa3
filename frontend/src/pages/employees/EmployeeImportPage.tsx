import { useState, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

import { employeeImportApi } from '../../api/employeeImport';
import type { ImportHistory, ImportPreview, ImportTempRecord } from '../../api/employeeImport';
import type { PaginationParams } from '../../types/api';
import { formatDate, formatNumber } from '../../utils/format';

// ---------------------------------------------------------------------------
// Import status labels
// ---------------------------------------------------------------------------
const IMPORT_STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  processing: 'در حال پردازش',
  staged: 'آماده بررسی',
  completed: 'تکمیل شده',
  failed: 'ناموفق',
};

// ---------------------------------------------------------------------------
// Import mode options
// ---------------------------------------------------------------------------
const IMPORT_MODES = [
  { value: 'both', label: 'درج و بروزرسانی' },
  { value: 'insert_only', label: 'فقط درج (رکوردهای جدید)' },
  { value: 'update_only', label: 'فقط بروزرسانی (رکوردهای موجود)' },
];

// ---------------------------------------------------------------------------
// Available fields for selective import
// ---------------------------------------------------------------------------
const AVAILABLE_FIELDS = [
  { key: 'first_name', label: 'نام' },
  { key: 'last_name', label: 'نام خانوادگی' },
  { key: 'father_name', label: 'نام پدر' },
  { key: 'national_code', label: 'کد ملی' },
  { key: 'personnel_code', label: 'کد پرسنلی' },
  { key: 'phone', label: 'تلفن' },
  { key: 'mobile', label: 'موبایل' },
  { key: 'email', label: 'ایمیل' },
  { key: 'bank_account_number', label: 'شماره حساب' },
  { key: 'id_number', label: 'شماره شناسنامه' },
  { key: 'address', label: 'آدرس' },
  { key: 'gender', label: 'جنسیت' },
  { key: 'birth_date', label: 'تاریخ تولد' },
  { key: 'employment_date', label: 'تاریخ استخدام' },
  { key: 'status', label: 'وضعیت' },
  { key: 'is_active', label: 'فعال' },
  { key: 'priority', label: 'اولویت' },
  { key: 'location_id', label: 'محل خدمت' },
  { key: 'location_work_id', label: 'محل کار' },
  { key: 'branch_id', label: 'شعبه' },
  { key: 'relation_type_id', label: 'نسبت' },
  { key: 'guardianship_type_id', label: 'نوع سرپرستی' },
  { key: 'special_employee_type_id', label: 'نوع خاص' },
  { key: 'custom_employee_code_id', label: 'کد CEC' },
  { key: 'marriage_status_id', label: 'وضعیت تاهل' },
  { key: 'parent_id', label: 'سرپرست' },
];

// ---------------------------------------------------------------------------
// Helper: read URL search params
// ---------------------------------------------------------------------------
function getNumericParam(sp: URLSearchParams, key: string, fallback: number): number {
  const v = sp.get(key);
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return isNaN(n) ? fallback : n;
}

// ---------------------------------------------------------------------------
// Staged flow state
// ---------------------------------------------------------------------------
type FlowStep = 'idle' | 'uploading' | 'staged' | 'applying' | 'done';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function EmployeeImportPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- URL-driven state for history table ---------------------------------
  const page = getNumericParam(searchParams, 'page', 1);
  const perPage = getNumericParam(searchParams, 'per_page', 20);

  // ---- Staged import flow state -------------------------------------------
  const [flowStep, setFlowStep] = useState<FlowStep>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importMode, setImportMode] = useState('both');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(AVAILABLE_FIELDS.map((f) => f.key)),
  );
  const [stagedImportId, setStagedImportId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<ImportPreview | null>(null);
  const [previewTab, setPreviewTab] = useState<'inserts' | 'updates' | 'errors'>('inserts');

  // ---- Detail modal (for history) -----------------------------------------
  const [selectedImport, setSelectedImport] = useState<ImportHistory | null>(null);

  // ---- URL param updater --------------------------------------------------
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([k, v]) => {
          if (v === undefined || v === '') next.delete(k);
          else next.set(k, v);
        });
        return next;
      });
    },
    [setSearchParams],
  );

  // ---- History query ------------------------------------------------------
  const queryParams = useMemo<PaginationParams>(
    () => ({ page, per_page: perPage, sort_by: 'id', sort_order: 'desc' }),
    [page, perPage],
  );

  const { data: response, isLoading } = useQuery({
    queryKey: ['employee-imports', queryParams],
    queryFn: () => employeeImportApi.list(queryParams),
    placeholderData: keepPreviousData,
  });

  const imports: ImportHistory[] = response?.data ?? [];
  const meta = response?.meta;

  // ---- Stage mutation -----------------------------------------------------
  const stageMutation = useMutation({
    mutationFn: (formData: FormData) => employeeImportApi.stage(formData),
    onSuccess: async (data) => {
      toast.success('فایل با موفقیت پردازش شد');
      setStagedImportId(data.id);
      // Fetch preview
      try {
        const preview = await employeeImportApi.preview(data.id);
        setPreviewData(preview);
        setFlowStep('staged');
      } catch {
        toast.error('خطا در دریافت پیش‌نمایش');
        setFlowStep('idle');
      }
    },
    onError: () => {
      toast.error('خطا در پردازش فایل');
      setFlowStep('idle');
    },
  });

  // ---- Apply mutation -----------------------------------------------------
  const applyMutation = useMutation({
    mutationFn: () => {
      if (!stagedImportId) throw new Error('No staged import');
      return employeeImportApi.apply(
        stagedImportId,
        importMode,
        Array.from(selectedFields),
      );
    },
    onSuccess: (result) => {
      toast.success(
        `عملیات با موفقیت انجام شد: ${result.insert_count} درج، ${result.update_count} بروزرسانی`,
      );
      queryClient.invalidateQueries({ queryKey: ['employee-imports'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setFlowStep('done');
    },
    onError: () => {
      toast.error('خطا در اعمال تغییرات');
      setFlowStep('staged');
    },
  });

  // ---- File handlers ------------------------------------------------------
  const handleFileSelect = (file: File | null) => {
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls'].includes(ext || '')) {
        toast.error('فقط فایل‌های Excel (.xlsx, .xls) مجاز هستند');
        return;
      }
    }
    setSelectedFile(file);
  };

  const handleStage = () => {
    if (!selectedFile) return;
    setFlowStep('uploading');
    const formData = new FormData();
    formData.append('file', selectedFile);
    stageMutation.mutate(formData);
  };

  const handleApply = () => {
    setFlowStep('applying');
    applyMutation.mutate();
  };

  const handleReset = () => {
    setFlowStep('idle');
    setSelectedFile(null);
    setStagedImportId(null);
    setPreviewData(null);
    setPreviewTab('inserts');
    setImportMode('both');
    setSelectedFields(new Set(AVAILABLE_FIELDS.map((f) => f.key)));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await employeeImportApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([blob as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employee_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('قالب دانلود شد');
    } catch {
      toast.error('خطا در دانلود قالب');
    }
  };

  const toggleField = (key: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAllFields = () => {
    if (selectedFields.size === AVAILABLE_FIELDS.length) {
      setSelectedFields(new Set());
    } else {
      setSelectedFields(new Set(AVAILABLE_FIELDS.map((f) => f.key)));
    }
  };

  // ---- Drag and drop handlers ---------------------------------------------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0] || null);
  };

  // ---- History columns ----------------------------------------------------
  const historyColumns = useMemo<Column<ImportHistory & Record<string, unknown>>[]>(
    () => [
      { key: 'id', title: 'شناسه', sortable: true, width: '70px' },
      {
        key: 'file_name',
        title: 'نام فایل',
        render: (row) => <span className="text-sm" dir="ltr">{row.file_name as string}</span>,
      },
      {
        key: 'total_rows',
        title: 'کل ردیف',
        render: (row) => formatNumber(row.total_rows as number),
      },
      {
        key: 'insert_count',
        title: 'درج',
        render: (row) => (
          <span className="text-green-700 font-medium">
            {formatNumber((row.insert_count as number) || 0)}
          </span>
        ),
      },
      {
        key: 'update_count',
        title: 'بروزرسانی',
        render: (row) => (
          <span className="text-blue-700 font-medium">
            {formatNumber((row.update_count as number) || 0)}
          </span>
        ),
      },
      {
        key: 'error_count',
        title: 'خطا',
        render: (row) => (
          <span className={`font-medium ${(row.error_count as number) > 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {formatNumber(row.error_count as number)}
          </span>
        ),
      },
      {
        key: 'status',
        title: 'وضعیت',
        render: (row) => (
          <StatusBadge
            status={row.status as string}
            label={IMPORT_STATUS_LABELS[row.status as string] || (row.status as string)}
          />
        ),
      },
      {
        key: 'created_at',
        title: 'تاریخ',
        render: (row) => formatDate(row.created_at as string),
      },
    ],
    [],
  );

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">ورود گروهی پرسنل</h1>
      </div>

      {/* ================================================================= */}
      {/* STEP: IDLE - Upload zone                                          */}
      {/* ================================================================= */}
      {flowStep === 'idle' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">آپلود فایل Excel</h2>
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowDownTrayIcon className="w-4 h-4" />}
              onClick={handleDownloadTemplate}
            >
              دانلود قالب
            </Button>
          </div>

          {/* Import mode selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">حالت ورود</label>
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value)}
              className="w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {IMPORT_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Drag and drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : selectedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <DocumentTextIcon className="w-10 h-10 text-green-500" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800" dir="ltr">
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-0.5 rounded-full hover:bg-red-100 text-red-500"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <CloudArrowUpIcon className={`w-10 h-10 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-600">فایل را اینجا رها کنید یا کلیک کنید</p>
                <p className="text-xs text-gray-400">فرمت‌های مجاز: Excel (.xlsx, .xls)</p>
              </div>
            )}
          </div>

          {/* Stage button */}
          {selectedFile && (
            <div className="mt-4 flex items-center gap-3">
              <Button
                icon={<CloudArrowUpIcon className="w-4 h-4" />}
                onClick={handleStage}
              >
                آپلود و پردازش
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                انصراف
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP: UPLOADING - Progress                                        */}
      {/* ================================================================= */}
      {flowStep === 'uploading' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">در حال پردازش فایل...</p>
          <p className="text-xs text-gray-400 mt-1">این عملیات ممکن است چند دقیقه طول بکشد</p>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP: STAGED - Preview                                            */}
      {/* ================================================================= */}
      {flowStep === 'staged' && previewData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Summary header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">پیش‌نمایش ورود اطلاعات</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <SummaryCard label="کل ردیف" value={previewData.summary.total_rows} />
              <SummaryCard label="درج جدید" value={previewData.summary.insert_count} color="green" />
              <SummaryCard label="بروزرسانی" value={previewData.summary.update_count} color="blue" />
              <SummaryCard label="رد شده" value={previewData.summary.skip_count} color="gray" />
              <SummaryCard label="خطا" value={previewData.summary.error_count} color="red" />
            </div>
          </div>

          {/* Preview tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-0 px-6">
              {([
                { key: 'inserts' as const, label: `درج (${previewData.inserts.length})` },
                { key: 'updates' as const, label: `بروزرسانی (${previewData.updates.length})` },
                { key: 'errors' as const, label: `خطاها (${previewData.errors.length})` },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPreviewTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    previewTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Preview records */}
          <div className="p-6 max-h-96 overflow-auto">
            <PreviewTable
              records={previewData[previewTab]}
              type={previewTab}
            />
          </div>

          {/* Field selection */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">فیلدهای ورودی</h3>
              <button
                type="button"
                onClick={toggleAllFields}
                className="text-xs text-primary hover:underline"
              >
                {selectedFields.size === AVAILABLE_FIELDS.length ? 'حذف همه' : 'انتخاب همه'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {AVAILABLE_FIELDS.map((f) => (
                <label key={f.key} className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFields.has(f.key)}
                    onChange={() => toggleField(f.key)}
                    className="w-3.5 h-3.5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          {/* Import mode + Apply */}
          <div className="p-6 border-t border-gray-200 flex items-center gap-4">
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {IMPORT_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <Button
              icon={<CheckCircleIcon className="w-4 h-4" />}
              onClick={handleApply}
            >
              اعمال تغییرات
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              انصراف
            </Button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP: APPLYING - Progress                                         */}
      {/* ================================================================= */}
      {flowStep === 'applying' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">در حال اعمال تغییرات...</p>
          <p className="text-xs text-gray-400 mt-1">لطفاً صبر کنید</p>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP: DONE - Result                                               */}
      {/* ================================================================= */}
      {flowStep === 'done' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-lg font-bold text-gray-800 mt-4">عملیات با موفقیت انجام شد</h2>
          <p className="text-sm text-gray-500 mt-2">اطلاعات پرسنل بروزرسانی شد</p>
          <div className="mt-6">
            <Button
              icon={<ArrowPathIcon className="w-4 h-4" />}
              onClick={handleReset}
            >
              ورود فایل جدید
            </Button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Import history table                                              */}
      {/* ================================================================= */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">تاریخچه ورود اطلاعات</h2>
        <DataTable<ImportHistory & Record<string, unknown>>
          columns={historyColumns}
          data={imports as (ImportHistory & Record<string, unknown>)[]}
          loading={isLoading}
          keyField="id"
          actions={(row) => (
            <button
              onClick={() => setSelectedImport(row as unknown as ImportHistory)}
              className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
              title="جزئیات"
            >
              <DocumentTextIcon className="w-4 h-4" />
            </button>
          )}
          pagination={
            meta
              ? {
                  currentPage: meta.current_page,
                  lastPage: meta.last_page,
                  total: meta.total,
                  from: meta.from,
                  to: meta.to,
                  perPage: meta.per_page,
                }
              : undefined
          }
          onPageChange={(p) => updateParams({ page: String(p) })}
          onPerPageChange={(pp) => updateParams({ per_page: String(pp), page: '1' })}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        open={selectedImport !== null}
        onClose={() => setSelectedImport(null)}
        title={selectedImport ? `جزئیات ورود #${selectedImport.id}` : 'جزئیات ورود'}
        size="lg"
      >
        {selectedImport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">نام فایل:</span>{' '}
                <span className="font-medium" dir="ltr">{selectedImport.file_name}</span>
              </div>
              <div>
                <span className="text-gray-500">وضعیت:</span>{' '}
                <StatusBadge
                  status={selectedImport.status}
                  label={IMPORT_STATUS_LABELS[selectedImport.status] || selectedImport.status}
                />
              </div>
              <div>
                <span className="text-gray-500">کل ردیف:</span>{' '}
                <span className="font-medium">{formatNumber(selectedImport.total_rows)}</span>
              </div>
              <div>
                <span className="text-gray-500">درج:</span>{' '}
                <span className="font-medium text-green-700">{formatNumber(selectedImport.insert_count || 0)}</span>
              </div>
              <div>
                <span className="text-gray-500">بروزرسانی:</span>{' '}
                <span className="font-medium text-blue-700">{formatNumber(selectedImport.update_count || 0)}</span>
              </div>
              <div>
                <span className="text-gray-500">خطا:</span>{' '}
                <span className={`font-medium ${selectedImport.error_count > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {formatNumber(selectedImport.error_count)}
                </span>
              </div>
              {selectedImport.import_mode && (
                <div>
                  <span className="text-gray-500">حالت:</span>{' '}
                  <span className="font-medium">
                    {IMPORT_MODES.find((m) => m.value === selectedImport.import_mode)?.label || selectedImport.import_mode}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-500">تاریخ:</span>{' '}
                <span className="font-medium">{formatDate(selectedImport.created_at)}</span>
              </div>
            </div>

            {selectedImport.error_log && (
              <div>
                <h4 className="text-sm font-semibold text-red-700 mb-2">گزارش خطاها</h4>
                <pre
                  className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-800 overflow-x-auto whitespace-pre-wrap max-h-80"
                  dir="ltr"
                >
                  {selectedImport.error_log}
                </pre>
              </div>
            )}

            {!selectedImport.error_log && selectedImport.status === 'completed' && (
              <div className="text-center py-4">
                <p className="text-sm text-green-600 font-medium">
                  ورود اطلاعات بدون خطا انجام شده است
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary card
// ---------------------------------------------------------------------------
function SummaryCard({
  label,
  value,
  color = 'gray',
}: {
  label: string;
  value: number;
  color?: 'green' | 'blue' | 'red' | 'gray';
}) {
  const colorMap = {
    green: 'text-green-700 bg-green-50 border-green-200',
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
    red: 'text-red-700 bg-red-50 border-red-200',
    gray: 'text-gray-700 bg-gray-50 border-gray-200',
  };
  return (
    <div className={`rounded-lg border p-3 ${colorMap[color]}`}>
      <p className="text-xs opacity-75">{label}</p>
      <p className="text-lg font-bold">{formatNumber(value)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview table for staged records
// ---------------------------------------------------------------------------
function PreviewTable({
  records,
  type,
}: {
  records: ImportTempRecord[];
  type: 'inserts' | 'updates' | 'errors';
}) {
  if (records.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-8">
        {type === 'inserts' && 'رکورد جدیدی برای درج وجود ندارد'}
        {type === 'updates' && 'رکوردی برای بروزرسانی وجود ندارد'}
        {type === 'errors' && 'خطایی وجود ندارد'}
      </p>
    );
  }

  if (type === 'errors') {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-red-50 border-b">
            <th className="text-right py-2 px-3 font-medium text-red-700">ردیف</th>
            <th className="text-right py-2 px-3 font-medium text-red-700">کد پرسنلی</th>
            <th className="text-right py-2 px-3 font-medium text-red-700">کد ملی</th>
            <th className="text-right py-2 px-3 font-medium text-red-700">نام</th>
            <th className="text-right py-2 px-3 font-medium text-red-700">خطا</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b last:border-0">
              <td className="py-2 px-3">{r.row_number}</td>
              <td className="py-2 px-3" dir="ltr">{r.personnel_code || '-'}</td>
              <td className="py-2 px-3" dir="ltr">{r.national_code || '-'}</td>
              <td className="py-2 px-3">{r.first_name} {r.last_name}</td>
              <td className="py-2 px-3 text-red-600">{r.error_message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (type === 'updates' && records.some((r) => r.diff_data)) {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-blue-50 border-b">
            <th className="text-right py-2 px-3 font-medium text-blue-700">ردیف</th>
            <th className="text-right py-2 px-3 font-medium text-blue-700">کد پرسنلی</th>
            <th className="text-right py-2 px-3 font-medium text-blue-700">نام</th>
            <th className="text-right py-2 px-3 font-medium text-blue-700">تغییرات</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b last:border-0 align-top">
              <td className="py-2 px-3">{r.row_number}</td>
              <td className="py-2 px-3" dir="ltr">{r.personnel_code || '-'}</td>
              <td className="py-2 px-3">{r.first_name} {r.last_name}</td>
              <td className="py-2 px-3">
                {r.diff_data && Object.keys(r.diff_data).length > 0 ? (
                  <div className="space-y-1">
                    {Object.entries(r.diff_data).map(([field, diff]) => (
                      <div key={field} className="text-xs">
                        <span className="font-medium text-gray-600">{field}:</span>{' '}
                        <span className="text-red-500 line-through">{diff.old || '(خالی)'}</span>{' '}
                        <span className="text-green-600">{diff.new}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">بدون تغییر</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Default: inserts table
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-green-50 border-b">
          <th className="text-right py-2 px-3 font-medium text-green-700">ردیف</th>
          <th className="text-right py-2 px-3 font-medium text-green-700">کد پرسنلی</th>
          <th className="text-right py-2 px-3 font-medium text-green-700">کد ملی</th>
          <th className="text-right py-2 px-3 font-medium text-green-700">نام</th>
          <th className="text-right py-2 px-3 font-medium text-green-700">نام خانوادگی</th>
        </tr>
      </thead>
      <tbody>
        {records.map((r) => (
          <tr key={r.id} className="border-b last:border-0">
            <td className="py-2 px-3">{r.row_number}</td>
            <td className="py-2 px-3" dir="ltr">{r.personnel_code || '-'}</td>
            <td className="py-2 px-3" dir="ltr">{r.national_code || '-'}</td>
            <td className="py-2 px-3">{r.first_name}</td>
            <td className="py-2 px-3">{r.last_name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
