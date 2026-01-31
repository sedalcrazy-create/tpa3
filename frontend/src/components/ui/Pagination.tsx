import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function toPersianNumber(n: number | null | undefined): string {
  if (n == null) return '۰';
  return n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
}

export default function Pagination({
  currentPage,
  lastPage,
  total,
  from,
  to,
  perPage,
  onPageChange,
  onPerPageChange,
}: PaginationProps) {
  const pages: number[] = [];
  const delta = 2;
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(lastPage, currentPage + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-white text-sm">
      <div className="text-gray-500">
        نمایش {toPersianNumber(from)} - {toPersianNumber(to)} از {toPersianNumber(total)}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {toPersianNumber(n)} ردیف
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>

          {pages[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="w-8 h-8 rounded text-center hover:bg-gray-100"
              >
                {toPersianNumber(1)}
              </button>
              {pages[0] > 2 && <span className="text-gray-400">...</span>}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded text-center ${
                p === currentPage
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {toPersianNumber(p)}
            </button>
          ))}

          {pages[pages.length - 1] < lastPage && (
            <>
              {pages[pages.length - 1] < lastPage - 1 && (
                <span className="text-gray-400">...</span>
              )}
              <button
                onClick={() => onPageChange(lastPage)}
                className="w-8 h-8 rounded text-center hover:bg-gray-100"
              >
                {toPersianNumber(lastPage)}
              </button>
            </>
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= lastPage}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
