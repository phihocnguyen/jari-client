'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { IssueLabel } from '@/types/issue';
import { labelChipStyle } from './sidebarUtils';

interface LabelsSelectorProps {
  labels?: IssueLabel[];
  projectLabels: IssueLabel[];
  onSetLabels: (labelIds: string[]) => void;
  onCreateLabel: (name: string) => Promise<IssueLabel>;
}

export function LabelsSelector({
  labels = [],
  projectLabels,
  onSetLabels,
  onCreateLabel,
}: LabelsSelectorProps) {
  const [labelsMenuOpen, setLabelsMenuOpen] = useState(false);
  const [labelInput, setLabelInput] = useState('');
  const [savingLabel, setSavingLabel] = useState(false);
  const labelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (labelsRef.current && !labelsRef.current.contains(e.target as Node)) {
        setLabelsMenuOpen(false);
        setLabelInput('');
      }
    }
    if (labelsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [labelsMenuOpen]);

  const currentLabelIds = labels.map((l) => l.id);
  const isLabelAttached = (id: string) => currentLabelIds.includes(id);

  const toggleLabel = (label: IssueLabel) => {
    const nextIds = isLabelAttached(label.id)
      ? currentLabelIds.filter((id) => id !== label.id)
      : [...currentLabelIds, label.id];
    onSetLabels(nextIds);
  };

  const handleLabelEnter = async () => {
    const name = labelInput.trim();
    if (!name || savingLabel) return;
    setSavingLabel(true);
    try {
      const existing = projectLabels.find(
        (l) => l.name.toLowerCase() === name.toLowerCase()
      );
      const label = existing ?? (await onCreateLabel(name));
      if (!isLabelAttached(label.id)) {
        onSetLabels([...currentLabelIds, label.id]);
      }
      setLabelInput('');
    } finally {
      setSavingLabel(false);
    }
  };

  return (
    <div ref={labelsRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {labels.map((l) => (
          <span
            key={l.id}
            style={{
              ...labelChipStyle(l.color),
              paddingRight: 4,
            }}
            title="Click to remove"
            onClick={() => toggleLabel(l)}
          >
            {l.name}
            <X size={11} />
          </span>
        ))}
        <button
          type="button"
          onClick={() => setLabelsMenuOpen((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            color: labels.length === 0 ? '#626f86' : '#0c66e4',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: 4,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {labelsMenuOpen ? 'Close' : labels.length === 0 ? 'Add labels' : '+ Add'}
        </button>
      </div>

      {labelsMenuOpen && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: 260,
            top: '100%',
            marginTop: 4,
            backgroundColor: '#ffffff',
            borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
            border: '1px solid rgba(0,0,0,0.12)',
            zIndex: 100,
          }}
        >
          <div style={{ padding: 8, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <input
              autoFocus
              value={labelInput}
              disabled={savingLabel}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLabelEnter();
                }
              }}
              placeholder="Type a label and press Enter..."
              style={{
                width: '100%',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 4,
                padding: '5px 8px',
                fontSize: '0.8125rem',
                outline: 'none',
                color: '#172b4d',
              }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', padding: '4px 0' }}>
            {projectLabels.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => toggleLabel(l)}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={labelChipStyle(l.color)}>{l.name}</span>
                {isLabelAttached(l.id) && <Check size={13} color="#0c66e4" />}
              </button>
            ))}
            {projectLabels.length === 0 && (
              <div style={{ padding: '8px 12px', color: '#626f86', fontSize: '0.8125rem' }}>
                Type above to create the first label.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
