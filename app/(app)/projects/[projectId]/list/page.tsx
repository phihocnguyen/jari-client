import React from 'react';
import { IssueListContainer } from '@/components/issue/list/IssueListContainer';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export const metadata = {
  title: 'List - Jari',
  description: 'Manage and track project issues in Jira-style list view',
};

// ─── Server Component (SSR Shell) ─────────────────────────────────
export default async function ProjectListPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <IssueListContainer projectId={projectId} />
    </div>
  );
}
