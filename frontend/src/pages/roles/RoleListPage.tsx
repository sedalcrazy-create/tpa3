import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

import { useDebounce } from '../../hooks/useDebounce';
import { rolesApi } from '../../api/roles';
import type { Role } from '../../api/roles';
import type { PaginationParams } from '../../types/api';
import { formatDate } from '../../utils/format';

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
export default function RoleListPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // ---- URL-driven state ---------------------------------------------------
  const page = getNumericParam(searchParams, 'page', 1);
  const perPage = getNumericParam(searchParams, 'per_page', 20);
  const sortBy = getParam(searchParams, 'sort_by', 'id');
  const sortOrder = getParam(searchParams, 'sort_order', 'desc') as 'asc' | 'desc';
  const searchValue = getParam(searchParams, 'search');

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
    queryKey: ['roles', queryParams],
    queryFn: () => rolesApi.list(queryParams),
    placeholderData: keepPreviousData,
  });

  const roles: Role[] = response?.data ?? [];
  const meta = response?.meta;

  // ---- Mutations ----------------------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => {
      toast.success('\u0646\u0642\u0634 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u0646\u0642\u0634');
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

  // ---- Columns definition -------------------------------------------------
  const columns = useMemo<Column<Role & Record<string, unknown>>[]>(
    () => [
      {
        key: 'id',
        title: '\u0634\u0646\u0627\u0633\u0647',
        sortable: true,
        width: '70px',
      },
      {
        key: 'name',
        title: '\u0646\u0627\u0645 (\u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC)',
        sortable: true,
        render: (row) => (
          <span dir="ltr" className="font-mono text-gray-700">{row.name as string}</span>
        ),
      },
      {
        key: 'title',
        title: '\u0639\u0646\u0648\u0627\u0646',
        sortable: true,
      },
      {
        key: 'description',
        title: '\u062A\u0648\u0636\u06CC\u062D\u0627\u062A',
        render: (row) => {
          const desc = row.description as string;
          if (!desc) return '-';
          return desc.length > 60 ? desc.substring(0, 60) + '...' : desc;
        },
      },
      {
        key: 'is_active',
        title: '\u0648\u0636\u0639\u06CC\u062A',
        render: (row) => (
          <StatusBadge
            status={row.is_active ? 'active' : 'inactive'}
            label={row.is_active ? '\u0641\u0639\u0627\u0644' : '\u063A\u06CC\u0631\u0641\u0639\u0627\u0644'}
          />
        ),
      },
      {
        key: 'permissions',
        title: '\u062A\u0639\u062F\u0627\u062F \u062F\u0633\u062A\u0631\u0633\u06CC',
        render: (row) => {
          const perms = row.permissions as Role['permissions'];
          const count = perms?.length ?? 0;
          return (
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {count}
            </span>
          );
        },
      },
      {
        key: 'created_at',
        title: '\u062A\u0627\u0631\u06CC\u062E \u0627\u06CC\u062C\u0627\u062F',
        sortable: true,
        render: (row) => formatDate(row.created_at as string),
      },
    ],
    [],
  );

  // ---- Action buttons per row ---------------------------------------------
  const renderActions = useCallback(
    (row: Role & Record<string, unknown>) => (
      <>
        <Link
          to={`/roles/${row.id}/edit`}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
          title="\u0648\u06CC\u0631\u0627\u06CC\u0634"
        >
          <PencilIcon className="w-4 h-4" />
        </Link>
        <button
          onClick={() => setDeleteTarget(row.id as number)}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-danger transition-colors"
          title="\u062D\u0630\u0641"
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
        <h1 className="text-xl font-bold text-gray-800">
          \u0646\u0642\u0634\u200C\u0647\u0627 \u0648 \u062F\u0633\u062A\u0631\u0633\u06CC\u200C\u0647\u0627
        </h1>
        <Link to="/roles/create">
          <Button icon={<PlusIcon className="w-4 h-4" />}>
            \u0627\u06CC\u062C\u0627\u062F \u0646\u0642\u0634 \u062C\u062F\u06CC\u062F
          </Button>
        </Link>
      </div>

      {/* Toolbar: search */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          value={localSearch}
          onChange={setLocalSearch}
          placeholder="\u062C\u0633\u062A\u062C\u0648\u06CC \u0646\u0642\u0634..."
          className="w-72"
        />
      </div>

      {/* Data table */}
      <DataTable<Role & Record<string, unknown>>
        columns={columns}
        data={roles as (Role & Record<string, unknown>)[]}
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
        title="\u062A\u0627\u06CC\u06CC\u062F \u062D\u0630\u0641"
        message="\u0622\u06CC\u0627 \u0627\u0632 \u062D\u0630\u0641 \u0627\u06CC\u0646 \u0646\u0642\u0634 \u0627\u0637\u0645\u06CC\u0646\u0627\u0646 \u062F\u0627\u0631\u06CC\u062F\u061F"
        confirmLabel="\u062D\u0630\u0641"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
