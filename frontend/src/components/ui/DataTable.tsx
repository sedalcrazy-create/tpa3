import { useState, type ReactNode } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import type { SelectOption } from '../../types/api';

export interface Column<T> {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => ReactNode;
  filterable?: boolean;
  filterOptions?: SelectOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  keyField?: string;
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  // Pagination
  pagination?: {
    currentPage: number;
    lastPage: number;
    total: number;
    from: number;
    to: number;
    perPage: number;
  };
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  // Checkbox
  selectable?: boolean;
  selectedIds?: Set<number>;
  onSelectionChange?: (ids: Set<number>) => void;
  // Actions column
  actions?: (row: T) => ReactNode;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  keyField = 'id',
  sortBy,
  sortOrder,
  onSort,
  pagination,
  onPageChange,
  onPerPageChange,
  selectable = false,
  selectedIds,
  onSelectionChange,
  actions,
}: DataTableProps<T>) {
  const allIds = data.map((row) => row[keyField] as number);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds?.has(id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(allIds));
    }
  };

  const toggleOne = (id: number) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  const hasFilters = columns.some((c) => c.filterable);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {selectable && (
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {actions && <th className="w-24 px-3 py-3 text-center text-xs font-semibold text-gray-600">عملیات</th>}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-3 text-start text-xs font-semibold text-gray-600 ${
                    col.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.title}
                    {col.sortable && sortBy === col.key && (
                      sortOrder === 'asc' ? (
                        <ChevronUpIcon className="w-3 h-3" />
                      ) : (
                        <ChevronDownIcon className="w-3 h-3" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
            {hasFilters && (
              <tr className="bg-gray-50/50 border-b border-gray-200">
                {selectable && <th />}
                {actions && <th />}
                {columns.map((col) => (
                  <th key={col.key} className="px-2 py-1.5">
                    {col.filterable && col.filterOptions ? (
                      <select
                        value={col.filterValue || ''}
                        onChange={(e) => col.onFilterChange?.(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                      >
                        <option value="">همه</option>
                        {col.filterOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : col.filterable ? (
                      <input
                        type="text"
                        value={col.filterValue || ''}
                        onChange={(e) => col.onFilterChange?.(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder={`فیلتر ${col.title}`}
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="py-12">
                  <LoadingSpinner size="lg" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}>
                  <EmptyState />
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row[keyField] as string | number}
                  className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  } ${selectedIds?.has(row[keyField] as number) ? 'bg-primary/5' : ''}`}
                >
                  {selectable && (
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds?.has(row[keyField] as number) || false}
                        onChange={() => toggleOne(row[keyField] as number)}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  {actions && (
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2.5 text-gray-700">
                      {col.render ? col.render(row, index) : (row[col.key] as ReactNode) ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && onPageChange && onPerPageChange && pagination.total > 0 && (
        <Pagination
          currentPage={pagination.currentPage || 1}
          lastPage={pagination.lastPage || 1}
          total={pagination.total || 0}
          from={pagination.from || 0}
          to={pagination.to || 0}
          perPage={pagination.perPage || 10}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
        />
      )}
    </div>
  );
}
