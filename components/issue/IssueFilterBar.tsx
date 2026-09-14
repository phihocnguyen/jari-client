'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { IssueFilter } from '@/types/issue';

interface IssueFilterBarProps {
  filters: IssueFilter;
  onChange: (f: IssueFilter) => void;
}

export function IssueFilterBar({ filters, onChange }: IssueFilterBarProps) {
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, query: e.target.value });
  };

  const clearFilters = () => {
    onChange({});
  };

  const hasFilters = Boolean(
    filters.query || filters.assigneeId || filters.status || filters.type || filters.priority
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: 240 }}>
        <span style={{ position: 'absolute', left: 10, top: 9, color: 'var(--color-text-secondary)' }}>
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Search issues..."
          className="input"
          value={filters.query ?? ''}
          onChange={handleQueryChange}
          style={{ paddingLeft: '2.25rem', height: 34, fontSize: '0.875rem' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 34, padding: '0 12px',
            background: 'var(--color-surface-white)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem', fontWeight: 500,
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={14} /> Filters
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              height: 34, padding: '0 12px',
              background: 'none', border: 'none',
              fontSize: '0.8125rem', fontWeight: 500,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
