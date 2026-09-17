'use client';

import React from 'react';
import {
  UserCheck,
  RefreshCw,
  MessageSquare,
  Clock,
  Rocket,
  CheckCircle2,
  UserPlus,
  Bell,
  Check,
} from 'lucide-react';
import { notificationTitle } from '@/utils/notification';
import { timeAgo } from '@/utils/date';
import type { Notification, NotificationType } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onMarkRead?: (e: React.MouseEvent) => void;
}

interface TypeMeta {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

const TYPE_METAS: Record<NotificationType, TypeMeta> = {
  ISSUE_ASSIGNED: {
    icon: UserCheck,
    iconColor: '#7C3AED', // Violet
    bgColor: '#F5F3FF',
  },
  ISSUE_UPDATED: {
    icon: RefreshCw,
    iconColor: '#0284C7', // Sky
    bgColor: '#F0F9FF',
  },
  ISSUE_COMMENTED: {
    icon: MessageSquare,
    iconColor: '#2563EB', // Blue
    bgColor: '#EFF6FF',
  },
  ISSUE_DUE_SOON: {
    icon: Clock,
    iconColor: '#D97706', // Amber
    bgColor: '#FFFBEB',
  },
  SPRINT_STARTED: {
    icon: Rocket,
    iconColor: '#059669', // Emerald
    bgColor: '#ECFDF5',
  },
  SPRINT_COMPLETED: {
    icon: CheckCircle2,
    iconColor: '#16A34A', // Green
    bgColor: '#F0FDF4',
  },
  MEMBER_INVITED: {
    icon: UserPlus,
    iconColor: '#00754A', // Brand green
    bgColor: '#EBF5F0',
  },
};

export function NotificationItem({ notification, onClick, onMarkRead }: NotificationItemProps) {
  const meta = TYPE_METAS[notification.type] || {
    icon: Bell,
    iconColor: '#64748B',
    bgColor: '#F8FAFC',
  };
  const IconComponent = meta.icon;
  const isUnread = !notification.read;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 16px',
        cursor: 'pointer',
        backgroundColor: isUnread ? 'rgba(0, 117, 74, 0.04)' : '#ffffff',
        borderLeft: isUnread ? '3px solid var(--color-green-accent)' : '3px solid transparent',
        borderBottom: '1px solid #F1F5F9',
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isUnread
          ? 'rgba(0, 117, 74, 0.08)'
          : '#F8FAFC';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isUnread
          ? 'rgba(0, 117, 74, 0.04)'
          : '#ffffff';
      }}
    >
      {/* Type Icon Badge */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          backgroundColor: meta.bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: meta.iconColor,
          flexShrink: 0,
          marginTop: 1,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <IconComponent size={17} />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header Row: Category / Title + Relative Time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: isUnread ? 700 : 600,
              color: isUnread ? 'var(--color-text-primary)' : '#475569',
              letterSpacing: '-0.01em',
            }}
          >
            {notificationTitle(notification.type)}
          </span>

          <span
            style={{
              fontSize: '0.6875rem',
              color: '#94A3B8',
              flexShrink: 0,
              fontWeight: 500,
            }}
          >
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        {/* Message Body */}
        <div
          style={{
            fontSize: '0.8125rem',
            lineHeight: 1.45,
            color: isUnread ? '#1E293B' : '#64748B',
            marginBottom: 6,
            wordBreak: 'break-word',
          }}
        >
          {notification.message}
        </div>

        {/* Footer Tags: Issue Key, Project Name, Workspace */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {notification.issueKey && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--color-green-brand)',
                backgroundColor: 'rgba(0, 117, 74, 0.08)',
                padding: '2px 6px',
                borderRadius: 4,
                letterSpacing: '0.02em',
              }}
            >
              {notification.issueKey}
            </span>
          )}

          {notification.projectName && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 500,
                color: '#64748B',
                backgroundColor: '#F1F5F9',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              {notification.projectName}
            </span>
          )}

          {notification.workspaceName && !notification.projectName && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 500,
                color: '#64748B',
                backgroundColor: '#F1F5F9',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              {notification.workspaceName}
            </span>
          )}
        </div>
      </div>

      {/* Unread indicator dot & Mark as read action */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
          marginLeft: 4,
          marginTop: 4,
        }}
      >
        {isUnread ? (
          <div
            title="Unread"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--color-green-accent)',
              boxShadow: '0 0 0 2px rgba(0, 117, 74, 0.2)',
            }}
          />
        ) : null}

        {onMarkRead && isUnread && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(e);
            }}
            title="Mark as read"
            style={{
              background: 'none',
              border: 'none',
              padding: 2,
              cursor: 'pointer',
              color: '#94A3B8',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-green-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            <Check size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
