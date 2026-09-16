'use client';

import React from 'react';
import { Plus, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface IssueListFooterProps {
  totalCount: number;
  filteredCount: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onCreateClick: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function IssueListFooter({
  totalCount,
  filteredCount,
  currentPage = 1,
  pageSize = 12,
  totalPages = 1,
  onPageChange,
  onCreateClick,
  onRefresh,
  isRefreshing = false,
}: IssueListFooterProps) {
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers to show
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    pages.push(1);
    if (currentPage > 3) {
      pages.push('...');
    }
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    pages.push(totalPages);
    return pages;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        fontSize: '0.84rem',
        userSelect: 'none',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      {/* 1. Left: + Create button */}
      <div>
        <button
          type="button"
          onClick={onCreateClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'var(--color-text-primary)',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 4,
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Plus size={16} />
          <span>Create</span>
        </button>
      </div>

      {/* 2. Center: Count + Refresh Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: 'var(--color-text-secondary)',
          fontSize: '0.8125rem',
          fontWeight: 500,
        }}
      >
        <span>
          {totalCount > 0 ? (
            <>
              Showing <strong>{startItem}–{endItem}</strong> of <strong>{totalCount}</strong> issues
            </>
          ) : (
            '0 issues'
          )}
        </span>

        <button
          type="button"
          onClick={onRefresh}
          title="Refresh list"
          style={{
            background: 'none',
            border: 'none',
            padding: 4,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-secondary)',
            transition: 'all 0.2s ease',
            transform: isRefreshing ? 'rotate(180deg)' : 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
        >
          <RotateCw size={14} />
        </button>
      </div>

      {/* 3. Right: Pagination Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {totalPages > 1 && onPageChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Previous Page */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              title="Previous page"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 4,
                backgroundColor: '#fff',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.4 : 1,
                color: 'var(--color-text-primary)',
              }}
            >
              <ChevronLeft size={15} />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  style={{
                    padding: '0 4px',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.8125rem',
                  }}
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange(Number(p))}
                  style={{
                    minWidth: 28,
                    height: 28,
                    padding: '0 6px',
                    border: p === currentPage ? 'none' : '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 4,
                    backgroundColor: p === currentPage ? 'var(--color-green-brand)' : '#fff',
                    color: p === currentPage ? '#ffffff' : 'var(--color-text-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: p === currentPage ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p}
                </button>
              )
            )}

            {/* Next Page */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              title="Next page"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 4,
                backgroundColor: '#fff',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages ? 0.4 : 1,
                color: 'var(--color-text-primary)',
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
