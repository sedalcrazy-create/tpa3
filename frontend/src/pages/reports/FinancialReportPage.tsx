import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import DatePicker from '../../components/ui/DatePicker';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

import { reportsApi } from '../../api/reports';
import { formatCurrency, formatNumber } from '../../utils/format';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const COLORS = ['#7d3cff', '#c80e13', '#f2d53c', '#10b981', '#3b82f6', '#f97316', '#6366f1', '#ec4899'];

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
interface FinancialRow {
  id: number;
  center_name: string;
  center_type: string;
  invoices_amount: number;
  approved_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  [key: string]: unknown;
}

interface MonthlyFinancial {
  month: string;
  invoices: number;
  approved: number;
  paid: number;
}

interface CenterTypeDistribution {
  name: string;
  value: number;
}

interface FinancialReportResponse {
  data: FinancialRow[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  summary?: {
    total_invoices_amount: number;
    total_approved: number;
    total_paid: number;
    total_outstanding: number;
  };
  charts?: {
    monthly: MonthlyFinancial[];
    by_center_type: CenterTypeDistribution[];
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function FinancialReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ---- URL-driven state ---------------------------------------------------
  const page = getNumericParam(searchParams, 'page', 1);
  const perPage = getNumericParam(searchParams, 'per_page', 20);

  // ---- Filter state (local until "search" is clicked) ---------------------
  const [dateFrom, setDateFrom] = useState(getParam(searchParams, 'date_from'));
  const [dateTo, setDateTo] = useState(getParam(searchParams, 'date_to'));
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
    const ci = getParam(searchParams, 'center_id');
    if (df) params.date_from = df;
    if (dt) params.date_to = dt;
    if (ci) params.center_id = ci;
    return params;
  }, [page, perPage, searchParams]);

  // ---- Data query ---------------------------------------------------------
  const { data: response, isLoading } = useQuery({
    queryKey: ['report-financial', queryParams],
    queryFn: () => reportsApi.financial(queryParams) as Promise<FinancialReportResponse>,
    placeholderData: keepPreviousData,
  });

  const rows: FinancialRow[] = response?.data ?? [];
  const meta = response?.meta;
  const summary = response?.summary;
  const charts = response?.charts;

  // ---- Apply filters (search button) --------------------------------------
  const handleSearch = () => {
    updateParams({
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
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
      const ci = getParam(searchParams, 'center_id');
      if (df) params.date_from = df;
      if (dt) params.date_to = dt;
      if (ci) params.center_id = ci;

      const blob = await reportsApi.exportFinancial(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'financial-report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('فایل گزارش مالی با موفقیت دانلود شد');
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
  const columns = useMemo<Column<FinancialRow>[]>(
    () => [
      {
        key: 'center_name',
        title: 'مرکز درمانی',
      },
      {
        key: 'center_type',
        title: 'نوع مرکز',
      },
      {
        key: 'invoices_amount',
        title: 'مبلغ صورتحساب',
        render: (row) => formatCurrency(row.invoices_amount),
      },
      {
        key: 'approved_amount',
        title: 'مبلغ تایید شده',
        render: (row) => formatCurrency(row.approved_amount),
      },
      {
        key: 'paid_amount',
        title: 'مبلغ پرداخت شده',
        render: (row) => formatCurrency(row.paid_amount),
      },
      {
        key: 'outstanding_amount',
        title: 'مبلغ باقی‌مانده',
        render: (row) => formatCurrency(row.outstanding_amount),
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
        <h1 className="text-xl font-bold text-gray-800">گزارش مالی</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
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

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">مبلغ کل صورتحساب</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(summary.total_invoices_amount)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">مبلغ تایید شده</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(summary.total_approved)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">مبلغ پرداخت شده</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(summary.total_paid)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">مبلغ باقی‌مانده</p>
                <p className="text-xl font-bold text-orange-500">{formatCurrency(summary.total_outstanding)}</p>
              </div>
            </div>
          )}

          {/* Charts */}
          {charts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Bar Chart */}
              {charts.monthly && charts.monthly.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">تحلیل مالی ماهانه</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={charts.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip
                        formatter={(value: number) => formatNumber(value)}
                      />
                      <Legend />
                      <Bar dataKey="invoices" fill="#3b82f6" name="صورتحساب" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="approved" fill="#10b981" name="تایید شده" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="paid" fill="#7d3cff" name="پرداخت شده" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Center Type Pie Chart */}
              {charts.by_center_type && charts.by_center_type.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">توزیع بر اساس نوع مرکز</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={charts.by_center_type}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {charts.by_center_type.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatNumber(value)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Data Table */}
          <DataTable<FinancialRow>
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
        </>
      )}
    </div>
  );
}
