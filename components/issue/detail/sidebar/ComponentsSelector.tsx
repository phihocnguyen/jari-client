'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { ProjectComponent } from '@/types/component';

interface ComponentsSelectorProps {
  selectedComponents?: ProjectComponent[];
  projectComponents: ProjectComponent[];
  onSetComponents?: (componentIds: string[]) => void;
}

export function ComponentsSelector({
  selectedComponents = [],
  projectComponents,
  onSetComponents,
}: ComponentsSelectorProps) {
  const [componentMenuOpen, setComponentMenuOpen] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (componentRef.current && !componentRef.current.contains(e.target as Node)) {
        setComponentMenuOpen(false);
      }
    }
    if (componentMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [componentMenuOpen]);

  const handleRemove = (cId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = selectedComponents.filter((x) => x.id !== cId);
    onSetComponents?.(updated.map((x) => x.id));
  };

  const handleToggle = (c: ProjectComponent) => {
    const exists = selectedComponents.some((x) => x.id === c.id);
    const updated = exists
      ? selectedComponents.filter((x) => x.id !== c.id)
      : [...selectedComponents, c];
    onSetComponents?.(updated.map((x) => x.id));
  };

  return (
    <div ref={componentRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
        {selectedComponents.length > 0 ? (
          selectedComponents.map((c) => (
            <span
              key={c.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '1px 8px',
                borderRadius: 10,
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: '#e9f2ff',
                color: '#0c66e4',
              }}
            >
              {c.name}
              <X
                size={11}
                style={{ cursor: 'pointer' }}
                onClick={(e) => handleRemove(c.id, e)}
              />
            </span>
          ))
        ) : (
          <button
            type="button"
            onClick={() => setComponentMenuOpen((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              color: '#626f86',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            None
          </button>
        )}

        {selectedComponents.length > 0 && (
          <button
            type="button"
            onClick={() => setComponentMenuOpen((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              color: '#0c66e4',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '2px 4px',
            }}
          >
            + Add
          </button>
        )}
      </div>

      {componentMenuOpen && (
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
            maxHeight: 200,
            overflowY: 'auto',
            padding: '4px 0',
          }}
        >
          {projectComponents.map((c) => {
            const isAttached = selectedComponents.some((ic) => ic.id === c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleToggle(c)}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ color: '#172b4d', fontWeight: 500 }}>{c.name}</span>
                {isAttached && <Check size={13} color="#0c66e4" />}
              </button>
            );
          })}
          {projectComponents.length === 0 && (
            <div style={{ padding: '8px 12px', color: '#626f86', fontSize: '0.8125rem' }}>
              No components defined in project.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
