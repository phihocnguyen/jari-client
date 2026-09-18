'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import type { ActivityItem } from '@/types/summary';

interface RecentActivityWidgetProps {
  projectId?: string;
  recentActivity?: ActivityItem[];
  isLoading?: boolean;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

function getStatusBadge(rawStatus: string) {
  const upper = (rawStatus || '').toUpperCase().replace(/[_\s-]+/g, '');
  if (upper === 'DONE') {
    return { bg: '#e3fcef', color: '#006644', label: 'Done' };
  }
  if (upper === 'INPROGRESS') {
    return { bg: '#e9f2ff', color: '#0052cc', label: 'In Progress' };
  }
  if (upper === 'INREVIEW') {
    return { bg: '#eae6ff', color: '#403294', label: 'In Review' };
  }
  return { bg: '#f1f2f4', color: '#44546f', label: 'To Do' };
}

function formatPriority(rawPriority: string) {
  const upper = (rawPriority || '').toUpperCase().trim();
  switch (upper) {
    case 'HIGHEST':
      return { label: 'Highest', color: '#dc2626' };
    case 'HIGH':
      return { label: 'High', color: '#dc2626' };
    case 'MEDIUM':
      return { label: 'Medium', color: '#d97706' };
    case 'LOW':
      return { label: 'Low', color: '#2563eb' };
    case 'LOWEST':
      return { label: 'Lowest', color: '#64748b' };
    default:
      return { label: rawPriority, color: 'var(--color-text-primary)' };
  }
}

function renderActivityContent(act: ActivityItem, projectId: string) {
  const actionStr = act.action || '';
  const toIndex = actionStr.lastIndexOf(' to ');

  let verb = actionStr;
  let targetNode: React.ReactNode = null;

  if (toIndex !== -1) {
    verb = actionStr.substring(0, toIndex + 4); // e.g. "changed status to "
    const rawTarget = actionStr.substring(toIndex + 4).trim();
    const lowerVerb = verb.toLowerCase();

    if (lowerVerb.includes('status')) {
      const badge = getStatusBadge(rawTarget);
      targetNode = (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1px 8px',
            borderRadius: 4,
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: badge.bg,
            color: badge.color,
            verticalAlign: 'middle',
            margin: '0 4px',
          }}
        >
          {badge.label}
        </span>
      );
    } else if (lowerVerb.includes('priority')) {
      const priorityInfo = formatPriority(rawTarget);
      targetNode = (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1px 6px',
            borderRadius: 4,
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: '#f1f2f4',
            color: priorityInfo.color,
            verticalAlign: 'middle',
            margin: '0 4px',
          }}
        >
          {priorityInfo.label}
        </span>
      );
    } else {
      // Assignee, sprint, or other changed value
      const formattedTarget =
        rawTarget.toUpperCase() === rawTarget && rawTarget.length > 1
          ? rawTarget.charAt(0) + rawTarget.slice(1).toLowerCase()
          : rawTarget;

      targetNode = (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1px 6px',
            borderRadius: 4,
            fontSize: '0.78rem',
            fontWeight: 600,
            backgroundColor: 'rgba(0,0,0,0.06)',
            color: 'var(--color-text-primary)',
            verticalAlign: 'middle',
            margin: '0 4px',
          }}
        >
          {formattedTarget}
        </span>
      );
    }
  }

  const issueHref = projectId && act.issueKey ? `/projects/${projectId}/issues/${act.issueKey}` : null;

  return (
    <div style={{ fontSize: '0.8125rem', lineHeight: 1.55, color: 'var(--color-text-primary)' }}>
      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {act.actorName || 'Someone'}
      </span>{' '}
      <span style={{ color: 'var(--color-text-secondary)' }}>{verb}</span>
      {targetNode}
      {act.issueKey && (
        <>
          {issueHref ? (
            <Link
              href={issueHref}
              style={{
                color: '#0c66e4',
                fontWeight: 600,
                textDecoration: 'none',
                marginLeft: 2,
                marginRight: 6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {act.issueKey}
            </Link>
          ) : (
            <span style={{ color: '#0c66e4', fontWeight: 600, marginLeft: 2, marginRight: 6 }}>
              {act.issueKey}
            </span>
          )}
        </>
      )}
      {act.issueTitle && (
        <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
          {act.issueTitle}
        </span>
      )}
    </div>
  );
}

// ─── Recent Activity Widget ─────────────────────────────────────────
export function RecentActivityWidget({ projectId: propProjectId, recentActivity, isLoading }: RecentActivityWidgetProps) {
  const params = useParams();
  const projectId = propProjectId || (params?.projectId as string) || '';
  const activities = (recentActivity ?? []).slice(0, 10);

  return (
    <div className="card" style={{ padding: '1.5rem', height: '380px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ marginBottom: 4 }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent activity</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          Stay up to date with what&apos;s happening across the project.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.06)' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ width: '80%', height: 14, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4 }} />
                  <div style={{ width: '30%', height: 12, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            No recent activity found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activities.map((act, index) => (
              <div key={`${act.issueKey}-${index}`} style={{ display: 'flex', gap: 12 }}>
                <Avatar name={act.actorName || 'User'} size={32} />
                <div style={{ flex: 1 }}>
                  {renderActivityContent(act, projectId)}
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 3 }}>
                    {formatRelativeTime(act.occurredAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

