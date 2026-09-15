'use client';

import React, { useState } from 'react';
import { Plus, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Issue } from '@/types/issue';

interface TaskSubtasksProps {
  subtasks: Issue[];
  isAddingSubtask: boolean;
  onOpenAddSubtask: () => void;
  onCloseAddSubtask: () => void;
  onCreateSubtask: (title: string) => void;
  isCreatingSubtask: boolean;
  onToggleSubtask: (subId: string, done: boolean) => void;
}

export function TaskSubtasks({
  subtasks,
  isAddingSubtask,
  onOpenAddSubtask,
  onCloseAddSubtask,
  onCreateSubtask,
  isCreatingSubtask,
  onToggleSubtask,
}: TaskSubtasksProps) {
  const [title, setTitle] = useState('');

  const completedCount = subtasks.filter((s) => s.status === 'DONE').length;

  const handleSubmit = () => {
    if (title.trim()) {
      onCreateSubtask(title.trim());
      setTitle('');
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#44546f' }}>
          Subtasks {subtasks.length > 0 && `(${completedCount}/${subtasks.length})`}
        </h3>
      </div>

      {/* Progress Bar */}
      {subtasks.length > 0 && (
        <div
          style={{
            height: 5,
            backgroundColor: '#e9f2ff',
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(completedCount / subtasks.length) * 100}%`,
              backgroundColor: '#16a34a',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Subtasks List */}
      {subtasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
          {subtasks.map((st) => {
            const isDone = st.status === 'DONE';
            return (
              <div
                key={st.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 10px',
                  borderRadius: 4,
                  border: '1px solid rgba(0,0,0,0.06)',
                  backgroundColor: '#fafbfc',
                }}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={(e) => onToggleSubtask(st.id, e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <GitFork size={14} color="#0284c7" />
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.8125rem',
                    color: '#0c66e4',
                    fontWeight: 600,
                  }}
                >
                  {st.key}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: '0.875rem',
                    textDecoration: isDone ? 'line-through' : 'none',
                    color: isDone ? '#626f86' : '#172b4d',
                  }}
                >
                  {st.title}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 3,
                    backgroundColor: isDone ? '#e3fcef' : '#f1f2f4',
                    color: isDone ? '#006644' : '#44546f',
                  }}
                >
                  {isDone ? 'Done' : 'To Do'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Create Input or Button */}
      {isAddingSubtask ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 4,
              border: '2px solid #0c66e4',
              fontSize: '0.875rem',
              outline: 'none',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') onCloseAddSubtask();
            }}
          />
          <Button
            size="sm"
            disabled={!title.trim()}
            loading={isCreatingSubtask}
            onClick={handleSubmit}
          >
            Create
          </Button>
          <Button size="sm" variant="ghost" onClick={onCloseAddSubtask}>
            Cancel
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenAddSubtask}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px 8px',
            borderRadius: 4,
            color: '#44546f',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Plus size={14} />
          <span>Add subtask</span>
        </button>
      )}
    </div>
  );
}
