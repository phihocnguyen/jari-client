'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { DevelopmentType } from '@/types/development';

interface LinkDevModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: DevelopmentType;
    title: string;
    url: string;
    status?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function LinkDevModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: LinkDevModalProps) {
  const [devType, setDevType] = useState<DevelopmentType>('COMMIT');
  const [devTitle, setDevTitle] = useState('');
  const [devUrl, setDevUrl] = useState('');
  const [devStatus, setDevStatus] = useState('OPEN');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devTitle.trim() || !devUrl.trim()) {
      toast.error('Title and URL are required');
      return;
    }
    await onSubmit({
      type: devType,
      title: devTitle.trim(),
      url: devUrl.trim(),
      status: devType === 'PULL_REQUEST' ? devStatus : undefined,
    });
    setDevTitle('');
    setDevUrl('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 30, 66, 0.54)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 10,
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: '#172b4d' }}>
            Link development item
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#626f86', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#44546f', marginBottom: 6 }}>
              Item Type
            </label>
            <select
              value={devType}
              onChange={(e) => setDevType(e.target.value as DevelopmentType)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.15)',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="COMMIT">Commit</option>
              <option value="PULL_REQUEST">Pull Request</option>
              <option value="BRANCH">Branch</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#44546f', marginBottom: 6 }}>
              Title / Name <span style={{ color: '#de350b' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder={
                devType === 'COMMIT'
                  ? 'e.g. feat(auth): add OAuth2 handler'
                  : devType === 'BRANCH'
                  ? 'feature/jari-auth'
                  : '#14 Add user profile'
              }
              value={devTitle}
              onChange={(e) => setDevTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.15)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#44546f', marginBottom: 6 }}>
              URL <span style={{ color: '#de350b' }}>*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://github.com/phihocnguyen/jari/pull/1"
              value={devUrl}
              onChange={(e) => setDevUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.15)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          {devType === 'PULL_REQUEST' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#44546f', marginBottom: 6 }}>
                Status
              </label>
              <select
                value={devStatus}
                onChange={(e) => setDevStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid rgba(0,0,0,0.15)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="OPEN">Open</option>
                <option value="MERGED">Merged</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Link item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
