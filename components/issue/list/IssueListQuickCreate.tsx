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
import type { ColumnId } from './column-types';
import { DEFAULT_COLUMN_ORDER } from './column-types';

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
  visibleColumns?: ColumnId[];
  columnWidths?: Record<ColumnId, number>;
}

export function IssueListQuickCreate({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  isSubtask,
  visibleColumns = DEFAULT_COLUMN_ORDER,
  columnWidths,
}: IssueListQuickCreateProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<IssueType>(isSubtask ? 'SUBTASK' : 'TASK');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [dueDate, setDueDate] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);

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

  const renderCell = (colId: ColumnId, isLast = false) => {
    switch (colId) {
      case 'work':
        return (
          <td
            key="work"
            style={{
              padding: '8px 12px',
              paddingLeft: isSubtask ? 32 : 12,
              borderRight: isLast ? 'none' : '1px solid #dcdfe4',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
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
                  minWidth: 0,
                  height: 32,
                  padding: '0 10px',
                  fontSize: '0.84rem',
                  border: '1px solid #94a3b8',
                  borderRadius: 4,
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={!title.trim() || isSubmitting}
                  style={{
                    padding: '4px 8px',
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
                  <X size={14} />
                </button>
              </div>
            </div>
          </td>
        );

      case 'priority':
        return (
          <td
            key="priority"
            style={{
              padding: '8px 12px',
              borderRight: isLast ? 'none' : '1px solid #dcdfe4',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
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
        );

      case 'dueDate': {
        const formattedDueDate = dueDate
          ? new Date(dueDate + 'T00:00:00').toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '';

        const openDueDatePicker = () => {
          if (isSubmitting) return;
          const el = dueDateInputRef.current;
          if (!el) return;
          try {
            el.showPicker?.();
          } catch {
            el.click();
          }
        };

        return (
          <td
            key="dueDate"
            style={{
              padding: '6px 10px',
              borderRight: isLast ? 'none' : '1px solid #dcdfe4',
              overflow: 'hidden',
              boxSizing: 'border-box',
              verticalAlign: 'middle',
              position: 'relative',
            }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={openDueDatePicker}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openDueDatePicker();
                }
              }}
              title="Select due date (optional)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 6px',
                borderRadius: 4,
                maxWidth: '100%',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              <Calendar
                size={13}
                style={{
                  color: dueDate ? '#0c66e4' : 'var(--color-text-secondary)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: dueDate ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {formattedDueDate || '-'}
              </span>
            </div>
            <input
              ref={dueDateInputRef}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
              tabIndex={-1}
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 1,
                height: 1,
                opacity: 0,
                pointerEvents: 'none',
                border: 0,
                padding: 0,
                margin: 0,
              }}
            />
          </td>
        );
      }

      default:
        // Empty cells for unassigned columns like Assignee, Reporter, Status, Resolution, Created, Updated
        return (
          <td
            key={colId}
            style={{
              padding: '8px 12px',
              borderRight: isLast ? 'none' : '1px solid #dcdfe4',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          />
        );
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
      <td
        style={{
          width: 40,
          textAlign: 'center',
          padding: '8px 10px',
          verticalAlign: 'middle',
          borderRight: '1px solid #dcdfe4',
          boxSizing: 'border-box',
        }}
      >
        <Plus size={16} color="var(--color-green-brand)" />
      </td>

      {/* Dynamic columns matching header order */}
      {visibleColumns.map((colId, index) => renderCell(colId, index === visibleColumns.length - 1))}
    </tr>
  );
}
