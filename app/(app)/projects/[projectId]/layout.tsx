'use client';

import React, { Suspense } from 'react';
import ProjectLoading from './loading';

interface ProjectLayoutProps {
  children: React.ReactNode;
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <div style={{ width: '100%', minHeight: '60vh' }}>
      <Suspense fallback={<ProjectLoading />}>
        {children}
      </Suspense>
    </div>
  );
}
