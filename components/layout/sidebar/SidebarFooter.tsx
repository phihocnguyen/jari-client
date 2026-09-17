'use client';

import Link from 'next/link';
import { HelpCircle, Settings } from 'lucide-react';
import type { Workspace } from '@/types/workspace';

interface SidebarFooterProps {
  collapsed: boolean;
  workspaces: Workspace[];
  onOpenShortcuts: () => void;
}

export function SidebarFooter({ collapsed, workspaces, onOpenShortcuts }: SidebarFooterProps) {
  return (
    <div
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
        padding: collapsed ? '8px' : '8px 12px',
        flexShrink: 0,
      }}
    >
      {!collapsed ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Keyboard Shortcuts Dialog Trigger */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 4,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)')}
          >
            <HelpCircle size={14} />
            <span>Shortcuts</span>
          </button>

          {/* Workspace Settings Link */}
          {workspaces[0] && (
            <Link
              href={`/workspaces/${workspaces[0].id}/settings`}
              title="Workspace Settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: '0.75rem',
                textDecoration: 'none',
                padding: '4px 6px',
                borderRadius: 4,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)')}
            >
              <Settings size={14} />
              <span>Settings</span>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.65)',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HelpCircle size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
