'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  CheckSquare,
  Bookmark,
  AlertCircle,
  Zap,
  GitFork,
  ChevronDown,
  CornerDownLeft,
  X,
  Plus,
} from 'lucide-react';
import type { IssueType, IssuePriority } from '@/types/issue';

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
    assigneeId?: string;
  }) => Promise<void>;
  members: ProjectMember[];
  isSubmitting: boolean;
  isSubtask?: boolean;
}

export function IssueListQuickCreate({
  isOpen,
  onClose,
  onSubmit,
  members,
  isSubmitting,
  isSubtask,
}: IssueListQuickCreateProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<IssueType>(isSubtask ? 'SUBTASK' : 'TASK');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTitle('');
      setType(isSubtask ? 'SUBTASK' : 'TASK');
      setPriority('MEDIUM');
      setAssigneeId('');
    }
  }, [isOpen, isSubtask]);

  if (!isOpen) return null;

  const renderTypeIcon = (t: IssueType) => {
    switch (t) {
      case 'EPIC':
        return <Zap size={15} color="#9333ea" fill="#9333ea" />;
      case 'STORY':
        return <Bookmark size={15} color="#16a34a" fill="#16a34a" />;
      case 'BUG':
        return <AlertCircle size={15} color="#dc2626" />;
      case 'SUBTASK':
        return <GitFork size={15} color="#0284c7" />;
      case 'TASK':
      default:
        return <CheckSquare size={15} color="#2563eb" />;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    await onSubmit({
      title: title.trim(),
      type,
      priority,
      assigneeId: assigneeId || undefined,
    });
    setTitle('');
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
      <td style={{ width: 40, textAlign: 'center', padding: '8px 10px' }}>
        <Plus size={16} color="var(--color-green-brand)" />
      </td>

      {/* Work Column: Type Selector + Input */}
      <td style={{ padding: '8px 12px', paddingLeft: isSubtask ? 32 : 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          {isSubtask ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)' }}>
              <CornerDownLeft size={14} />
              {renderTypeIcon('SUBTASK')}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setTypeMenuOpen(!typeMenuOpen)}
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
            }}
          >
            {renderTypeIcon(type)}
            <ChevronDown size={11} color="var(--color-text-secondary)" />
          </button>
          )}

          {typeMenuOpen && !isSubtask && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 60,
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: 140,
                padding: '4px 0',
              }}
            >
              {/* Type Options */}
              {(['TASK', 'STORY', 'BUG', 'EPIC'] as IssueType[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setType(opt);
                    setTypeMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {renderTypeIcon(opt)}
                  <span>{opt.charAt(0) + opt.slice(1).toLowerCase()}</span>
                </button>
              ))}
            </div>
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

      {/* Assignee Column */}
      <td style={{ padding: '8px 12px' }}>
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          disabled={isSubmitting}
          style={{
            height: 30,
            fontSize: '0.8125rem',
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: 4,
            padding: '0 6px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            maxWidth: 140,
          }}
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.fullName}
            </option>
          ))}
        </select>
      </td>

      {/* Reporter: Current user placeholder */}
      <td style={{ padding: '8px 12px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
        You
      </td>

      {/* Priority Column */}
      <td style={{ padding: '8px 12px' }}>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as IssuePriority)}
          disabled={isSubmitting}
          style={{
            height: 30,
            fontSize: '0.8125rem',
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: 4,
            padding: '0 6px',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          <option value="HIGHEST">Highest</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="LOWEST">Lowest</option>
        </select>
      </td>

      {/* Status: Default To Do */}
      <td style={{ padding: '8px 12px' }}>
        <span
          style={{
            padding: '2px 8px',
            backgroundColor: '#f1f2f4',
            color: '#44546f',
            border: '1px solid #dcdfe4',
            borderRadius: 4,
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          To Do
        </span>
      </td>

      {/* Resolution */}
      <td style={{ padding: '8px 12px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
        Unresolved
      </td>

      {/* Created & Updated placeholders */}
      <td style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
        Just now
      </td>
      <td style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
        Just now
      </td>

      {/* Actions */}
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
