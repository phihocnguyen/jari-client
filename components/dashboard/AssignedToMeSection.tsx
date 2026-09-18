'use client';

import React from 'react';
import { AssignedIssuesTable, AssignedIssueItem } from './AssignedIssuesTable';
import type { Workspace } from '@/types/workspace';

interface AssignedToMeSectionProps {
  workspaces: Workspace[];
  availableProjects: any[];
  filterWorkspaceId: string;
  onFilterWorkspaceChange: (id: string) => void;
  filterProjectId: string;
  onFilterProjectChange: (id: string) => void;
  issues: AssignedIssueItem[];
  totalIssues: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AssignedToMeSection({
  workspaces,
  availableProjects,
  filterWorkspaceId,
  onFilterWorkspaceChange,
  filterProjectId,
  onFilterProjectChange,
  issues,
  totalIssues,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
}: AssignedToMeSectionProps) {
  return (
    <section>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Assigned to Me ({totalIssues})
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Work items assigned to you across all workspaces and projects.
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Workspace Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Workspace:
            </span>
            <select
              value={filterWorkspaceId}
              onChange={(e) => onFilterWorkspaceChange(e.target.value)}
              style={{
                padding: '5px 10px',
                fontSize: '0.8125rem',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.15)',
                backgroundColor: '#fff',
                color: 'var(--color-text-primary)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Workspaces ({workspaces.length})</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Project:
            </span>
            <select
              value={filterProjectId}
              onChange={(e) => onFilterProjectChange(e.target.value)}
              style={{
                padding: '5px 10px',
                fontSize: '0.8125rem',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.15)',
                backgroundColor: '#fff',
                color: 'var(--color-text-primary)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Projects ({availableProjects.length})</option>
              {availableProjects.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <AssignedIssuesTable
        issues={issues}
        totalIssues={totalIssues}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </section>
  );
}
