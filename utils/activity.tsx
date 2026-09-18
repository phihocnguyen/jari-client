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

  // If the whole string was in all-caps and has more than 1 char, convert to Title Case
  if (/^[A-Z0-9_\s-]+$/.test(trimmed) && trimmed.length > 1) {
    return trimmed
      .replace(/_/g, ' ')
      .split(/\s+/)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
      .join(' ');
  }

  return trimmed;
}

export type ParsedActivityType = 'status' | 'priority' | 'assignee' | 'sprint' | 'generic' | 'other';

export interface ParsedActivity {
  verb: string;
  target: string | null;
  type: ParsedActivityType;
}

/**
 * Parses an action string (e.g. "changed status to TO DO") into a structured action
 */
export function parseActivityAction(actionStr?: string): ParsedActivity {
  if (!actionStr) {
    return { verb: 'updated', target: null, type: 'other' };
  }

  const toIndex = actionStr.lastIndexOf(' to ');
  if (toIndex !== -1) {
    const verb = actionStr.substring(0, toIndex + 4);
    const rawTarget = actionStr.substring(toIndex + 4).trim();
    const lowerVerb = verb.toLowerCase();

    if (lowerVerb.includes('status')) {
      return { verb, target: rawTarget, type: 'status' };
    }
    if (lowerVerb.includes('priority')) {
      return { verb, target: rawTarget, type: 'priority' };
    }
    if (lowerVerb.includes('reassigned') || lowerVerb.includes('assignee')) {
      return { verb, target: rawTarget, type: 'assignee' };
    }
    if (lowerVerb.includes('sprint')) {
      return { verb, target: rawTarget, type: 'sprint' };
    }
    return { verb, target: rawTarget, type: 'generic' };
  }

  return { verb: actionStr, target: null, type: 'other' };
}

/**
 * Renders the parsed activity text with highlighted badges/tags and interactive issue link
 */
export function renderActivityContent(act: ActivityItem, projectId: string): React.ReactNode {
  const { verb, target, type } = parseActivityAction(act.action);

  let targetNode: React.ReactNode = null;

  if (target) {
    if (type === 'status') {
      const badge = getStatusBadgeStyle(target);
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
    } else if (type === 'priority') {
      const priorityInfo = formatPriorityLabel(target);
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
      const formatted = formatNoCaps(target);
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
          {formatted}
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
