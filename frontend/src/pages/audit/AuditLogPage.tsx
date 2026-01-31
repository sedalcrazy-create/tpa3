import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  ClipboardDocumentListIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import SelectField from '../../components/ui/SelectField';
import DatePicker from '../../components/ui/DatePicker';
import Modal from '../../components/ui/Modal';

import { useDebounce } from '../../hooks/useDebounce';
import { auditApi } from '../../api/audit';
import type { AuditLog } from '../../api/audit';
import type { PaginationParams } from '../../types/api';
import { formatDate } from '../../utils/format';

// ---------------------------------------------------------------------------
// Persian labels for actions
// ---------------------------------------------------------------------------
const ACTION_LABELS: Record<string, string> = {
  create: '\u0627\u06CC\u062C\u0627\u062F',
  update: '\u0648\u06CC\u0631\u0627\u06CC\u0634',
  delete: '\u062D\u0630\u0641',
  login: '\u0648\u0631\u0648\u062F',
  logout: '\u062E\u0631\u0648\u062C',
};

const ACTION_OPTIONS = [
  { value: 'create', label: '\u0627\u06CC\u062C\u0627\u062F' },
  { value: 'update', label: '\u0648\u06CC\u0631\u0627\u06CC\u0634' },
  { value: 'delete', label: '\u062D\u0630\u0641' },
  { value: 'login', label: '\u0648\u0631\u0648\u062F' },
  { value: 'logout', label: '\u062E\u0631\u0648\u062C' },
];

