'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { timeAgo } from './sidebarUtils';

interface TaskMetadataFooterProps {
  createdAt?: string;
  updatedAt?: string;
}

export function TaskMetadataFooter({ createdAt, updatedAt }: TaskMetadataFooterProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 2px',
        fontSize: '0.75rem',
        color: '#626f86',
      }}
    >
      <div>
        <div>Created {timeAgo(createdAt)}</div>
        <div>Updated {timeAgo(updatedAt)}</div>
      </div>
      <button
        type="button"
        onClick={() => toast.info('Configure task layout')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: '#626f86',
          cursor: 'pointer',
          fontSize: '0.75rem',
        }}
      >
        <Settings size={13} />
        <span>Configure</span>
      </button>
    </div>
  );
}
