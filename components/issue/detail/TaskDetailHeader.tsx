'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  ChevronUp,
  ChevronDown,
  Lock,
  Eye,
  Share2,
  MoreHorizontal,
  ExternalLink,
  Maximize2,
  PanelRightClose,
  Trash2,
  Plus,
  CheckSquare,
  Bookmark,
  AlertCircle,
  Zap,
  GitFork,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import type { Issue, IssueType } from '@/types/issue';

interface TaskDetailHeaderProps {
  issue: Issue;
  projectId: string;
  viewMode: 'modal' | 'right-bar';
  onToggleViewMode: () => void;
  onClose: () => void;
  prevIssue: Issue | null;
  nextIssue: Issue | null;
  onNavigateIssue?: (issueId: string) => void;
  onDeleteIssue: () => void;
}

export function TaskDetailHeader({
  issue,
  projectId,
  viewMode,
  onToggleViewMode,
  onClose,
  prevIssue,
  nextIssue,
  onNavigateIssue,
  onDeleteIssue,
}: TaskDetailHeaderProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [watchersCount, setWatchersCount] = useState(1);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleShare = () => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/projects/${projectId}/issues/${issue.id}`
      : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const getTypeIcon = (type?: IssueType) => {
    switch (type) {
      case 'EPIC':
        return <Zap size={16} color="#9333ea" fill="#9333ea" />;
      case 'STORY':
        return <Bookmark size={16} color="#16a34a" fill="#16a34a" />;
      case 'BUG':
        return <AlertCircle size={16} color="#dc2626" />;
      case 'SUBTASK':
        return <GitFork size={15} color="#0284c7" />;
      case 'TASK':
      default:
        return <CheckSquare size={16} color="#2563eb" />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: viewMode === 'modal' ? '12px 24px' : '10px 16px',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Left: Breadcrumb / Work item label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {viewMode === 'right-bar' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#44546f', fontWeight: 500, fontSize: '0.8125rem' }}>
            <CheckSquare size={16} color="#0c66e4" />
            <span>Jari work item</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#626f86', fontSize: '0.8125rem' }}>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: '#626f86',
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Plus size={14} />
              <span>Add epic</span>
            </button>
            <span>/</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#172b4d' }}>
              {getTypeIcon(issue.type)}
              <Link
                href={`/projects/${projectId}/issues/${issue.key}`}
                title="Open full page"
                style={{ color: '#172b4d', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                {issue.key}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Previous Issue */}
        <button
          type="button"
          disabled={!prevIssue}
          onClick={() => prevIssue && onNavigateIssue?.(prevIssue.id)}
          title={prevIssue ? `Previous issue: ${prevIssue.key}` : 'No previous issue'}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 4,
            padding: 6,
            cursor: prevIssue ? 'pointer' : 'default',
            color: prevIssue ? '#44546f' : '#b3b9c4',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => prevIssue && (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ChevronUp size={18} />
        </button>

        {/* Next Issue */}
        <button
          type="button"
          disabled={!nextIssue}
          onClick={() => nextIssue && onNavigateIssue?.(nextIssue.id)}
          title={nextIssue ? `Next issue: ${nextIssue.key}` : 'No next issue'}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 4,
            padding: 6,
            cursor: nextIssue ? 'pointer' : 'default',
            color: nextIssue ? '#44546f' : '#b3b9c4',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => nextIssue && (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ChevronDown size={18} />
        </button>

        {/* Padlock Icon */}
        <button
          type="button"
          title="Restricted access"
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 4,
            padding: 6,
            cursor: 'pointer',
            color: '#44546f',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Lock size={16} />
        </button>

        {/* Watchers Eye Button */}
        <button
          type="button"
          onClick={() => {
            setIsWatching(!isWatching);
            setWatchersCount((prev) => (isWatching ? prev - 1 : prev + 1));
            toast.success(isWatching ? 'Stopped watching issue' : 'You are now watching this issue');
          }}
          title="Watchers"
          style={{
            background: isWatching ? '#e9f2ff' : 'transparent',
            border: 'none',
            borderRadius: 4,
            padding: '4px 8px',
            cursor: 'pointer',
            color: isWatching ? '#0c66e4' : '#44546f',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isWatching ? '#dbe8fc' : '#f1f2f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isWatching ? '#e9f2ff' : 'transparent')}
        >
          <Eye size={15} />
          <span>{watchersCount}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          title="Share issue link"
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 4,
            padding: 6,
            cursor: 'pointer',
            color: '#44546f',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Share2 size={16} />
        </button>

        {/* More Menu Dropdown (...) */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            title="More actions"
            style={{
              background: moreMenuOpen ? '#f1f2f4' : 'transparent',
              border: 'none',
              borderRadius: 4,
              padding: 6,
              cursor: 'pointer',
              color: '#44546f',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
            onMouseLeave={(e) => !moreMenuOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <MoreHorizontal size={16} />
          </button>

          {moreMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: 4,
                backgroundColor: '#ffffff',
                borderRadius: 6,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                border: '1px solid rgba(0,0,0,0.1)',
                padding: '4px 0',
                minWidth: 160,
                zIndex: 30,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMoreMenuOpen(false);
                  navigator.clipboard?.writeText(issue.key);
                  toast.success(`Copied key ${issue.key}`);
                }}
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  color: '#172b4d',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Copy issue key
              </button>
              <button
                type="button"
                onClick={() => {
                  setMoreMenuOpen(false);
                  handleShare();
                }}
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  color: '#172b4d',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Copy link
              </button>
              <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.08)', margin: '4px 0' }} />
              <button
                type="button"
                onClick={() => {
                  setMoreMenuOpen(false);
                  if (window.confirm('Are you sure you want to delete this issue?')) {
                    onDeleteIssue();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  color: '#c82014',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffebe6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Trash2 size={14} />
                <span>Delete issue</span>
              </button>
            </div>
          )}
        </div>

        {/* Popout to Standalone URL */}
        <Link
          href={`/projects/${projectId}/issues/${issue.id}`}
          title="Open in full page"
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 4,
            padding: 6,
            color: '#44546f',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ExternalLink size={16} />
        </Link>

        {/* Toggle Full-size Modal vs Right Bar */}
        <button
          type="button"
          onClick={onToggleViewMode}
          title={viewMode === 'modal' ? 'Dock to right bar (Side panel)' : 'Full size (Expand to modal)'}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 4,
            padding: 6,
            cursor: 'pointer',
            color: '#44546f',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {viewMode === 'modal' ? <PanelRightClose size={17} /> : <Maximize2 size={16} />}
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          title="Close"
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 4,
            padding: 6,
            cursor: 'pointer',
            color: '#44546f',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
