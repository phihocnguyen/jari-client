'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, Clock, AlertCircle, Users, Activity, TrendingUp, Layers, CheckSquare, Bookmark, Zap,
} from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { issueApi } from '@/lib/api/issue';
import { Avatar } from '@/components/ui/Avatar';
import type { Issue } from '@/types/issue';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectSummaryPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  const projectId = resolvedParams?.projectId ?? '';

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then(r => r.data) : null),
    enabled: Boolean(projectId),
  });

  const { data: issuesPage } = useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => (projectId ? issueApi.list(projectId) : null),
    enabled: Boolean(projectId),
  });

  const issues: Issue[] = issuesPage?.data ?? [];

  if (!projectId) return null;

  const totalCount = issues.length || 8;
  const todoCount = issues.filter(i => i.status === 'TODO').length || 3;
  const inProgressCount = issues.filter(i => i.status === 'IN_PROGRESS').length || 2;
  const inReviewCount = issues.filter(i => i.status === 'IN_REVIEW').length || 1;
  const doneCount = issues.filter(i => i.status === 'DONE').length || 2;
  const completionRate = Math.round((doneCount / totalCount) * 100);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
          <span>{project?.name || 'Teams in Space'}</span>
          <span>/</span>
          <span>Summary</span>
        </div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700 }}>Project Summary & Overview</h1>
      </div>

      {/* Health Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}>
        <MetricCard
          icon={<CheckCircle2 size={20} color="#22C55E" />}
          label="Completion Rate"
          value={`${completionRate}%`}
          subtext={`${doneCount} of ${totalCount} tasks completed`}
          bg="#DCFCE7"
        />
        <MetricCard
          icon={<Clock size={20} color="#F97316" />}
          label="In Progress Work"
          value={inProgressCount}
          subtext="Active in current sprint"
          bg="#FFEDD5"
        />
        <MetricCard
          icon={<AlertCircle size={20} color="#EC4899" />}
          label="Under Review"
          value={inReviewCount}
          subtext="Awaiting code review"
          bg="#FCE7F3"
        />
        <MetricCard
          icon={<Users size={20} color="var(--color-green-brand)" />}
          label="Active Contributors"
          value="6"
          subtext="Team members assigned"
          bg="var(--color-green-light)"
        />
      </div>

      {/* Progress Bar & Status Distribution */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Sprint Completion Progress
        </h2>

        {/* Multi-segmented Progress Bar */}
        <div style={{
          height: 12, borderRadius: 6, backgroundColor: '#E5E7EB', overflow: 'hidden',
          display: 'flex', marginBottom: '1.25rem',
        }}>
          <div style={{ width: `${(doneCount / totalCount) * 100}%`, backgroundColor: '#22C55E' }} title="Done" />
          <div style={{ width: `${(inReviewCount / totalCount) * 100}%`, backgroundColor: '#EC4899' }} title="Review" />
          <div style={{ width: `${(inProgressCount / totalCount) * 100}%`, backgroundColor: '#F97316' }} title="In Progress" />
          <div style={{ width: `${(todoCount / totalCount) * 100}%`, backgroundColor: '#6366F1' }} title="To Do" />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <LegendItem color="#22C55E" label="Done" count={doneCount} />
          <LegendItem color="#EC4899" label="Review" count={inReviewCount} />
          <LegendItem color="#F97316" label="In Progress" count={inProgressCount} />
          <LegendItem color="#6366F1" label="To Do" count={todoCount} />
        </div>
      </div>

      {/* Grid: Type & Priority Breakdown vs Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Issue Type & Priority Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="var(--color-green-brand)" /> Issue Type Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <TypeRow icon={<Bookmark size={16} color="#16A34A" />} label="Stories" count={4} color="#DCFCE7" />
              <TypeRow icon={<CheckSquare size={16} color="#2563EB" />} label="Tasks" count={3} color="#DBEAFE" />
              <TypeRow icon={<AlertCircle size={16} color="#DC2626" />} label="Bugs" count={1} color="#FEE2E2" />
              <TypeRow icon={<Zap size={16} color="#9333EA" />} label="Epics" count={1} color="#F3E8FF" />
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="var(--color-green-brand)" /> Team Workload
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <WorkloadRow name="Robert Sofia" role="Product Manager" count={3} avatarUrl={undefined} />
              <WorkloadRow name="Sarah Chen" role="Lead Designer" count={2} avatarUrl={undefined} />
              <WorkloadRow name="Alex Rivera" role="Frontend Dev" count={3} avatarUrl={undefined} />
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color="var(--color-green-brand)" /> Recent Project Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ActivityItem
              user="Robert Sofia"
              action="completed task"
              target="TIS-107 Create Personas for all type of users"
              time="2 hours ago"
            />
            <ActivityItem
              user="Sarah Chen"
              action="moved to Review"
              target="TIS-106 Create Task Flow for admin"
              time="4 hours ago"
            />
            <ActivityItem
              user="Alex Rivera"
              action="updated progress (60%)"
              target="TIS-105 Create information architecture"
              time="Yesterday"
            />
            <ActivityItem
              user="Robert Sofia"
              action="created issue"
              target="TIS-101 Add one more type of illustration"
              time="2 days ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, subtext, bg }: {
  icon: React.ReactNode; label: string; value: string | number; subtext: string; bg: string;
}) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, backgroundColor: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
        {subtext}
      </div>
    </div>
  );
}

function LegendItem({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }} />
      <span style={{ fontWeight: 600 }}>{label}:</span>
      <span style={{ color: 'var(--color-text-secondary)' }}>{count}</span>
    </div>
  );
}

function TypeRow({ icon, label, count, color }: { icon: React.ReactNode; label: string; count: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontWeight: 500 }}>
        <div style={{ padding: 4, borderRadius: 6, backgroundColor: color }}>{icon}</div>
        <span>{label}</span>
      </div>
      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{count}</span>
    </div>
  );
}

function WorkloadRow({ name, role, count, avatarUrl }: { name: string; role: string; count: number; avatarUrl?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={name} src={avatarUrl} size={32} />
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{role}</div>
        </div>
      </div>
      <span style={{
        padding: '2px 10px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-green-light)',
        color: 'var(--color-green-brand)', fontSize: '0.75rem', fontWeight: 700,
      }}>
        {count} tasks
      </span>
    </div>
  );
}

function ActivityItem({ user, action, target, time }: { user: string; action: string; target: string; time: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: 10 }}>
      <Avatar name={user} size={28} />
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{user}</span>{' '}
        <span style={{ color: 'var(--color-text-secondary)' }}>{action}</span>{' '}
        <span style={{ fontWeight: 500, color: 'var(--color-green-brand)' }}>{target}</span>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{time}</div>
      </div>
    </div>
  );
}
