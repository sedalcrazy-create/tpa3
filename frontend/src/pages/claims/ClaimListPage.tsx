import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import SelectField from '../../components/ui/SelectField';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

import { useDebounce } from '../../hooks/useDebounce';
import { useClaimStatuses } from '../../hooks/useLookups';
import { claimsApi } from '../../api/claims';
import type { Claim } from '../../types/claim';
import type { PaginationParams } from '../../types/api';
import { formatDate, formatCurrency } from '../../utils/format';

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
export default function ClaimListPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // ---- Lookups ------------------------------------------------------------
  const { data: claimStatusOptions = [] } = useClaimStatuses();

  // ---- URL-driven state ---------------------------------------------------
  const page = getNumericParam(searchParams, 'page', 1);
  const perPage = getNumericParam(searchParams, 'per_page', 20);
  const sortBy = getParam(searchParams, 'sort_by', 'id');
  const sortOrder = getParam(searchParams, 'sort_order', 'desc') as 'asc' | 'desc';
  const searchValue = getParam(searchParams, 'search');
  const statusFilter = getParam(searchParams, 'status');

  // ---- Delete dialog ------------------------------------------------------
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

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
    if (statusFilter) params.status = statusFilter;
    return params;
  }, [page, perPage, sortBy, sortOrder, debouncedSearch, statusFilter]);

  // ---- Data query ---------------------------------------------------------
  const { data: response, isLoading } = useQuery({
    queryKey: ['claims', queryParams],
    queryFn: () => claimsApi.list(queryParams),
    placeholderData: keepPreviousData,
  });

  const claims: Claim[] = response?.data ?? [];
  const meta = response?.meta;

  // ---- Mutations ----------------------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: (id: number) => claimsApi.delete(id),
    onSuccess: () => {
      toast.success('پرونده خسارت با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('خطا در حذف پرونده خسارت');
    },
  });

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

  // ---- Status filter handler ----------------------------------------------
  const handleStatusFilter = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateParams({ status: e.target.value || undefined, page: '1' });
    },
    [updateParams],
  );

  // ---- Columns definition -------------------------------------------------
  const columns = useMemo<Column<Claim & Record<string, unknown>>[]>(
    () => [
      {
        key: 'id',
        title: 'شناسه',
        sortable: true,
        width: '70px',
      },
      {
        key: 'claim_number',
        title: 'شماره پرونده',
        sortable: true,
      },
      {
        key: 'employee_name',
        title: 'نام بیمه‌شده',
        sortable: true,
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
        sortable: true,
        render: (row) => formatDate(row.claim_date as string),
      },
      {
        key: 'total_amount',
        title: 'مبلغ کل',
        render: (row) => formatCurrency(row.total_amount as number),
      },
      {
        key: 'approved_amount',
        title: 'مبلغ تایید شده',
        render: (row) => formatCurrency(row.approved_amount as number),
      },
      {
        key: 'status',
        title: 'وضعیت',
        render: (row) => (
          <StatusBadge
            status={row.status as string}
            label={row.status_title as string | undefined}
          />
        ),
      },
    ],
    [],
  );

  // ---- Action buttons per row ---------------------------------------------
  const renderActions = useCallback(
    (row: Claim & Record<string, unknown>) => (
      <>
        <Link
          to={`/claims/${row.id}`}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-green-600 transition-colors"
          title="مشاهده"
        >
          <EyeIcon className="w-4 h-4" />
        </Link>
        <Link
          to={`/claims/${row.id}/edit`}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
          title="ویرایش"
        >
          <PencilIcon className="w-4 h-4" />
        </Link>
        <button
          onClick={() => setDeleteTarget(row.id as number)}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-danger transition-colors"
          title="حذف"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </>
    ),
    [],
  );

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">پرونده‌های خسارت</h1>
        <Link to="/claims/create">
          <Button icon={<PlusIcon className="w-4 h-4" />}>
            ایجاد پرونده جدید
          </Button>
        </Link>
      </div>

      {/* Toolbar: search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          value={localSearch}
          onChange={setLocalSearch}
          placeholder="جستجوی پرونده خسارت..."
          className="w-72"
        />
        <div className="w-56">
          <SelectField
            options={claimStatusOptions}
            placeholder="فیلتر وضعیت..."
            value={statusFilter}
            onChange={handleStatusFilter}
          />
        </div>
      </div>

      {/* Data table */}
      <DataTable<Claim & Record<string, unknown>>
        columns={columns}
        data={claims as (Claim & Record<string, unknown>)[]}
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

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget !== null && deleteMutation.mutate(deleteTarget)}
        title="تایید حذف"
        message="آیا از حذف این پرونده خسارت اطمینان دارید؟"
        confirmLabel="حذف"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
