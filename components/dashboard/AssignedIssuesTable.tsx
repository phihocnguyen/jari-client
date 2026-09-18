'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { renderTypeIcon } from '@/utils/issue-type';
import { getStatusBadgeStyle } from '@/utils/issue-status';

export interface AssignedIssueItem {
  id: string;
  key?: string;
  issueKey?: string;
  title: string;
  type?: string;
  status?: any;
  projectId: string;
  projectName?: string;
  workspaceId?: string;
  workspaceName?: string;
}

export interface AssignedIssuesTableProps {
  issues: AssignedIssueItem[];
  totalIssues: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AssignedIssuesTable({
  issues,
  totalIssues,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
}: AssignedIssuesTableProps) {
  const router = useRouter();

  // Helper for generating page numbers (matches IssueListFooter logic)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1);
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
        position: 'relative',
        border: '1px solid #dcdfe4',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Scrollable Table Area */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#94a3b8 #f1f5f9',
        }}
      >
        <table
          style={{
            width: '100%',
            minWidth: 700,
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          <colgroup>
            <col style={{ width: '45%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>

          {/* Table Header */}
          <thead>
            <tr
              style={{
                backgroundColor: '#f4f5f7',
                borderBottom: '1px solid #dcdfe4',
                color: '#44546f',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                userSelect: 'none',
              }}
            >
              <th
                style={{
                  padding: '8px 12px',
                  verticalAlign: 'middle',
                  borderRight: '1px solid #dcdfe4',
                  borderBottom: '1px solid #dcdfe4',
                  boxSizing: 'border-box',
                  backgroundColor: '#f4f5f7',
                  color: '#44546f',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                WORK ITEM
              </th>
              <th
                style={{
                  padding: '8px 12px',
                  verticalAlign: 'middle',
                  borderRight: '1px solid #dcdfe4',
                  borderBottom: '1px solid #dcdfe4',
                  boxSizing: 'border-box',
                  backgroundColor: '#f4f5f7',
                  color: '#44546f',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                WORKSPACE
              </th>
              <th
                style={{
                  padding: '8px 12px',
                  verticalAlign: 'middle',
                  borderRight: '1px solid #dcdfe4',
                  borderBottom: '1px solid #dcdfe4',
                  boxSizing: 'border-box',
                  backgroundColor: '#f4f5f7',
                  color: '#44546f',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                PROJECT
              </th>
              <th
                style={{
                  padding: '8px 12px',
                  verticalAlign: 'middle',
                  borderBottom: '1px solid #dcdfe4',
                  boxSizing: 'border-box',
                  backgroundColor: '#f4f5f7',
                  color: '#44546f',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textAlign: 'right',
                }}
              >
                STATUS
              </th>
            </tr>
          </thead>

          {/* Table Body: 10 rows (populated items + empty row placeholders) */}
          <tbody>
            {Array.from({ length: pageSize }).map((_, idx) => {
              const issue = issues[idx];
              if (!issue) {
                return (
                  <tr
                    key={`empty-${idx}`}
                    style={{
                      borderBottom: '1px solid #dcdfe4',
                      fontSize: '0.84rem',
                      height: 38,
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <td
                      style={{
                        padding: '8px 12px',
                        verticalAlign: 'middle',
                        borderRight: '1px solid #dcdfe4',
                        color: 'rgba(0,0,0,0.25)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      {idx === 0 && issues.length === 0 ? 'No assigned work items' : '—'}
                    </td>
                    <td
                      style={{
                        padding: '8px 12px',
                        verticalAlign: 'middle',
                        borderRight: '1px solid #dcdfe4',
                        color: 'rgba(0,0,0,0.25)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      —
                    </td>
                    <td
                      style={{
                        padding: '8px 12px',
                        verticalAlign: 'middle',
                        borderRight: '1px solid #dcdfe4',
                        color: 'rgba(0,0,0,0.25)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      —
                    </td>
                    <td
                      style={{
                        padding: '8px 12px',
                        verticalAlign: 'middle',
                        textAlign: 'right',
                        color: 'rgba(0,0,0,0.25)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      —
                    </td>
                  </tr>
                );
              }

              const statusStyle = getStatusBadgeStyle(issue.status || 'TODO');

              return (
                <tr
                  key={issue.id}
                  onClick={() => router.push(`/projects/${issue.projectId}/issues/${issue.key || issue.id}`)}
                  style={{
                    borderBottom: '1px solid #dcdfe4',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(12, 102, 228, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  {/* Work item column */}
                  <td
                    style={{
                      padding: '8px 12px',
                      verticalAlign: 'middle',
                      borderRight: '1px solid #dcdfe4',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        {renderTypeIcon(issue.type || 'TASK', 16)}
                      </span>
                      <Link
                        href={`/projects/${issue.projectId}/issues/${issue.key || issue.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#0c66e4',
                          flexShrink: 0,
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        {issue.key || issue.issueKey}
                      </Link>
                      <Link
                        href={`/projects/${issue.projectId}/issues/${issue.key || issue.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: '0.84rem',
                          fontWeight: 500,
                          color: 'var(--color-text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minWidth: 0,
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                        title={issue.title}
                      >
                        {issue.title}
                      </Link>
                    </div>
                  </td>

                  {/* Workspace column */}
                  <td
                    style={{
                      padding: '8px 12px',
                      verticalAlign: 'middle',
                      borderRight: '1px solid #dcdfe4',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                    }}
                  >
                    {issue.workspaceName ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-green-accent)',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {issue.workspaceName}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'rgba(0,0,0,0.25)', fontSize: '0.8125rem' }}>—</span>
                    )}
                  </td>

                  {/* Project column */}
                  <td
                    style={{
                      padding: '8px 12px',
                      verticalAlign: 'middle',
                      borderRight: '1px solid #dcdfe4',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                    }}
                  >
                    {issue.projectName ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 2,
                            backgroundColor: '#0284c7',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {issue.projectName}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'rgba(0,0,0,0.25)', fontSize: '0.8125rem' }}>—</span>
                    )}
                  </td>

                  {/* Status column */}
                  <td
                    style={{
                      padding: '8px 12px',
                      verticalAlign: 'middle',
                      textAlign: 'right',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {statusStyle.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls (Matches IssueListFooter styling) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #dcdfe4',
          fontSize: '0.84rem',
          userSelect: 'none',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Count info */}
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
            {totalIssues > 0 ? (
              <>
                Showing <strong>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalIssues)}</strong> of <strong>{totalIssues}</strong> work items
              </>
            ) : (
              '0 work items'
            )}
          </span>
        </div>

        {/* Numbered Page Buttons & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
              transition: 'all 0.15s ease',
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
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
