'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import type { Release } from '@/types/issue';
import { formatDisplayDateDMY, parentOptionStyle } from './sidebarUtils';
import { ReleaseModal } from './ReleaseModal';

interface ReleaseSelectorProps {
  releaseId?: string | null;
  releaseName?: string | null;
  projectReleases: Release[];
  onSetRelease: (releaseId: string | null) => void;
  onCreateRelease: (data: { name: string; description?: string; releaseDate?: string }) => Promise<Release>;
}

export function ReleaseSelector({
  releaseId,
  releaseName,
  projectReleases,
  onSetRelease,
  onCreateRelease,
}: ReleaseSelectorProps) {
  const [releaseMenuOpen, setReleaseMenuOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const releaseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (releaseRef.current && !releaseRef.current.contains(e.target as Node)) {
        setReleaseMenuOpen(false);
      }
    }
    if (releaseMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [releaseMenuOpen]);

  return (
    <>
      <div ref={releaseRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setReleaseMenuOpen((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            color: releaseId ? '#172b4d' : '#626f86',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: 4,
            textAlign: 'left',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {releaseName || 'None'}
        </button>

        {releaseMenuOpen && (
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
            <div style={{ maxHeight: 200, overflowY: 'auto', padding: '4px 0' }}>
              {releaseId && (
                <button
                  type="button"
                  onClick={() => {
                    onSetRelease(null);
                    setReleaseMenuOpen(false);
                  }}
                  style={parentOptionStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ color: '#626f86' }}>None (remove fix version)</span>
                </button>
              )}
              {projectReleases.map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => {
                    onSetRelease(rel.id);
                    setReleaseMenuOpen(false);
                  }}
                  style={parentOptionStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ color: '#172b4d', flex: 1, textAlign: 'left' }}>{rel.name}</span>
                  {rel.releaseDate && (
                    <span style={{ color: '#626f86', fontSize: '0.75rem' }}>
                      {formatDisplayDateDMY(rel.releaseDate)}
                    </span>
                  )}
                  {releaseId === rel.id && <Check size={13} color="#0c66e4" />}
                </button>
              ))}
              {projectReleases.length === 0 && (
                <div style={{ padding: '8px 12px', color: '#626f86', fontSize: '0.8125rem' }}>
                  No releases yet.
                </div>
              )}
            </div>
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: 6 }}>
              <button
                type="button"
                onClick={() => {
                  setReleaseMenuOpen(false);
                  setReleaseModalOpen(true);
                }}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  background: 'none',
                  border: 'none',
                  color: '#0c66e4',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                + Create release
              </button>
            </div>
          </div>
        )}
      </div>

      {releaseModalOpen && (
        <ReleaseModal
          onClose={() => setReleaseModalOpen(false)}
          onCreate={async (data) => {
            const rel = await onCreateRelease(data);
            onSetRelease(rel.id);
          }}
        />
      )}
    </>
  );
}
