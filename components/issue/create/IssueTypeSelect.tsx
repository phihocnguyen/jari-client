'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { CheckSquare, Bookmark, AlertCircle, Zap, GitFork, ChevronDown, Check } from 'lucide-react';
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
      return <Zap size={size} color="#9333ea" fill="#9333ea" style={{ flexShrink: 0 }} />;
    case 'STORY':
      return <Bookmark size={size} color="#16a34a" fill="#16a34a" style={{ flexShrink: 0 }} />;
    case 'BUG':
      return <AlertCircle size={size} color="#dc2626" style={{ flexShrink: 0 }} />;
    case 'SUBTASK':
      return <GitFork size={size} color="#0284c7" style={{ flexShrink: 0 }} />;
    case 'TASK':
    default:
      return <CheckSquare size={size} color="#2563eb" style={{ flexShrink: 0 }} />;
  }
}

const DEFAULT_TYPES: { id: string; name: string }[] = [
  { id: 'STORY', name: 'Story' },
  { id: 'TASK', name: 'Task' },
  { id: 'BUG', name: 'Bug' },
  { id: 'EPIC', name: 'Epic' },
  { id: 'SUBTASK', name: 'Subtask' },
];

export function IssueTypeSelect({
  selectedType = 'STORY',
  issueTypes,
  register,
  setValue,
}: IssueTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const availableTypes = issueTypes && issueTypes.length > 0
    ? issueTypes.map(t => ({ id: t.id, name: t.name.charAt(0) + t.name.slice(1).toLowerCase(), rawName: t.name }))
    : DEFAULT_TYPES.map(t => ({ id: t.id, name: t.name, rawName: t.id }));

  const currentType = availableTypes.find(
    t => t.rawName.toUpperCase() === (selectedType || '').toUpperCase()
  ) || availableTypes[0] || { id: 'STORY', name: 'Story', rawName: 'STORY' };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (typeItem: { id: string; name: string; rawName: string }) => {
    setValue('type', typeItem.rawName as any);
    setValue('issueTypeId', typeItem.id);
    setOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        Issue Type <span style={{ color: 'var(--color-red)' }}>*</span>
      </label>

      {/* Hidden input for react-hook-form */}
      <input type="hidden" {...register('type')} value={currentType.rawName} />

      <div ref={containerRef} style={{ position: 'relative' }}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          style={{
            width: '100%',
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            backgroundColor: '#ffffff',
            border: open ? '1px solid var(--color-green-accent, #059669)' : '1px solid var(--color-border, #d1d5db)',
            borderRadius: 'var(--radius-md, 6px)',
            cursor: 'pointer',
            fontSize: '0.84rem',
            color: 'var(--color-text-primary)',
            outline: 'none',
            boxShadow: open ? '0 0 0 2px rgba(5, 150, 105, 0.15)' : 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            {renderIssueTypeIcon(currentType.rawName, 16)}
            <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
              {currentType.name}
            </span>
          </div>
          <ChevronDown size={14} style={{ color: 'var(--color-text-secondary)', flexShrink: 0, marginLeft: 6 }} />
        </button>

        {/* Custom Options Menu with Icons */}
        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              width: '100%',
              zIndex: 100,
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md, 6px)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              padding: '4px 0',
              maxHeight: 220,
              overflowY: 'auto',
            }}
          >
            {availableTypes.map((item) => {
              const isSelected = item.rawName.toUpperCase() === currentType.rawName.toUpperCase();
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--color-green-light, #ecfdf5)' : 'transparent',
                    color: isSelected ? 'var(--color-green-accent, #047857)' : 'var(--color-text-primary)',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {renderIssueTypeIcon(item.rawName, 16)}
                    <span>{item.name}</span>
                  </div>
                  {isSelected && <Check size={14} style={{ color: 'var(--color-green-accent, #047857)' }} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
