import React from 'react';

export interface ProjectMember {
  userId: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
}

export function timeAgo(dateStr?: string): string {
  if (!dateStr) return 'just now';
  const past = new Date(dateStr).getTime();
  if (isNaN(past)) return dateStr;
  const now = Date.now();
  const diffSec = Math.floor((now - past) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDisplayDateDMY(iso?: string): string {
  if (!iso) return '';
  const datePart = iso.substring(0, 10);
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return datePart;
  return `${d}/${m}/${y}`;
}

export function parseDMYToISO(text: string): string | null {
  const match = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  const date = new Date(iso);
  return isNaN(date.getTime()) ? null : iso;
}

export function labelChipStyle(color?: string): React.CSSProperties {
  const c = color || '#626f86';
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 8px',
    borderRadius: 10,
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: `${c}1f`,
    color: c,
    cursor: 'pointer',
  };
}

export const parentOptionStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 12px',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.8125rem',
  textAlign: 'left',
};
