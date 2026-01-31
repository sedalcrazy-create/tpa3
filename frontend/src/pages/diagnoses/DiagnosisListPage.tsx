import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge';

import { useDebounce } from '../../hooks/useDebounce';
import { diagnosesApi } from '../../api/diagnoses';
import type { Diagnosis } from '../../api/diagnoses';
import type { PaginationParams } from '../../types/api';

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
export default function DiagnosisListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ---- URL-driven state ---------------------------------------------------
  const page = getNumericParam(searchParams, 'page', 1);
  const perPage = getNumericParam(searchParams, 'per_page', 20);
  const sortBy = getParam(searchParams, 'sort_by', 'id');
  const sortOrder = getParam(searchParams, 'sort_order', 'desc') as 'asc' | 'desc';
  const searchValue = getParam(searchParams, 'search');

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

  // Sync debounced value into URL
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
    return params;
  }, [page, perPage, sortBy, sortOrder, debouncedSearch]);

  // ---- Data query ---------------------------------------------------------
  const { data: response, isLoading } = useQuery({
    queryKey: ['diagnoses', queryParams],
    queryFn: () => diagnosesApi.list(queryParams),
    placeholderData: keepPreviousData,
  });

  const diagnoses: Diagnosis[] = response?.data ?? [];
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
  const columns = useMemo<Column<Diagnosis & Record<string, unknown>>[]>(
    () => [
      {
        key: 'id',
        title: 'شناسه',
        sortable: true,
        width: '70px',
      },
      {
        key: 'code',
        title: 'کد',
        sortable: true,
      },
      {
        key: 'title',
        title: 'عنوان',
        sortable: true,
      },
      {
        key: 'title_en',
        title: 'عنوان انگلیسی',
        sortable: true,
      },
      {
        key: 'category',
        title: 'دسته‌بندی',
        sortable: true,
      },
      {
        key: 'is_active',
        title: 'وضعیت',
        render: (row) => (
          <StatusBadge
            status={row.is_active ? 'active' : 'inactive'}
            label={row.is_active ? 'فعال' : 'غیرفعال'}
          />
        ),
      },
    ],
    [],
  );

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">تشخیص (ICD)</h1>
      </div>

      {/* Toolbar: search */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          value={localSearch}
          onChange={setLocalSearch}
          placeholder="جستجوی تشخیص..."
          className="w-72"
        />
      </div>

      {/* Data table */}
      <DataTable<Diagnosis & Record<string, unknown>>
        columns={columns}
        data={diagnoses as (Diagnosis & Record<string, unknown>)[]}
        loading={isLoading}
        keyField="id"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
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
    </div>
  );
}
