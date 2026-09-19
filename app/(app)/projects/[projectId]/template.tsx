'use client';

import React from 'react';

// template.tsx re-mounts on every navigation within [projectId], unlike
// layout.tsx which persists. This triggers .animate-page-enter on all subpages.
export default function ProjectTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-page-enter" style={{ width: '100%', minHeight: '100%' }}>
      {children}
    </div>
  );
}
