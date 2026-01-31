import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import SelectField from '../../components/ui/SelectField';
import DatePicker from '../../components/ui/DatePicker';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

import { useClaimStatuses, useClaimTypes } from '../../hooks/useLookups';
import { reportsApi } from '../../api/reports';
import { formatDate, formatCurrency, formatNumber } from '../../utils/format';

// ---------------------------------------------------------------------------
// Helper: read URL search params
// ---------------------------------------------------------------------------
function getParam(sp: URLSearchParams, key: string, fallback = ''): string {
  return sp.get(key) ?? fallback;
}

function getNumericParam(sp: URLSearchParams, key: string, fallback: number): number {
  const v = sp.get(key);
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return isNaN(n) ? fallback : n;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ClaimReportRow {
  id: number;
  claim_number: string;
  employee_name: string;
  center_name: string;
  claim_type_title: string;
  claim_date: string;
  total_amount: number;
  approved_amount: number;
  status: string;
  status_title?: string;
  [key: string]: unknown;
}

interface ClaimReportResponse {
  data: ClaimReportRow[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  summary?: {
    total_count: number;
    total_amount: number;
    total_approved: number;
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ClaimReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ---- Lookups ------------------------------------------------------------
  const { data: claimStatusOptions = [] } = useClaimStatuses();
  const { data: claimTypeOptions = [] } = useClaimTypes();

  // ---- URL-driven state ---------------------------------------------------
  const page = getNumericParam(searchParams, 'page', 1);
  const perPage = getNumericParam(searchParams, 'per_page', 20);

  // ---- Filter state (local until "search" is clicked) ---------------------
  const [dateFrom, setDateFrom] = useState(getParam(searchParams, 'date_from'));
  const [dateTo, setDateTo] = useState(getParam(searchParams, 'date_to'));
  const [status, setStatus] = useState(getParam(searchParams, 'status'));
  const [claimTypeId, setClaimTypeId] = useState(getParam(searchParams, 'claim_type_id'));
  const [centerId, setCenterId] = useState(getParam(searchParams, 'center_id'));

  // ---- Export loading state -----------------------------------------------
  const [exporting, setExporting] = useState(false);

  // ---- URL param updater --------------------------------------------------
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([k, v]) => {
          if (v === undefined || v === '') {
            next.delete(k);
          } else {
            next.set(k, v);
          }
        });
        return next;
      });
    },
    [setSearchParams],
  );

  // ---- Build query params from URL ----------------------------------------
  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      per_page: perPage,
    };
    const df = getParam(searchParams, 'date_from');
    const dt = getParam(searchParams, 'date_to');
    const st = getParam(searchParams, 'status');
    const ct = getParam(searchParams, 'claim_type_id');
    const ci = getParam(searchParams, 'center_id');
    if (df) params.date_from = df;
    if (dt) params.date_to = dt;
    if (st) params.status = st;
    if (ct) params.claim_type_id = ct;
    if (ci) params.center_id = ci;
    return params;
  }, [page, perPage, searchParams]);

  // ---- Data query ---------------------------------------------------------
  const { data: response, isLoading } = useQuery({
    queryKey: ['report-claims', queryParams],
    queryFn: () => reportsApi.claims(queryParams) as Promise<ClaimReportResponse>,
    placeholderData: keepPreviousData,
  });

  const rows: ClaimReportRow[] = response?.data ?? [];
  const meta = response?.meta;
  const summary = response?.summary;

  // ---- Apply filters (search button) --------------------------------------
  const handleSearch = () => {
    updateParams({
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      status: status || undefined,
      claim_type_id: claimTypeId || undefined,
      center_id: centerId || undefined,
      page: '1',
    });
  };

  // ---- Export handler ------------------------------------------------------
  const handleExport = async () => {
    setExporting(true);
    try {
      const params: Record<string, unknown> = {};
      const df = getParam(searchParams, 'date_from');
      const dt = getParam(searchParams, 'date_to');
      const st = getParam(searchParams, 'status');
      const ct = getParam(searchParams, 'claim_type_id');
      const ci = getParam(searchParams, 'center_id');
      if (df) params.date_from = df;
      if (dt) params.date_to = dt;
      if (st) params.status = st;
      if (ct) params.claim_type_id = ct;
      if (ci) params.center_id = ci;

      const blob = await reportsApi.exportClaims(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'claims-report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('فایل گزارش با موفقیت دانلود شد');
    } catch {
      toast.error('خطا در دانلود فایل گزارش');
    } finally {
      setExporting(false);
    }
  };

  // ---- Pagination handlers ------------------------------------------------
  const handlePageChange = useCallback(
    (p: number) => updateParams({ page: String(p) }),
    [updateParams],
  );

  const handlePerPageChange = useCallback(
    (pp: number) => updateParams({ per_page: String(pp), page: '1' }),
    [updateParams],
  );

  // ---- Columns definition -------------------------------------------------
  const columns = useMemo<Column<ClaimReportRow>[]>(
    () => [
      {
        key: 'claim_number',
        title: 'شماره پرونده',
      },
      {
        key: 'employee_name',
        title: 'نام بیمه‌شده',
      },
      {
        key: 'center_name',
        title: 'مرکز درمانی',
      },
      {
        key: 'claim_type_title',
        title: 'نوع خسارت',
      },
      {
        key: 'claim_date',
        title: 'تاریخ خسارت',
        render: (row) => formatDate(row.claim_date),
      },
      {
        key: 'total_amount',
        title: 'مبلغ کل',
        render: (row) => formatCurrency(row.total_amount),
      },
      {
        key: 'approved_amount',
        title: 'مبلغ تایید شده',
        render: (row) => formatCurrency(row.approved_amount),
      },
      {
        key: 'status',
        title: 'وضعیت',
        render: (row) => (
          <StatusBadge status={row.status} label={row.status_title} />
        ),
      },
    ],
    [],
  );

  // ---- Input class --------------------------------------------------------
  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary';

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">گزارش خسارات</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
          {/* date_from */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">از تاریخ</label>
            <DatePicker
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="از تاریخ..."
            />
          </div>

          {/* date_to */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تا تاریخ</label>
            <DatePicker
              value={dateTo}
              onChange={setDateTo}
              placeholder="تا تاریخ..."
            />
          </div>

          {/* status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
            <SelectField
              options={claimStatusOptions}
              placeholder="همه وضعیت‌ها..."
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>

          {/* claim_type_id */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع خسارت</label>
            <SelectField
              options={claimTypeOptions}
              placeholder="همه انواع..."
              value={claimTypeId}
              onChange={(e) => setClaimTypeId(e.target.value)}
            />
          </div>

          {/* center_id */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">کد مرکز</label>
            <input
              type="text"
              value={centerId}
              onChange={(e) => setCenterId(e.target.value)}
              className={inputClass}
              placeholder="کد مرکز درمانی..."
              dir="ltr"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-4">
          <Button
            icon={<MagnifyingGlassIcon className="w-4 h-4" />}
            onClick={handleSearch}
          >
            جستجو
          </Button>
          <Button
            variant="secondary"
            icon={<ArrowDownTrayIcon className="w-4 h-4" />}
            onClick={handleExport}
            loading={exporting}
          >
            خروجی اکسل
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">تعداد کل خسارات</p>
            <p className="text-2xl font-bold text-gray-800">{formatNumber(summary.total_count)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">مبلغ کل</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.total_amount)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">مبلغ تایید شده</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(summary.total_approved)}</p>
          </div>
        </div>
      )}

      {/* Data Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <DataTable<ClaimReportRow>
          columns={columns}
          data={rows}
          loading={isLoading}
          keyField="id"
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
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      )}
    </div>
  );
}
