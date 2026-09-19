'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ReleaseModalProps {
  onClose: () => void;
  onCreate: (data: { name: string; description?: string; releaseDate?: string }) => Promise<void>;
}

export function ReleaseModal({ onClose, onCreate }: ReleaseModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        releaseDate: releaseDate || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 30, 66, 0.54)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          boxShadow: '0 20px 32px rgba(0,0,0,0.3)',
          padding: 20,
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#172b4d', margin: 0, marginBottom: 14 }}>
          Create release
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: '0.8125rem', color: '#44546f', fontWeight: 500 }}>
            Name (version)
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. v1.0.0"
              style={{
                width: '100%',
                marginTop: 4,
                border: '1px solid rgba(0,0,0,0.14)',
                borderRadius: 4,
                padding: '7px 10px',
                fontSize: '0.8125rem',
                outline: 'none',
                color: '#172b4d',
              }}
            />
          </label>

          <label style={{ fontSize: '0.8125rem', color: '#44546f', fontWeight: 500 }}>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What's in this release?"
              style={{
                width: '100%',
                marginTop: 4,
                border: '1px solid rgba(0,0,0,0.14)',
                borderRadius: 4,
                padding: '7px 10px',
                fontSize: '0.8125rem',
                outline: 'none',
                color: '#172b4d',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </label>

          <label style={{ fontSize: '0.8125rem', color: '#44546f', fontWeight: 500 }}>
            Release date
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                border: '1px solid rgba(0,0,0,0.14)',
                borderRadius: 4,
                padding: '6px 10px',
                fontSize: '0.8125rem',
                color: '#172b4d',
              }}
            />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={!name.trim()} loading={saving} onClick={handleSubmit}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
