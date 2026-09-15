'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface TaskDescriptionProps {
  description?: string;
  onUpdateDescription: (newDesc: string) => void;
  isUpdating: boolean;
}

export function TaskDescription({
  description = '',
  onUpdateDescription,
  isUpdating,
}: TaskDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(description);

  useEffect(() => {
    setValue(description || '');
  }, [description]);

  const handleSave = () => {
    onUpdateDescription(value);
    setIsEditing(false);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#44546f', marginBottom: 8 }}>
        Description
      </h3>

      {isEditing ? (
        <div>
          <textarea
            rows={4}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add a description..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '2px solid #0c66e4',
              fontSize: '0.875rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical',
              color: '#172b4d',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button size="sm" onClick={handleSave} loading={isUpdating}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          title="Click to add description"
          style={{
            padding: '10px 12px',
            borderRadius: 6,
            backgroundColor: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            color: description ? '#172b4d' : '#626f86',
            whiteSpace: 'pre-wrap',
            minHeight: 44,
            lineHeight: 1.5,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f2f4';
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          {description || 'Add a description...'}
        </div>
      )}
    </div>
  );
}
