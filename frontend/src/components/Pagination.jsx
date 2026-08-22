import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Pagination ke dropdown me dikhne wale page sizes
const SIZES = [10, 25, 50, 100, 200];

// Pagination: list pages ke niche aata hai — page change aur rows-per-page select karne ke liye.
export default function Pagination({ page, pages, total, limit, onLimitChange, onChange }) {
  // Koi record hi nahi hai to pagination mat dikhao
  if (total <= 0) return null;

  // 'showing' label: e.g. sirf 1 page hai to "15 records" warna "1–100"
  const rowLabel = pages === 1 ? total : `1–${total}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
      {/* Info: Page 2 of 5 · 43 records · showing 1–100 */}
      <p className="text-sm text-slate-500">
        Page {page} of {pages} · <span className="font-medium">{total}</span> records · showing {rowLabel}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {/* Rows per page select karne wala dropdown */}
        <label className="flex items-center gap-2 text-sm text-slate-500">
          Rows per page
          <select
            className="input !w-20 !px-2 !py-1 text-xs"
            value={limit}
            onChange={(e) => onLimitChange?.(Number(e.target.value))}
          >
            {SIZES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        {/* Previous/Next buttons — pehli page par previous disabled, aakhri par next disabled */}
        <div className="flex gap-1">
          <button
            className="btn-secondary p-2 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
          >
            <FiChevronLeft />
          </button>
          <button
            className="btn-secondary p-2 disabled:opacity-40"
            disabled={page >= pages}
            onClick={() => onChange(page + 1)}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}