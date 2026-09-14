'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

interface ProjectNavTabsProps {
  projectId: string;
}

export function ProjectNavTabs({ projectId }: ProjectNavTabsProps) {
  const pathname = usePathname();
  const pId = projectId || 'proj-demo-1';

  const tabs = [
    { label: 'Summary', href: `/projects/${pId}/summary` },
    { label: 'Backlog', href: `/projects/${pId}/backlog` },
    { label: 'Board', href: `/projects/${pId}/board` },
    { label: 'List', href: `/projects/${pId}/issues` },
    { label: 'Reports', href: `/projects/${pId}/reports` },
    { label: 'Components', href: `/projects/${pId}/components` },
    { label: 'Code', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Releases', href: `/projects/${pId}/releases` },
    { label: 'Issues', href: `/projects/${pId}/issues` },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: '1.5rem',
      overflowX: 'auto', paddingBottom: 2,
    }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.label}
            href={tab.href}
            style={{
              padding: '8px 14px',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-green-brand)' : 'var(--color-text-secondary)',
              borderBottom: isActive ? '2px solid var(--color-green-accent)' : '2px solid transparent',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '8px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        6 more <Plus size={14} />
      </span>
    </div>
  );
}
