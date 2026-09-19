import React from 'react';
import { IssueListContainer } from '@/components/issue/list/IssueListContainer';

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ component?: string }>;
}

export const metadata = {
  title: 'List - Jari',
  description: 'Manage and track project issues in Jira-style list view',
};

// ─── Server Component (SSR Shell) ─────────────────────────────────
export default async function ProjectListPage({ params, searchParams }: PageProps) {
  const { projectId } = await params;
  const sParams = searchParams ? await searchParams : undefined;
  const initialComponent = sParams?.component;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <IssueListContainer projectId={projectId} initialComponent={initialComponent} />
    </div>
  );
}
