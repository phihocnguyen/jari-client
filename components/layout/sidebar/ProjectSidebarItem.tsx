'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Star, Settings, Loader2 } from 'lucide-react';
import { useNavigationLoading } from '@/components/loading';
import type { Project } from '@/types/project';

interface ProjectSidebarItemProps {
  project: Project;
  isActive: boolean;
  collapsed: boolean;
  isStarred: boolean;
  onToggleStar: (e: React.MouseEvent) => void;
}

export function ProjectSidebarItem({
  project,
  isActive,
  collapsed,
  isStarred,
  onToggleStar,
}: ProjectSidebarItemProps) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { startNavigation } = useNavigationLoading();

  // Clear navigating state when route matches
  useEffect(() => {
    if (pathname.includes(`/projects/${project.id}`)) {
      setIsNavigating(false);
    }
  }, [pathname, project.id]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        marginInline: collapsed ? 0 : 6,
        marginBottom: 2,
        borderRadius: 8,
        backgroundColor: isActive
          ? 'rgba(0, 117, 74, 0.45)'
          : hovered
          ? 'rgba(255, 255, 255, 0.05)'
          : 'transparent',
        transition: 'background-color 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        position: 'relative',
      }}
    >
      {/* Active Indicator Bar */}
      {isActive && !collapsed && (
        <span
          style={{
            position: 'absolute',
            left: 8,
            top: 8,
            bottom: 8,
            width: 3,
            borderRadius: 2,
            backgroundColor: 'var(--color-green-accent)',
          }}
        />
      )}

      {/* Main Project Navigation Link (summary) */}
      <Link
        href={`/projects/${project.id}/summary`}
        title={project.name}
        onClick={() => {
          if (!isActive) {
            setIsNavigating(true);
            startNavigation(`Opening ${project.name}...`);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 8,
          minWidth: 0,
          flex: collapsed ? undefined : 1,
          padding: collapsed ? '6px 0' : '6px 6px 6px 24px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          textDecoration: 'none',
          width: collapsed ? '100%' : undefined,
        }}
      >
        <div
          style={{
            width: collapsed ? 24 : 20,
            height: collapsed ? 24 : 20,
            borderRadius: '50%',
            backgroundColor: project.avatarColor || '#EAB308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? '0.6875rem' : '0.625rem',
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {project.name.charAt(0).toUpperCase()}
        </div>

        {!collapsed && (
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: isActive ? 600 : 400,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {project.name}
          </span>
        )}

        {isNavigating && !collapsed && (
          <Loader2
            size={12}
            color="#6EE7B7"
            style={{
              animation: 'orbitSpin 0.7s linear infinite',
              flexShrink: 0,
              marginLeft: 'auto',
            }}
          />
        )}
      </Link>

      {/* Sibling Action Buttons (Never nested inside <a>) */}
      {!collapsed && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
            paddingRight: 8,
          }}
        >
          {(hovered || isStarred) && (
            <button
              type="button"
              onClick={onToggleStar}
              title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
              style={{
                background: 'none',
                border: 'none',
                padding: 2,
                cursor: 'pointer',
                color: isStarred ? '#FBBF24' : 'rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
              }}
            >
              <Star size={12} fill={isStarred ? '#FBBF24' : 'none'} />
            </button>
          )}

          {hovered && (
            <Link
              href={`/projects/${project.id}/settings`}
              title="Space settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: 2,
                borderRadius: 4,
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
            >
              <Settings size={12} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
