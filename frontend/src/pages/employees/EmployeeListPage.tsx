import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

import {
  useSpecialEmployeeTypes,
  useRelationTypes,
  useGuardianshipTypes,
  useGenders,
  useEmployeeStatuses,
} from '../../hooks/useLookups';
import { useDebounce } from '../../hooks/useDebounce';
import { employeesApi } from '../../api/employees';
import { formatDate } from '../../utils/format';
import type { Employee } from '../../types/employee';
import type { PaginationParams } from '../../types/api';

// ---------------------------------------------------------------------------
// Filter param keys that map to dropdown lookups
// ---------------------------------------------------------------------------
const FILTER_KEYS = [
  'special_employee_type_id',
  'relation_type_id',
  'guardianship_type_id',
  'gender',
  'status',
] as const;

type FilterKey = (typeof FILTER_KEYS)[number];

// ---------------------------------------------------------------------------
// Helper: read / write URL search params
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
export default function EmployeeListPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // ---- URL-driven state ---------------------------------------------------
  const page = getNumericParam(searchParams, 'page', 1);
  const perPage = getNumericParam(searchParams, 'per_page', 20);
  const sortBy = getParam(searchParams, 'sort_by', 'id');
  const sortOrder = (getParam(searchParams, 'sort_order', 'desc') as 'asc' | 'desc');
  const searchValue = getParam(searchParams, 'search');

  // Filters from URL
  const filterValues: Record<FilterKey, string> = {
    special_employee_type_id: getParam(searchParams, 'special_employee_type_id'),
    relation_type_id: getParam(searchParams, 'relation_type_id'),
    guardianship_type_id: getParam(searchParams, 'guardianship_type_id'),
    gender: getParam(searchParams, 'gender'),
    status: getParam(searchParams, 'status'),
  };

  // ---- Selection & delete dialog ------------------------------------------
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // ---- Lookups ------------------------------------------------------------
  const { data: specialTypes } = useSpecialEmployeeTypes();
  const { data: relationTypes } = useRelationTypes();
  const { data: guardianshipTypes } = useGuardianshipTypes();
  const { data: genders } = useGenders();
  const { data: employeeStatuses } = useEmployeeStatuses();

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
    FILTER_KEYS.forEach((key) => {
      if (filterValues[key]) params[key] = filterValues[key];
    });
    return params;
  }, [page, perPage, sortBy, sortOrder, debouncedSearch, filterValues]);

  // ---- Data query ---------------------------------------------------------
  const { data: response, isLoading } = useQuery({
    queryKey: ['employees', queryParams],
    queryFn: () => employeesApi.list(queryParams),
    placeholderData: keepPreviousData,
  });

  const employees: Employee[] = response?.data ?? [];
  const meta = response?.meta;

  // ---- Mutations ----------------------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),
    onSuccess: () => {
      toast.success('حذف با موفقیت انجام شد');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('خطا در حذف');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => employeesApi.bulkDelete(ids),
    onSuccess: () => {
      toast.success('حذف گروهی با موفقیت انجام شد');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    },
    onError: () => {
      toast.error('خطا در حذف گروهی');
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

  // ---- Filter change handler ----------------------------------------------
  const handleFilterChange = useCallback(
    (key: FilterKey, value: string) => {
      updateParams({ [key]: value || undefined, page: '1' });
    },
    [updateParams],
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
  const columns = useMemo<Column<Employee & Record<string, unknown>>[]>(
    () => [
      {
        key: 'id',
        title: 'شناسه',
        sortable: true,
        width: '70px',
      },
      {
        key: 'first_name',
        title: 'نام',
        sortable: true,
      },
      {
        key: 'last_name',
        title: 'نام خانوادگی',
        sortable: true,
      },
      {
        key: 'custom_employee_code',
        title: 'کد CEC',
        sortable: true,
        render: (row) => (row as unknown as Employee).custom_employee_code?.code || '-',
      },
      {
        key: 'special_employee_type',
        title: 'نوع خاص',
        filterable: true,
        filterOptions: specialTypes ?? [],
        filterValue: filterValues.special_employee_type_id,
        onFilterChange: (v) => handleFilterChange('special_employee_type_id', v),
        render: (row) => (row as unknown as Employee).special_employee_type?.title || '-',
      },
      {
        key: 'relation_type',
        title: 'نسبت',
        filterable: true,
        filterOptions: relationTypes ?? [],
        filterValue: filterValues.relation_type_id,
        onFilterChange: (v) => handleFilterChange('relation_type_id', v),
        render: (row) => (row as unknown as Employee).relation_type?.title || '-',
      },
      {
        key: 'guardianship_type',
        title: 'نوع سرپرستی',
        filterable: true,
        filterOptions: guardianshipTypes ?? [],
        filterValue: filterValues.guardianship_type_id,
        onFilterChange: (v) => handleFilterChange('guardianship_type_id', v),
        render: (row) => (row as unknown as Employee).guardianship_type?.title || '-',
      },
      {
        key: 'gender',
        title: 'جنسیت',
        filterable: true,
        filterOptions: genders ?? [],
        filterValue: filterValues.gender,
        onFilterChange: (v) => handleFilterChange('gender', v),
        render: (row) => (row as unknown as Employee).gender?.label || '-',
      },
      {
        key: 'location',
        title: 'محل خدمت',
        sortable: true,
        render: (row) => (row as unknown as Employee).location?.name || '-',
      },
      {
        key: 'personnel_code',
        title: 'کد پرسنلی',
        sortable: true,
      },
      {
        key: 'status',
        title: 'وضعیت',
        filterable: true,
        filterOptions: employeeStatuses ?? [],
        filterValue: filterValues.status,
        onFilterChange: (v) => handleFilterChange('status', v),
        render: (row) => {
          const emp = row as unknown as Employee;
          return (
            <StatusBadge
              status={emp.status?.value || 'unknown'}
              label={emp.status?.label}
            />
          );
        },
      },
      {
        key: 'employment_date',
        title: 'تاریخ استخدام',
        sortable: true,
        render: (row) => formatDate((row as unknown as Employee).employment_date),
      },
      {
        key: 'national_code',
        title: 'کد ملی',
        sortable: true,
      },
    ],
    [
      specialTypes,
      relationTypes,
      guardianshipTypes,
      genders,
      employeeStatuses,
      filterValues,
      handleFilterChange,
    ],
  );

  // ---- Action buttons per row ---------------------------------------------
  const renderActions = useCallback(
    (row: Employee & Record<string, unknown>) => (
      <>
        <Link
          to={`/employees/${row.id}`}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
          title="مشاهده"
        >
          <EyeIcon className="w-4 h-4" />
        </Link>
        <Link
          to={`/employees/${row.id}/edit`}
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
        <Link
          to={`/employees/${row.id}/family`}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-green-600 transition-colors"
          title="اعضای خانواده"
        >
          <UsersIcon className="w-4 h-4" />
        </Link>
      </>
    ),
    [],
  );

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">مدیریت پرسنل</h1>
        <Link to="/employees/create">
          <Button icon={<PlusIcon className="w-4 h-4" />}>افزودن پرسنل جدید</Button>
        </Link>
      </div>

      {/* Toolbar: search + bulk actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          value={localSearch}
          onChange={setLocalSearch}
          placeholder="جستجوی پرسنل..."
          className="w-72"
        />

        {selectedIds.size > 0 && (
          <Button
            variant="danger"
            size="sm"
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={() => setBulkDeleteOpen(true)}
          >
            {`حذف ${selectedIds.size} مورد انتخاب شده`}
          </Button>
        )}
      </div>

      {/* Data table */}
      <DataTable<Employee & Record<string, unknown>>
        columns={columns}
        data={employees as (Employee & Record<string, unknown>)[]}
        loading={isLoading}
        keyField="id"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
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

      {/* Single delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget !== null && deleteMutation.mutate(deleteTarget)}
        title="تایید حذف"
        message="آیا از حذف این پرسنل اطمینان دارید؟"
        confirmLabel="حذف"
        loading={deleteMutation.isPending}
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
        title="حذف گروهی"
        message={`آیا از حذف ${selectedIds.size} پرسنل انتخاب شده اطمینان دارید؟`}
        confirmLabel="حذف همه"
        loading={bulkDeleteMutation.isPending}
      />
    </div>
  );
}
