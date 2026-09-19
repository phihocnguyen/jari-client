'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, X } from 'lucide-react';
import { presenceApi } from '@/lib/api/presence';
import { wsClient } from '@/lib/websocket/client';
import type { OnlineUser } from '@/types/presence';
import { Avatar } from '@/components/ui/Avatar';

interface ProjectPresenceAvatarsProps {
  projectId: string;
}

export function ProjectPresenceAvatars({ projectId }: ProjectPresenceAvatarsProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!projectId) return;

    // 1. Initial fetch
    presenceApi.getOnlineUsers(projectId)
      .then((data) => setOnlineUsers(data))
      .catch((err) => console.error('Failed to get online users:', err));

    // 2. Initial heartbeat
    presenceApi.heartbeat(projectId).catch(() => {});

    // 3. Periodic heartbeat every 25s
    const heartbeatInterval = setInterval(() => {
      presenceApi.heartbeat(projectId).catch(() => {});
    }, 25000);

    // 4. Subscribe to live presence topic over STOMP
    const unsubscribe = wsClient.subscribeTopic(
      `/topic/projects/${projectId}/presence`,
      (users: OnlineUser[]) => {
        if (Array.isArray(users)) {
          setOnlineUsers(users);
        }
      }
    );

    return () => {
      clearInterval(heartbeatInterval);
      unsubscribe();
      presenceApi.leave(projectId).catch(() => {});
    };
  }, [projectId]);

  // Click outside to close popover
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [popoverOpen]);

  if (!projectId) return null;

  const maxVisible = 4;
  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const extraCount = onlineUsers.length - maxVisible;

  return (
    <div ref={popoverRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => setPopoverOpen(!popoverOpen)}
        title={`${onlineUsers.length} user${onlineUsers.length === 1 ? '' : 's'} viewing this project`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 8px',
          borderRadius: 20,
          border: '1px solid rgba(0,0,0,0.1)',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
      >
        {/* Pulsing Live Dot */}
        <span
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 8,
            height: 8,
          }}
        >
          <span
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: '#36b37e',
              opacity: 0.75,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#36b37e',
            }}
          />
        </span>

        {/* Stacked Avatars */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {visibleUsers.map((u, idx) => (
            <div
              key={u.userId}
              style={{
                marginLeft: idx > 0 ? -6 : 0,
                border: '2px solid #ffffff',
                borderRadius: '50%',
                overflow: 'hidden',
              }}
            >
              <Avatar name={u.displayName} size={22} />
            </div>
          ))}
          {extraCount > 0 && (
            <div
              style={{
                marginLeft: -6,
                border: '2px solid #ffffff',
                borderRadius: '50%',
                backgroundColor: '#f1f2f4',
                color: '#44546f',
                fontSize: '0.625rem',
                fontWeight: 700,
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              +{extraCount}
            </div>
          )}
        </div>

        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#44546f', marginLeft: 2 }}>
          {onlineUsers.length} online
        </span>
      </button>

      {/* Popover showing viewer list */}
      {popoverOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 8,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            border: '1px solid rgba(0,0,0,0.1)',
            padding: 12,
            minWidth: 240,
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              paddingBottom: 6,
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} color="#0c66e4" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#172b4d' }}>
                Viewing this project ({onlineUsers.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPopoverOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#626f86', padding: 2 }}
            >
              <X size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
            {onlineUsers.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#626f86', padding: '6px 0' }}>
                Connecting to live presence...
              </div>
            ) : (
              onlineUsers.map((u) => (
                <div
                  key={u.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar name={u.displayName} size={24} />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: -1,
                          right: -1,
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: '#36b37e',
                          border: '1.5px solid #ffffff',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        color: '#172b4d',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {u.displayName}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: '#006644',
                      backgroundColor: '#e3fcef',
                      padding: '1px 6px',
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                  >
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
