'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckSquare, Bookmark, Zap } from 'lucide-react';
import type { TypeCount } from '@/types/summary';

interface TypesOfWorkWidgetProps {
  projectId?: string;
  typeBreakdown?: TypeCount[];
  isLoading?: boolean;
}

const STANDARD_TYPES = ['EPIC', 'STORY', 'TASK', 'SUBTASK', 'BUG'];

function renderTypeIcon(typeKey: string) {
  switch (typeKey) {
    case 'EPIC':
      return <Zap size={15} color="#9333EA" style={{ flexShrink: 0 }} />;
    case 'STORY':
      return <Bookmark size={15} color="#16A34A" style={{ flexShrink: 0 }} />;
    case 'TASK':
      return <CheckSquare size={15} color="#2563EB" style={{ flexShrink: 0 }} />;
    case 'SUBTASK':
    case 'SUB_TASK':
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect x="2" y="2" width="5" height="5" rx="1" fill="#0284C7" />
          <rect x="9" y="9" width="5" height="5" rx="1" fill="#0284C7" />
          <path d="M4.5 7v3.5a1 1 0 001 1H9" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'BUG':
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="8" cy="8" r="6" stroke="#E11D48" strokeWidth="1.5" fill="#FFE4E6" />
          <circle cx="8" cy="8" r="2.5" fill="#E11D48" />
        </svg>
      );
    default:
      return <CheckSquare size={15} color="#64748B" style={{ flexShrink: 0 }} />;
  }
}

function formatTypeLabel(type: string): string {
  const upper = type.toUpperCase();
  if (upper === 'SUB_TASK' || upper === 'SUBTASK') return 'Subtask';
  if (upper === 'EPIC') return 'Epic';
  if (upper === 'STORY') return 'Story';
  if (upper === 'TASK') return 'Task';
  if (upper === 'BUG') return 'Bug';
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

// ─── Types Of Work Widget ───────────────────────────────────────────
export function TypesOfWorkWidget({ projectId, typeBreakdown, isLoading }: TypesOfWorkWidgetProps) {
  const params = useParams();
  const pId = projectId || (params?.projectId as string) || '';

  // Build merged items ensuring all standard types (EPIC, STORY, TASK, SUBTASK, BUG) always exist
  const existingMap = new Map<string, number>();
  (typeBreakdown ?? []).forEach((item) => {
    let key = item.type.toUpperCase();
    if (key === 'SUB_TASK') key = 'SUBTASK';
    existingMap.set(key, (existingMap.get(key) ?? 0) + item.count);
  });

  const mergedItems: Array<{ key: string; label: string; count: number }> = [];
  const processedKeys = new Set<string>();

  // 1. Always list standard types in standard Jira order
  STANDARD_TYPES.forEach((st) => {
    mergedItems.push({
      key: st,
      label: formatTypeLabel(st),
      count: existingMap.get(st) ?? 0,
    });
    processedKeys.add(st);
  });

  // 2. Append any custom types present in typeBreakdown
  (typeBreakdown ?? []).forEach((item) => {
    let key = item.type.toUpperCase();
    if (key === 'SUB_TASK') key = 'SUBTASK';
    if (!processedKeys.has(key)) {
      mergedItems.push({
        key,
        label: formatTypeLabel(item.type),
        count: item.count,
      });
      processedKeys.add(key);
    }
  });

  const total = mergedItems.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="card" style={{ padding: '1.5rem', height: '380px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ marginBottom: 4 }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Types of work</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Get a breakdown of work items by their types.{' '}
          <Link href={`/projects/${pId}/list`} style={{ color: 'var(--color-green-accent)', fontWeight: 500 }}>
            View all items
          </Link>
        </p>

        {/* Column Headers: Type | Distribution */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 8, fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          <span style={{ width: 100, flexShrink: 0 }}>Type</span>
          <span style={{ flex: 1 }}>Distribution</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 100, height: 18, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4 }} />
                <div style={{ flex: 1, height: 18, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {mergedItems.map((item) => {
              const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Type Column */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: 100,
                      flexShrink: 0,
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                    }}
                  >
                    {renderTypeIcon(item.key)}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  </div>

                  {/* Distribution Bar Column */}
                  <div
                    style={{
                      flex: 1,
                      height: 20,
                      backgroundColor: 'rgba(0,0,0,0.06)',
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {percent > 0 ? (
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          backgroundColor: '#6B778C',
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: 8,
                          transition: 'width 0.4s ease',
                          minWidth: percent > 5 ? 36 : undefined,
                        }}
                      >
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{percent}%</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


