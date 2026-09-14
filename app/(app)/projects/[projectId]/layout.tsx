import React from 'react';
import { ProjectSummaryHeader } from '@/components/summary/ProjectSummaryHeader';
import { ProjectNavTabs } from '@/components/summary/ProjectNavTabs';

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const resolvedParams = await params;
  const projectId = resolvedParams?.projectId ?? 'proj-demo-1';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* 1. Project Header */}
      <ProjectSummaryHeader projectName="Teams in Space" />

      {/* 2. Project Navigation Tabs */}
      <ProjectNavTabs projectId={projectId} />

      {/* 3. Sub-page Content (Renders directly below tabs) */}
      <div>
        {children}
      </div>
    </div>
  );
}
