'use client';

import React from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { CheckSquare, Bookmark, AlertCircle, Zap, GitFork } from 'lucide-react';
import type { ReferenceItem } from '@/lib/api/ref';
import type { CreateIssueFormData } from '@/lib/validations/issue';

interface IssueTypeSelectProps {
  selectedType?: string;
  issueTypes: ReferenceItem[];
  register: UseFormRegister<CreateIssueFormData>;
  setValue: UseFormSetValue<CreateIssueFormData>;
}

export function renderIssueTypeIcon(type?: string, size = 15) {
  switch (type?.toUpperCase()) {
    case 'EPIC':
      return <Zap size={size} color="#9333ea" fill="#9333ea" />;
    case 'STORY':
      return <Bookmark size={size} color="#16a34a" fill="#16a34a" />;
    case 'BUG':
      return <AlertCircle size={size} color="#dc2626" />;
    case 'SUBTASK':
      return <GitFork size={size} color="#0284c7" />;
    case 'TASK':
    default:
      return <CheckSquare size={size} color="#2563eb" />;
  }
}

export function IssueTypeSelect({
  selectedType,
  issueTypes,
  register,
  setValue,
}: IssueTypeSelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        Issue Type <span style={{ color: 'var(--color-red)' }}>*</span>
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            position: 'absolute',
            left: 10,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {renderIssueTypeIcon(selectedType)}
        </span>
        <select
          {...register('type', {
            onChange: (e) => {
              const selectedName = e.target.value;
              const matched = issueTypes.find(
                (t) => t.name.toUpperCase() === selectedName.toUpperCase()
              );
              if (matched) setValue('issueTypeId', matched.id);
            },
          })}
          className="input"
          style={{
            paddingLeft: '2.3rem',
            height: 36,
            fontSize: '0.84rem',
            cursor: 'pointer',
            backgroundColor: '#ffffff',
          }}
        >
          {issueTypes.length > 0 ? (
            issueTypes.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name.charAt(0) + t.name.slice(1).toLowerCase()}
              </option>
            ))
          ) : (
            <>
              <option value="TASK">Task</option>
              <option value="STORY">Story</option>
              <option value="BUG">Bug</option>
              <option value="EPIC">Epic</option>
              <option value="SUBTASK">Subtask</option>
            </>
          )}
        </select>
      </div>
    </div>
  );
}
