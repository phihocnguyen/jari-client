'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  CornerDownLeft,
  X,
  Plus,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import type { IssueType, IssuePriority } from '@/types/issue';
import { Select } from '@/components/ui/Select';
import { renderPriorityIcon } from '@/utils/issue-priority';
import { renderTypeIcon } from '@/utils/issue-type';

interface ProjectMember {
  userId: string;
  fullName: string;
}

interface IssueListQuickCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    type: IssueType;
    priority: IssuePriority;
    dueDate?: string;
  }) => Promise<void>;
  members?: ProjectMember[];
  isSubmitting: boolean;
  isSubtask?: boolean;
}

export function IssueListQuickCreate({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  isSubtask,
}: IssueListQuickCreateProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<IssueType>(isSubtask ? 'SUBTASK' : 'TASK');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [dueDate, setDueDate] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTitle('');
      setType(isSubtask ? 'SUBTASK' : 'TASK');
      setPriority('MEDIUM');
      setDueDate('');
    }
  }, [isOpen, isSubtask]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    await onSubmit({
      title: title.trim(),
      type,
      priority,
      dueDate: dueDate || undefined,
    });
    setTitle('');
    setDueDate('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <tr
      style={{
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid var(--color-green-brand)',
      }}
    >
      {/* 1. Icon column (aligns with Checkbox) */}
      <td style={{ width: 40, textAlign: 'center', padding: '8px 10px' }}>
        <Plus size={16} color="var(--color-green-brand)" />
      </td>

      {/* 2. Work Column: Type Selector + Input (covers Work, Assignee, Reporter) */}
      <td colSpan={3} style={{ padding: '8px 12px', paddingLeft: isSubtask ? 32 : 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          {isSubtask ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)' }}>
              <CornerDownLeft size={14} />
              {renderTypeIcon('SUBTASK')}
            </div>
          ) : (
            <Select<IssueType>
              value={type}
              onChange={(t) => setType(t)}
              minWidth={140}
              options={(['TASK', 'STORY', 'BUG', 'EPIC'] as IssueType[]).map((opt) => ({
                value: opt,
                label: opt.charAt(0) + opt.slice(1).toLowerCase(),
                icon: renderTypeIcon(opt),
              }))}
              renderTrigger={() => (
                <div
                  title="Select issue type"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 6px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 4,
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {renderTypeIcon(type)}
                  <ChevronDown size={11} color="var(--color-text-secondary)" />
                </div>
              )}
            />
          )}

          {/* Quick Issue Title Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder="What needs to be done? (Press Enter to create)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            style={{
              flex: 1,
              height: 32,
              padding: '0 10px',
              fontSize: '0.84rem',
              border: '1px solid #94a3b8',
              borderRadius: 4,
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          />
        </div>
      </td>

      {/* 3. Priority Column (uses shared Select component) */}
      <td style={{ padding: '8px 12px' }}>
        <Select<IssuePriority>
          value={priority}
          onChange={(pr) => setPriority(pr)}
          minWidth={140}
          options={(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'] as IssuePriority[]).map((pr) => ({
            value: pr,
            label: pr.charAt(0) + pr.slice(1).toLowerCase(),
            icon: renderPriorityIcon(pr),
          }))}
          renderTrigger={() => (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'background-color 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {renderPriorityIcon(priority)}
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: priority === 'HIGH' || priority === 'HIGHEST' ? 600 : 400,
                  color:
                    priority === 'HIGH' || priority === 'HIGHEST'
                      ? '#dc2626'
                      : 'var(--color-text-primary)',
                }}
              >
                {priority.charAt(0) + priority.slice(1).toLowerCase()}
              </span>
              <ChevronDown size={12} style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }} />
            </div>
          )}
        />
      </td>

      {/* 4. Status, Resolution, Created, Updated: Empty spanning cells (cols 6, 7, 8, 9) */}
      <td colSpan={4} style={{ padding: '8px 12px' }} />

      {/* 5. Due Date Column (col 10, right after Created and Updated) */}
      <td style={{ padding: '8px 12px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={13} color="var(--color-text-secondary)" />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isSubmitting}
            title="Select due date (optional)"
            style={{
              height: 28,
              fontSize: '0.78rem',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 4,
              padding: '0 6px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              maxWidth: 125,
              fontFamily: 'inherit',
              color: dueDate ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}
          />
        </div>
      </td>

      {/* 6. Actions (col 11) */}
      <td style={{ padding: '8px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!title.trim() || isSubmitting}
            style={{
              padding: '4px 10px',
              backgroundColor: 'var(--color-green-brand)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: !title.trim() || isSubmitting ? 'not-allowed' : 'pointer',
              opacity: !title.trim() || isSubmitting ? 0.6 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <CornerDownLeft size={12} />
            <span>Create</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '4px',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            title="Cancel (Esc)"
          >
            <X size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
