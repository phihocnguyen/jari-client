'use client';

import React from 'react';
import type { Issue } from '@/types/issue';

export function StatBadge({
  count,
  label,
  bg,
  color,
  border,
}: {
  count: number;
  label: string;
  bg: string;
  color: string;
  border: string;
}) {
  const isMultiDigit = count >= 10;
  return (
    <span
      title={`${count} ${label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: isMultiDigit ? 'auto' : 20,
        minWidth: 20,
        height: 20,
        padding: isMultiDigit ? '0 5px' : 0,
        borderRadius: 4,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        fontSize: '0.75rem',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum"',
        lineHeight: 1,
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {count}
    </span>
  );
}

export function StatusPillGroup({ issues }: { issues: Issue[] }) {
  let todo = 0;
  let inProgress = 0;
  let done = 0;

  issues.forEach((i) => {
    const s = (i.statusCategory || i.status || '').toUpperCase();
    if (s.includes('DONE') || s.includes('RESOLVED') || s.includes('CLOSED')) {
      done++;
    } else if (s.includes('PROGRESS') || s.includes('REVIEW') || s.includes('DOING')) {
      inProgress++;
    } else {
      todo++;
    }
  });

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <StatBadge count={todo} label="To Do" bg="#DFE1E6" color="#172B4D" border="#C1C7D0" />
      <StatBadge count={inProgress} label="In Progress" bg="#B3D4FF" color="#0747A6" border="#79B0FF" />
      <StatBadge count={done} label="Done" bg="#ABF5D1" color="#006644" border="#57D9A3" />
    </div>
  );
}
