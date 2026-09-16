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
  Calendar,
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
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const typeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTitle('');
      setType(isSubtask ? 'SUBTASK' : 'TASK');
      setPriority('MEDIUM');
      setDueDate('');
      setTypeMenuOpen(false);
    }
  }, [isOpen, isSubtask]);

  // Close type menu when clicking outside
  useEffect(() => {
    if (!typeMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        typeMenuRef.current &&
        !typeMenuRef.current.contains(e.target as Node) &&
        typeButtonRef.current &&
        !typeButtonRef.current.contains(e.target as Node)
      ) {
        setTypeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [typeMenuOpen]);

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

  const handleToggleTypeMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOpenUpwards(window.innerHeight - rect.bottom < 180 || isSubtask === false);
    setTypeMenuOpen((v) => !v);
  };

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
      if (typeMenuOpen) {
        setTypeMenuOpen(false);
      } else {
        onClose();
      }
    }
  };

  return (
    <tr
      style={{
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid var(--color-green-brand)',
      }}
    >
      {/* 1. Icon column */}
      <td style={{ width: 40, textAlign: 'center', padding: '8px 10px' }}>
        <Plus size={16} color="var(--color-green-brand)" />
      </td>

      {/* 2. Work Column (covers Work, Assignee, Reporter) */}
      <td colSpan={3} style={{ padding: '8px 12px', paddingLeft: isSubtask ? 32 : 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          {isSubtask ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)' }}>
              <CornerDownLeft size={14} />
              {renderTypeIcon('SUBTASK')}
            </div>
          ) : (
            <button
              ref={typeButtonRef}
              type="button"
              onClick={handleToggleTypeMenu}
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
            </button>
          )}

          {typeMenuOpen && !isSubtask && (
            <div
              ref={typeMenuRef}
              style={{
                position: 'absolute',
                ...(openUpwards ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
                left: 0,
                zIndex: 100,
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: 6,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                minWidth: 140,
                padding: '4px 0',
              }}
            >
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

      {/* 3. Priority Column */}
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

      {/* 4. Status & Resolution: Empty spanning cells (Status defaults to To Do, Resolution is Unresolved) */}
      <td colSpan={2} style={{ padding: '8px 12px' }} />

      {/* 5. Due Date Column */}
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

      {/* 6. Created & Updated: Empty spanning cells */}
      <td colSpan={2} style={{ padding: '8px 12px' }} />

      {/* 7. Actions */}
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
