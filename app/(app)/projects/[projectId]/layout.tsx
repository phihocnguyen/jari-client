import React from 'react';
import { ProjectSummaryHeader } from '@/components/summary/ProjectSummaryHeader';
import { ProjectNavTabs } from '@/components/summary/ProjectNavTabs';

interface ProjectLayoutProps {
  children: React.ReactNode;
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* 1. Project Header (SSR / Shell) */}
      <ProjectSummaryHeader projectName="Teams in Space" />

      {/* 2. Project Navigation Tabs */}
      <ProjectNavTabs />

      {/* 3. Sub-page Content (Renders directly below tabs) */}
      <div style={{ width: '100%', minHeight: '60vh' }}>
        {children}
      </div>
    </div>
  );
}
