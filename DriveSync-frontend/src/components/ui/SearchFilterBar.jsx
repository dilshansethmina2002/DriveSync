// Search box + any number of filter dropdowns + "clear" button
import { Search, X } from 'lucide-react';

export function FilterSelect({ value, onChange, options, placeholder, label }) {
  return (
    <select
      aria-label={label || placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-ds-ink outline-none transition focus:border-ds-royal focus:ring-4 focus:ring-ds-royal/10"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => {
        const { value: v, label: l } = typeof opt === 'string' ? { value: opt, label: opt } : opt;
        return (
          <option key={v} value={v}>
            {l}
          </option>
        );
      })}
    </select>
  );
}

export default function SearchFilterBar({ search, onSearchChange, searchPlaceholder = 'Search…', children, onClear, showClear }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center">
      {onSearchChange && (
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ds-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-slate-200 bg-ds-surface pl-10 pr-3 text-sm text-ds-ink outline-none transition placeholder:text-ds-muted focus:border-ds-royal focus:bg-white focus:ring-4 focus:ring-ds-royal/10"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {showClear && (
          <button onClick={onClear} className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-medium text-ds-muted hover:bg-slate-100 hover:text-ds-ink">
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
