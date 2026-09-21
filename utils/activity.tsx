'use client';

import React from 'react';
import Link from 'next/link';
import { getStatusBadgeStyle } from '@/utils/issue-status';
import { formatPriorityLabel } from '@/utils/issue-priority';
import type { ActivityItem } from '@/types/summary';

/**
 * Normalizes text to avoid CAPS LOCK, converting words to clean Title Case.
 */
export function formatNoCaps(str: string): string {
  if (!str) return '';
  const trimmed = str.trim();
  const upper = trimmed.toUpperCase().replace(/[_\s-]+/g, ' ');

  if (upper === 'TODO' || upper === 'TO DO') return 'To Do';
  if (upper === 'IN PROGRESS') return 'In Progress';
  if (upper === 'IN REVIEW') return 'In Review';
  if (upper === 'DONE') return 'Done';
  if (upper === 'HIGHEST') return 'Highest';
  if (upper === 'HIGH') return 'High';
  if (upper === 'MEDIUM') return 'Medium';
  if (upper === 'LOW') return 'Low';
  if (upper === 'LOWEST') return 'Lowest';
  if (upper === 'BACKLOG') return 'Backlog';

  if (/^[A-Z0-9_\s-]+$/.test(trimmed) && trimmed.length > 1) {
    return trimmed
      .replace(/_/g, ' ')
      .split(/\s+/)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
      .join(' ');
  }

  return trimmed;
}

/** Strip redundant "sprint" prefix from sprint names like "MOBILE Sprint 1" → "Sprint 1" */
function cleanSprintLabel(raw: string): string {
  const formatted = formatNoCaps(raw);
  return formatted.replace(/^sprint\s+/i, '').trim() || formatted;
}

function IssueLink({ issueKey, projectId }: { issueKey: string; projectId: string }) {
  const href = projectId ? `/projects/${projectId}/issues/${issueKey}` : null;
  const style: React.CSSProperties = {
    color: '#0c66e4',
    fontWeight: 600,
    textDecoration: 'none',
  };

  if (!href) {
    return <span style={style}>{issueKey}</span>;
  }

  return (
    <Link
      href={href}
      style={style}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
    >
      {issueKey}
    </Link>
  );
}

function ValueBadge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'status' | 'priority' }) {
  if (tone === 'status' && typeof children === 'string') {
    const badge = getStatusBadgeStyle(children);
    return (
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
          margin: '0 3px',
        }}
      >
        {badge.label}
      </span>
    );
  }

  if (tone === 'priority' && typeof children === 'string') {
    const priorityInfo = formatPriorityLabel(children);
    return (
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
          margin: '0 3px',
        }}
      >
        {priorityInfo.label}
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: '#f1f2f4',
        color: 'var(--color-text-primary)',
        verticalAlign: 'middle',
        margin: '0 3px',
      }}
    >
      {children}
    </span>
  );
}

function Actor({ name }: { name?: string }) {
  return (
    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
      {name || 'Someone'}
    </span>
  );
}

function ActionText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: 'var(--color-text-secondary)' }}>
      {children}
    </span>
  );
}

/**
 * Renders activity as a readable sentence, e.g.
 * "hoc ng moved MOBILE-7 to Sprint 1"
 */
export function renderActivityContent(act: ActivityItem, projectId: string): React.ReactNode {
  const action = (act.action ?? '').trim();
  const lower = action.toLowerCase();
  const link = act.issueKey ? <IssueLink issueKey={act.issueKey} projectId={projectId} /> : null;

  // renamed issue → show new title
  if (lower === 'renamed issue') {
    return (
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.55 }}>
        <Actor name={act.actorName} />{' '}
        <ActionText>renamed</ActionText> {link}
        {act.issueTitle && (
          <>
            {' '}
            <ActionText>to</ActionText>{' '}
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              &ldquo;{act.issueTitle}&rdquo;
            </span>
          </>
        )}
      </div>
    );
  }

  if (lower.startsWith('reassigned to ')) {
    const assignee = action.slice('reassigned to '.length);
    return (
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.55 }}>
        <Actor name={act.actorName} />{' '}
        <ActionText>assigned</ActionText> {link}{' '}
        <ActionText>to</ActionText> <ValueBadge>{formatNoCaps(assignee)}</ValueBadge>
      </div>
    );
  }

  if (lower.startsWith('changed status to ')) {
    const status = action.slice('changed status to '.length);
    return (
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.55 }}>
        <Actor name={act.actorName} />{' '}
        <ActionText>changed the status of</ActionText> {link}{' '}
        <ActionText>to</ActionText> <ValueBadge tone="status">{status}</ValueBadge>
      </div>
    );
  }

  if (lower.startsWith('changed priority to ')) {
    const priority = action.slice('changed priority to '.length);
    return (
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.55 }}>
        <Actor name={act.actorName} />{' '}
        <ActionText>changed the priority of</ActionText> {link}{' '}
        <ActionText>to</ActionText> <ValueBadge tone="priority">{priority}</ValueBadge>
      </div>
    );
  }

  if (lower.startsWith('moved to sprint ')) {
    const sprint = cleanSprintLabel(action.slice('moved to sprint '.length));
    return (
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.55 }}>
        <Actor name={act.actorName} />{' '}
        <ActionText>moved</ActionText> {link}{' '}
        <ActionText>to</ActionText> <ValueBadge>{sprint}</ValueBadge>
      </div>
    );
  }

  if (lower === 'updated the description') {
    return (
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.55 }}>
        <Actor name={act.actorName} />{' '}
        <ActionText>updated the description of</ActionText> {link}
      </div>
    );
  }

  if (lower.startsWith('updated ')) {
    const field = action.slice('updated '.length);
    return (
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.55 }}>
        <Actor name={act.actorName} />{' '}
        <ActionText>updated {field} on</ActionText> {link}
      </div>
    );
  }

  // Fallback
  return (
    <div style={{ fontSize: '0.8125rem', lineHeight: 1.55 }}>
      <Actor name={act.actorName} />{' '}
      <ActionText>{action || 'made a change to'}</ActionText> {link}
    </div>
  );
}

// Kept for any external imports — no longer used internally
export type ParsedActivityType = 'status' | 'priority' | 'assignee' | 'sprint' | 'generic' | 'other';

export interface ParsedActivity {
  verb: string;
  target: string | null;
  type: ParsedActivityType;
}

export function parseActivityAction(actionStr?: string): ParsedActivity {
  if (!actionStr) return { verb: 'updated', target: null, type: 'other' };
  const lower = actionStr.toLowerCase();
  if (lower.startsWith('changed status to ')) return { verb: 'changed status to ', target: actionStr.slice(18), type: 'status' };
  if (lower.startsWith('changed priority to ')) return { verb: 'changed priority to ', target: actionStr.slice(20), type: 'priority' };
  if (lower.startsWith('reassigned to ')) return { verb: 'reassigned to ', target: actionStr.slice(14), type: 'assignee' };
  if (lower.startsWith('moved to sprint ')) return { verb: 'moved to sprint ', target: actionStr.slice(16), type: 'sprint' };
  return { verb: actionStr, target: null, type: 'other' };
}
