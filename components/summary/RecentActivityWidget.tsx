'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeTime } from '@/utils/date';
import { renderActivityContent } from '@/utils/activity';
import type { ActivityItem } from '@/types/summary';

interface RecentActivityWidgetProps {
  projectId?: string;
  recentActivity?: ActivityItem[];
  isLoading?: boolean;
}

export function RecentActivityWidget({
  projectId: propProjectId,
  recentActivity,
  isLoading,
}: RecentActivityWidgetProps) {
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
