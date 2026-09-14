'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ProjectNavTabsProps {
  projectId: string;
}

export function ProjectNavTabs({ projectId }: ProjectNavTabsProps) {
  const pathname = usePathname();
  const pId = projectId || 'proj-demo-1';

  const tabs = [
    { label: 'Summary',    href: `/projects/${pId}/summary` },
    { label: 'Board',      href: `/projects/${pId}/board` },
    { label: 'Backlog',    href: `/projects/${pId}/backlog` },
    { label: 'Issues',     href: `/projects/${pId}/issues` },
    { label: 'Sprints',    href: `/projects/${pId}/sprints` },
    { label: 'Reports',    href: `/projects/${pId}/reports` },
    { label: 'Releases',   href: `/projects/${pId}/releases` },
    { label: 'Components', href: `/projects/${pId}/components` },
    { label: 'Settings',   href: `/projects/${pId}/settings` },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.25rem',
      borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: '1.25rem',
      overflowX: 'auto', paddingBottom: 0,
    }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.label}
            href={tab.href}
            style={{
              padding: '10px 16px',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--color-green-brand)' : 'var(--color-text-secondary)',
              borderBottom: isActive ? '2px solid var(--color-green-accent)' : '2px solid transparent',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-fast)',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
