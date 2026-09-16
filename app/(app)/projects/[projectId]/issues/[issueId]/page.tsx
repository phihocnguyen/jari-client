'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskDetailView } from '@/components/issue/detail/TaskDetailView';

interface PageProps {
  params: Promise<{ projectId: string; issueId: string }>;
}

export default function IssueDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string; issueId: string } | null>(null);

  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  const projectId = resolvedParams?.projectId ?? '';
  const issueId = resolvedParams?.issueId ?? '';

  if (!projectId || !issueId) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#626f86' }}>
        <div
          style={{
            display: 'inline-block',
            width: 24,
            height: 24,
            border: '2px solid rgba(0,0,0,0.1)',
            borderTopColor: '#0c66e4',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: 8,
          }}
        />
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <TaskDetailView
        issueId={issueId}
        projectId={projectId}
        viewMode="full-page"
        onClose={() => router.push(`/projects/${projectId}/backlog`)}
      />
    </div>
  );
}