// ---------------------------------------------------------------------------
// Persian labels for HTTP methods
// ---------------------------------------------------------------------------
const METHOD_LABELS: Record<string, string> = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// ---------------------------------------------------------------------------
// Shorten model name (e.g. App\Models\User -> User)
// ---------------------------------------------------------------------------
function shortenModelName(type: string): string {
  if (!type) return '-';
  const parts = type.split('\\');
  return parts[parts.length - 1];
}

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
// Component
// ---------------------------------------------------------------------------
export default function AuditLogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ---- URL-driven state ---------------------------------------------------
  const page = getNumericParam(searchParams, 'page', 1);
  const perPage = getNumericParam(searchParams, 'per_page', 20);
  const sortBy = getParam(searchParams, 'sort_by', 'id');
  const sortOrder = getParam(searchParams, 'sort_order', 'desc') as 'asc' | 'desc';
  const searchValue = getParam(searchParams, 'search');
  const actionFilter = getParam(searchParams, 'action');
  const dateFrom = getParam(searchParams, 'date_from');
  const dateTo = getParam(searchParams, 'date_to');

  // ---- Detail modal -------------------------------------------------------
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

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

  // ---- Local search state (debounced) -------------------------------------
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => {
    if (debouncedSearch !== searchValue) {
      updateParams({ search: debouncedSearch || undefined, page: '1' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ---- Build query params -------------------------------------------------
  const queryParams = useMemo<PaginationParams>(() => {
    const params: PaginationParams = {
      page,
      per_page: perPage,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (actionFilter) params.action = actionFilter;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return params;
  }, [page, perPage, sortBy, sortOrder, debouncedSearch, actionFilter, dateFrom, dateTo]);

  // ---- Data query ---------------------------------------------------------
  const { data: response, isLoading } = useQuery({
    queryKey: ['audit-logs', queryParams],
    queryFn: () => auditApi.list(queryParams),
    placeholderData: keepPreviousData,
  });

  const logs: AuditLog[] = response?.data ?? [];
  const meta = response?.meta;

  // ---- Sorting handler ----------------------------------------------------
  const handleSort = useCallback(
    (field: string) => {
      const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
      updateParams({ sort_by: field, sort_order: newOrder, page: '1' });
    },
    [sortBy, sortOrder, updateParams],
  );

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
  const columns = useMemo<Column<AuditLog & Record<string, unknown>>[]>(
    () => [
      {
        key: 'id',
        title: '\u0634\u0646\u0627\u0633\u0647',
        sortable: true,
        width: '70px',
      },
      {
        key: 'user_name',
        title: '\u06A9\u0627\u0631\u0628\u0631',
        sortable: true,
        render: (row) => (row.user_name as string) || '-',
      },
      {
        key: 'action',
        title: '\u0639\u0645\u0644\u06CC\u0627\u062A',
        sortable: true,
        render: (row) => {
          const label = ACTION_LABELS[row.action as string] || (row.action as string);
          const colorMap: Record<string, string> = {
            create: 'text-green-700 bg-green-50',
            update: 'text-blue-700 bg-blue-50',
            delete: 'text-red-700 bg-red-50',
            login: 'text-indigo-700 bg-indigo-50',
            logout: 'text-gray-700 bg-gray-100',
          };
          const cls = colorMap[row.action as string] || 'text-gray-700 bg-gray-100';
          return (
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
              {label}
            </span>
          );
        },
      },
      {
        key: 'auditable_type',
        title: '\u0645\u062F\u0644',
        render: (row) => shortenModelName(row.auditable_type as string),
      },
      {
        key: 'auditable_id',
        title: '\u0634\u0646\u0627\u0633\u0647 \u0631\u06A9\u0648\u0631\u062F',
        width: '90px',
      },
      {
        key: 'ip_address',
        title: 'IP',
        render: (row) => (
          <span dir="ltr" className="text-gray-600 text-xs font-mono">
            {(row.ip_address as string) || '-'}
          </span>
        ),
      },
      {
        key: 'method',
        title: '\u0645\u062A\u062F',
        width: '70px',
        render: (row) => {
          const m = row.method as string;
          if (!m) return '-';
          return (
            <span dir="ltr" className="text-xs font-mono text-gray-600">
              {METHOD_LABELS[m] || m}
            </span>
          );
        },
      },
      {
        key: 'created_at',
        title: '\u062A\u0627\u0631\u06CC\u062E',
        sortable: true,
        render: (row) => formatDate(row.created_at as string),
      },
    ],
    [],
  );

  // ---- Row click -> open detail modal -------------------------------------
  const handleRowClick = useCallback(
    (log: AuditLog) => {
      setSelectedLog(log);
    },
    [],
  );

  // ---- Render diff view for old_values vs new_values ----------------------
  const renderDiff = (oldVals: Record<string, unknown> | undefined, newVals: Record<string, unknown> | undefined) => {
    const allKeys = new Set([
      ...Object.keys(oldVals || {}),
      ...Object.keys(newVals || {}),
    ]);

    if (allKeys.size === 0) {
      return (
        <p className="text-sm text-gray-500 text-center py-4">
          \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A \u0645\u0648\u062C\u0648\u062F \u0646\u06CC\u0633\u062A
        </p>
      );
    }

    const sortedKeys = Array.from(allKeys).sort();

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-start px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-1/4">
                \u0641\u06CC\u0644\u062F
              </th>
              <th className="text-start px-3 py-2 border border-gray-200 text-xs font-semibold text-red-600 w-[37.5%]">
                \u0645\u0642\u062F\u0627\u0631 \u0642\u0628\u0644\u06CC
              </th>
              <th className="text-start px-3 py-2 border border-gray-200 text-xs font-semibold text-green-600 w-[37.5%]">
                \u0645\u0642\u062F\u0627\u0631 \u062C\u062F\u06CC\u062F
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedKeys.map((key) => {
              const oldVal = oldVals?.[key];
              const newVal = newVals?.[key];
              const oldStr = oldVal !== undefined ? JSON.stringify(oldVal, null, 2) : '';
              const newStr = newVal !== undefined ? JSON.stringify(newVal, null, 2) : '';
              const changed = oldStr !== newStr;

              return (
                <tr key={key} className={changed ? 'bg-yellow-50/50' : ''}>
                  <td className="px-3 py-2 border border-gray-200 font-mono text-xs text-gray-700 font-medium">
                    {key}
                  </td>
                  <td
                    className={`px-3 py-2 border border-gray-200 font-mono text-xs whitespace-pre-wrap break-all ${
                      changed ? 'bg-red-50 text-red-800' : 'text-gray-600'
                    }`}
                    dir="ltr"
                  >
                    {oldStr || <span className="text-gray-300">&mdash;</span>}
                  </td>
                  <td
                    className={`px-3 py-2 border border-gray-200 font-mono text-xs whitespace-pre-wrap break-all ${
                      changed ? 'bg-green-50 text-green-800' : 'text-gray-600'
                    }`}
                    dir="ltr"
                  >
                    {newStr || <span className="text-gray-300">&mdash;</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ---- Render actions column (row click) ----------------------------------
  const renderActions = useCallback(
    (row: AuditLog & Record<string, unknown>) => (
      <button
        onClick={() => handleRowClick(row as unknown as AuditLog)}
        className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
        title="\u062C\u0632\u0626\u06CC\u0627\u062A"
      >
        <ClipboardDocumentListIcon className="w-4 h-4" />
      </button>
    ),
    [handleRowClick],
  );

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          \u0644\u0627\u06AF \u0633\u06CC\u0633\u062A\u0645
        </h1>
      </div>

      {/* Filter section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
          <FunnelIcon className="w-4 h-4" />
          <span>\u0641\u06CC\u0644\u062A\u0631\u0647\u0627</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              \u0646\u0648\u0639 \u0639\u0645\u0644\u06CC\u0627\u062A
            </label>
            <SelectField
              options={ACTION_OPTIONS}
              placeholder="\u0647\u0645\u0647"
              value={actionFilter}
              onChange={(e) => updateParams({ action: e.target.value || undefined, page: '1' })}
            />
          </div>

          {/* Date from */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              \u0627\u0632 \u062A\u0627\u0631\u06CC\u062E
            </label>
            <DatePicker
              value={dateFrom}
              onChange={(v) => updateParams({ date_from: v || undefined, page: '1' })}
              placeholder="\u0627\u0632 \u062A\u0627\u0631\u06CC\u062E"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              \u062A\u0627 \u062A\u0627\u0631\u06CC\u062E
            </label>
            <DatePicker
              value={dateTo}
              onChange={(v) => updateParams({ date_to: v || undefined, page: '1' })}
              placeholder="\u062A\u0627 \u062A\u0627\u0631\u06CC\u062E"
            />
          </div>

          {/* User search */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              \u062C\u0633\u062A\u062C\u0648\u06CC \u06A9\u0627\u0631\u0628\u0631
            </label>
            <SearchInput
              value={localSearch}
              onChange={setLocalSearch}
              placeholder="\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631..."
            />
          </div>
        </div>
      </div>

      {/* Data table */}
      <DataTable<AuditLog & Record<string, unknown>>
        columns={columns}
        data={logs as (AuditLog & Record<string, unknown>)[]}
        loading={isLoading}
        keyField="id"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        actions={renderActions}
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

      {/* Detail Modal */}
      <Modal
        open={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title={
          selectedLog
            ? `\u062C\u0632\u0626\u06CC\u0627\u062A \u0644\u0627\u06AF #${selectedLog.id}`
            : '\u062C\u0632\u0626\u06CC\u0627\u062A \u0644\u0627\u06AF'
        }
        size="xl"
      >
        {selectedLog && (
          <div className="space-y-4">
            {/* Summary info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-500">\u06A9\u0627\u0631\u0628\u0631:</span>{' '}
                <span className="font-medium">{selectedLog.user_name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">\u0639\u0645\u0644\u06CC\u0627\u062A:</span>{' '}
                <span className="font-medium">
                  {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                </span>
              </div>
              <div>
                <span className="text-gray-500">\u0645\u062F\u0644:</span>{' '}
                <span className="font-medium">{shortenModelName(selectedLog.auditable_type)}</span>
              </div>
              <div>
                <span className="text-gray-500">\u0634\u0646\u0627\u0633\u0647 \u0631\u06A9\u0648\u0631\u062F:</span>{' '}
                <span className="font-medium">{selectedLog.auditable_id}</span>
              </div>
              <div>
                <span className="text-gray-500">IP:</span>{' '}
                <span className="font-medium font-mono text-xs" dir="ltr">
                  {selectedLog.ip_address || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">\u062A\u0627\u0631\u06CC\u062E:</span>{' '}
                <span className="font-medium">{formatDate(selectedLog.created_at)}</span>
              </div>
              {selectedLog.url && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-gray-500">URL:</span>{' '}
                  <span className="font-mono text-xs break-all" dir="ltr">
                    {selectedLog.method && (
                      <span className="font-bold me-1">{selectedLog.method}</span>
                    )}
                    {selectedLog.url}
                  </span>
                </div>
              )}
              {selectedLog.user_agent && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-gray-500">User Agent:</span>{' '}
                  <span className="font-mono text-xs text-gray-500 break-all" dir="ltr">
                    {selectedLog.user_agent}
                  </span>
                </div>
              )}
            </div>

            {/* Values diff */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A
              </h4>
              {renderDiff(selectedLog.old_values, selectedLog.new_values)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
