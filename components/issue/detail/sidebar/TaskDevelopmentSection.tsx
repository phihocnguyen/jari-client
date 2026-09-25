'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  GitCommit,
  GitPullRequest,
  GitBranch,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { developmentApi } from '@/lib/api/development';
import type { IssueDevelopment, DevelopmentType } from '@/types/development';
import { LinkDevModal } from './LinkDevModal';

interface TaskDevelopmentSectionProps {
  issueId: string;
}

const GROUPS: { type: DevelopmentType; label: string; icon: React.ReactNode }[] = [
  { type: 'BRANCH', label: 'Branches', icon: <GitBranch size={14} color="#0c66e4" /> },
  { type: 'COMMIT', label: 'Commits', icon: <GitCommit size={14} color="#36b37e" /> },
  {
    type: 'PULL_REQUEST',
    label: 'Pull requests',
    icon: <GitPullRequest size={14} color="#6554c0" />,
  },
];

export function TaskDevelopmentSection({ issueId }: TaskDevelopmentSectionProps) {
  const [devExpanded, setDevExpanded] = useState(false);
  const [developments, setDevelopments] = useState<IssueDevelopment[]>([]);
  const [isDevLoading, setIsDevLoading] = useState(false);
  const [devModalOpen, setDevModalOpen] = useState(false);
  const [isSubmittingDev, setIsSubmittingDev] = useState(false);

  useEffect(() => {
    if (!issueId || !devExpanded) return;
    setIsDevLoading(true);
    developmentApi
      .list(issueId)
      .then((data) => setDevelopments(data))
      .catch((err) => console.error('Failed to load developments:', err))
      .finally(() => setIsDevLoading(false));
  }, [issueId, devExpanded]);

  const grouped: Record<DevelopmentType, IssueDevelopment[]> = {
    BRANCH: [],
    COMMIT: [],
    PULL_REQUEST: [],
  };
  for (const dev of developments) {
    (grouped[dev.type] ?? grouped.COMMIT).push(dev);
  }

  const handleCreateDev = async (data: {
    type: DevelopmentType;
    title: string;
    url: string;
    status?: string;
  }) => {
    setIsSubmittingDev(true);
    try {
      const created = await developmentApi.create(issueId, data);
      setDevelopments((prev) => [created, ...prev]);
      toast.success('Development item linked');
      setDevModalOpen(false);
    } catch {
      toast.error('Failed to link development item');
    } finally {
      setIsSubmittingDev(false);
    }
  };

  const handleDeleteDev = async (id: string) => {
    try {
      await developmentApi.delete(id);
      setDevelopments((prev) => prev.filter((d) => d.id !== id));
      toast.success('Development link removed');
    } catch {
      toast.error('Failed to remove link');
    }
  };

  return (
    <>
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 8,
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.84rem',
          }}
          onClick={() => setDevExpanded(!devExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {devExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>Development {developments.length > 0 && `(${developments.length})`}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDevModalOpen(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#0c66e4',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Plus size={13} />
            <span>Link item</span>
          </button>
        </div>

        {devExpanded && (
          <div style={{ padding: '4px 14px 12px', fontSize: '0.8125rem' }}>
            {isDevLoading ? (
              <div style={{ color: '#626f86', padding: '4px 0' }}>Loading developments...</div>
            ) : developments.length === 0 ? (
              <div style={{ color: '#626f86', padding: '4px 0' }}>
                No branches, commits, or pull requests connected yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {GROUPS.map(({ type, label, icon }) => {
                  const items = grouped[type];
                  if (items.length === 0) return null;
                  return (
                    <div key={type}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 6,
                          color: '#44546f',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {icon}
                        <span>
                          {label} ({items.length})
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {items.map((dev) => (
                          <DevRow key={dev.id} dev={dev} onDelete={handleDeleteDev} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <LinkDevModal
        isOpen={devModalOpen}
        onClose={() => setDevModalOpen(false)}
        onSubmit={handleCreateDev}
        isSubmitting={isSubmittingDev}
      />
    </>
  );
}

function DevRow({
  dev,
  onDelete,
}: {
  dev: IssueDevelopment;
  onDelete: (id: string) => void;
}) {
  const isPr = dev.type === 'PULL_REQUEST';
  const statusBg =
    dev.status === 'MERGED' ? '#e3fcef' : dev.status === 'OPEN' ? '#eae6ff' : '#f4f5f7';
  const statusColor =
    dev.status === 'MERGED' ? '#006644' : dev.status === 'OPEN' ? '#403294' : '#42526e';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 8px',
        borderRadius: 6,
        backgroundColor: '#f8f9fa',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
        <a
          href={dev.url}
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#0c66e4',
            textDecoration: 'none',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          {dev.title}
        </a>
        {isPr && dev.status && (
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 4,
              backgroundColor: statusBg,
              color: statusColor,
              flexShrink: 0,
            }}
          >
            {dev.status}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
        <a
          href={dev.url}
          target="_blank"
          rel="noreferrer"
          title="Open external link"
          style={{ color: '#626f86', display: 'flex', alignItems: 'center' }}
        >
          <ExternalLink size={13} />
        </a>
        <button
          type="button"
          onClick={() => onDelete(dev.id)}
          title="Remove link"
          style={{
            background: 'none',
            border: 'none',
            color: '#de350b',
            cursor: 'pointer',
            padding: 2,
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
