'use client';

import { Avatar } from '@/components/ui/Avatar';
import type { ActivityItem } from '@/types/summary';

interface RecentActivityWidgetProps {
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

// ─── Recent Activity Widget ─────────────────────────────────────────
export function RecentActivityWidget({ recentActivity, isLoading }: RecentActivityWidgetProps) {
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
                <div style={{ fontSize: '0.8125rem', lineHeight: 1.45, flex: 1 }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{act.actorName || 'Someone'}</span>{' '}
                    <span style={{ color: 'var(--color-text-secondary)' }}>{act.action}</span>{' '}
                    <span style={{ color: 'var(--color-green-accent)', fontWeight: 600 }}>
                      {act.issueKey ? `${act.issueKey} ` : ''}
                      {act.issueTitle}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
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

