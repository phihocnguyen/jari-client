'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TaskAiModalProps {
  open: boolean;
  issueTitle: string;
  onClose: () => void;
  onApplyCriteria: () => void;
}

export function TaskAiModal({
  open,
  issueTitle,
  onClose,
  onApplyCriteria,
}: TaskAiModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '90%',
          maxWidth: 500,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          padding: 24,
          boxShadow: '0 20px 48px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Sparkles size={20} color="#0c66e4" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>AI Task Assistant</h3>
        </div>
        <p style={{ color: '#44546f', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: 16 }}>
          Suggested improvements for <strong>{issueTitle}</strong>:
        </p>
        <ul style={{ paddingLeft: 20, color: '#172b4d', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 20 }}>
          <li>Define clear acceptance criteria under the Description.</li>
          <li>Break down technical steps into 2-3 subtasks for better tracking.</li>
          <li>Assign estimated story points and due date to keep the sprint timeline accurate.</li>
        </ul>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Dismiss
          </Button>
          <Button size="sm" onClick={onApplyCriteria}>
            Apply Criteria Template
          </Button>
        </div>
      </div>
    </div>
  );
}
