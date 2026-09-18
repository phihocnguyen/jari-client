'use client';

import React from 'react';
import { Briefcase, FolderKanban, CheckCircle2 } from 'lucide-react';

interface DashboardStatsProps {
  workspacesCount: number;
  projectsCount: number;
  issuesCount: number;
  isLoadingWorkspaces: boolean;
  isLoadingProjects: boolean;
  isLoadingIssues: boolean;
}

export function DashboardStats({
  workspacesCount,
  projectsCount,
  issuesCount,
  isLoadingWorkspaces,
  isLoadingProjects,
  isLoadingIssues,
}: DashboardStatsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
      }}
    >
      <StatCard
        icon={<Briefcase size={22} />}
        label="Workspaces"
        value={isLoadingWorkspaces ? '—' : workspacesCount}
        color="var(--color-green-accent)"
        bg="#D4E9E2"
      />
      <StatCard
        icon={<FolderKanban size={22} />}
        label="Total Projects"
        value={isLoadingProjects ? '—' : projectsCount}
        color="#2563EB"
        bg="#DBEAFE"
      />
      <StatCard
        icon={<CheckCircle2 size={22} />}
        label="My Open Tasks"
        value={isLoadingIssues ? '—' : issuesCount}
        color="#D97706"
        bg="#FEF3C7"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 3 }}>
          {label}
        </div>
      </div>
    </div>
  );
}
