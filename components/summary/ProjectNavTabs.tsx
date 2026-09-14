'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

export function ProjectNavTabs() {
  const pathname = usePathname();
  const params = useParams();
  const pId = (params?.projectId as string) || 'proj-demo-1';

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
      borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: '1.5rem',
      overflowX: 'auto', paddingBottom: 0, height: 42,
      boxSizing: 'border-box',
      scrollbarWidth: 'none',
    }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || (tab.href !== `/projects/${pId}/issues` && pathname.startsWith(`${tab.href}/`));

        return (
          <Link
            key={tab.label}
            href={tab.href}
            style={{
              height: 42,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? 'var(--color-green-brand)' : 'var(--color-text-secondary)',
              borderBottom: isActive ? '2px solid var(--color-green-accent)' : '2px solid transparent',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
              transition: 'color 0.15s ease, border-color 0.15s ease',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
