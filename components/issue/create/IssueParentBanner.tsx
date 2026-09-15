'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface IssueParentBannerProps {
  parentId?: string;
  parentKey?: string;
  parentTitle?: string;
}

export function IssueParentBanner({
  parentId,
  parentKey,
  parentTitle,
}: IssueParentBannerProps) {
  if (!parentId) return null;

  return (
    <div
      style={{
        padding: '8px 12px',
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: '0.8125rem',
        color: '#1e40af',
      }}
    >
      <ArrowUpRight size={16} />
      <span>
        Creating child issue for parent:{' '}
        <strong>{parentKey ? `${parentKey}: ` : ''}{parentTitle || parentId}</strong>
      </span>
    </div>
  );
}
