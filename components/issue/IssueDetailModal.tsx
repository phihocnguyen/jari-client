'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Issue } from '@/types/issue';
import { TaskDetailView } from './detail/TaskDetailView';

export interface IssueDetailModalProps {
  issueId: string | null;
  projectId: string;
  onClose: () => void;
  issues?: Issue[];
  onNavigateIssue?: (issueId: string) => void;
  initialViewMode?: 'modal' | 'right-bar';
}

export function IssueDetailModal({
  issueId,
  projectId,
  onClose,
  issues = [],
  onNavigateIssue,
  initialViewMode,
}: IssueDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'modal' | 'right-bar'>('right-bar');
  const [rightBarWidth, setRightBarWidth] = useState(580);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(580);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jari-task-detail-view-mode') as 'modal' | 'right-bar' | null;
      if (initialViewMode) {
        setViewMode(initialViewMode);
      } else if (saved === 'modal' || saved === 'right-bar') {
        setViewMode(saved);
      }
    }
  }, [initialViewMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && issueId) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [issueId, onClose]);

  useEffect(() => {
    if (!issueId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [issueId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = startXRef.current - e.clientX;
      const newWidth = Math.min(Math.max(startWidthRef.current + deltaX, 420), window.innerWidth * 0.85);
      setRightBarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const toggleViewMode = () => {
    const nextMode = viewMode === 'modal' ? 'right-bar' : 'modal';
    setViewMode(nextMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jari-task-detail-view-mode', nextMode);
    }
  };

  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = rightBarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  if (!issueId || !mounted) return null;

  const backdrop = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 30, 66, 0.49)',
        backdropFilter: 'blur(2px)',
        zIndex: 150,
      }}
      onClick={onClose}
      aria-hidden="true"
    />
  );

  if (viewMode === 'modal') {
    return createPortal(
      <>
        {backdrop}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 151,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '92vw',
              maxWidth: 1060,
              height: '88vh',
              maxHeight: 880,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.22)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <TaskDetailView
              issueId={issueId}
              projectId={projectId}
              viewMode="modal"
              onToggleViewMode={toggleViewMode}
              onClose={onClose}
              issues={issues}
              onNavigateIssue={onNavigateIssue}
            />
          </div>
        </div>
      </>,
      document.body,
    );
  }

  return createPortal(
    <>
      {backdrop}
      <style>{`
        @keyframes slideInRightBar {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: rightBarWidth,
          maxWidth: '95vw',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.08)',
          zIndex: 151,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRightBar 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <div
          onMouseDown={handleStartResize}
          title="Drag to resize / slide right bar"
          style={{
            position: 'absolute',
            left: -3,
            top: 0,
            bottom: 0,
            width: 6,
            cursor: 'col-resize',
            zIndex: 10,
            backgroundColor: 'transparent',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0c66e4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        />

        <TaskDetailView
          issueId={issueId}
          projectId={projectId}
          viewMode="right-bar"
          onToggleViewMode={toggleViewMode}
          onClose={onClose}
          issues={issues}
          onNavigateIssue={onNavigateIssue}
        />
      </div>
    </>,
    document.body,
  );
}
