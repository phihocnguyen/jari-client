'use client';

import React from 'react';

interface ProjectLayoutProps {
  children: React.ReactNode;
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <div style={{ width: '100%', minHeight: '60vh' }}>
      {children}
    </div>
  );
}
