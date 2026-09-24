'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '@/lib/api/workspace';
import { projectApi } from '@/lib/api/project';
import { issueApi } from '@/lib/api/issue';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardProjects } from '@/components/dashboard/DashboardProjects';
import { DashboardWorkspaces } from '@/components/dashboard/DashboardWorkspaces';
import { AssignedToMeSection } from '@/components/dashboard/AssignedToMeSection';
import { getGreeting } from '@/utils/date';
import type { Project } from '@/types/project';
import type { Issue } from '@/types/issue';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');

  // Filtering for "Assigned to Me"
  const [filterWorkspaceId, setFilterWorkspaceId] = useState<string>('all');
  const [filterProjectId, setFilterProjectId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // 1. Fetch workspaces the current user belongs to
  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useQuery({
    queryKey: ['dashboard-workspaces', user?.id],
    queryFn: () => workspaceApi.list(user?.id).then((r) => r.data || []),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5,
  });

  // 2. Fetch all projects across workspaces
  const { data: allProjects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['dashboard-projects', workspaces.map((w) => w.id)],
    queryFn: async () => {
      if (workspaces.length === 0) return [];
      const lists = await Promise.all(
        workspaces.map((w) =>
          projectApi.list(w.id).then((r) =>
            (r.data || []).map((p: Project) => ({
              ...p,
              workspaceName: w.name,
              workspaceId: w.id,
            }))
          )
        )
      );
      return lists.flat();
    },
    enabled: workspaces.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // 3. Fetch user's assigned open issues across projects
  const { data: myIssues = [], isLoading: isIssuesLoading } = useQuery({
    queryKey: ['dashboard-my-issues', user?.id, allProjects.map((p) => p.id)],
    queryFn: async () => {
      if (allProjects.length === 0) return [];
      const issueLists = await Promise.all(
        allProjects.slice(0, 10).map((p: any) =>
          issueApi.list(p.id, { size: 50 }).then((r) =>
            (r.data || []).map((i: Issue) => ({
              ...i,
              projectName: p.name,
              projectId: p.id,
              workspaceId: p.workspaceId,
              workspaceName: p.workspaceName,
            }))
          )
        )
      );
      return issueLists
        .flat()
        .filter((i: any) => i.assignee?.id === user?.id && i.status !== 'DONE');
    },
    enabled: Boolean(user?.id && allProjects.length > 0),
    staleTime: 1000 * 60 * 3,
  });

  // Filtered projects based on selected workspace
  const availableProjectsForFilter = useMemo(() => {
    if (filterWorkspaceId === 'all') return allProjects;
    return allProjects.filter((p: any) => p.workspaceId === filterWorkspaceId);
  }, [allProjects, filterWorkspaceId]);

  // Filtered issues based on selected workspace and project
  const filteredIssues = useMemo(() => {
    return myIssues.filter((issue: any) => {
      const matchWs = filterWorkspaceId === 'all' || issue.workspaceId === filterWorkspaceId;
      const matchProj = filterProjectId === 'all' || issue.projectId === filterProjectId;
      return matchWs && matchProj;
    });
  }, [myIssues, filterWorkspaceId, filterProjectId]);

  const totalIssues = filteredIssues.length;
  const totalPages = Math.max(1, Math.ceil(totalIssues / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIssues.slice(start, start + pageSize);
  }, [filteredIssues, currentPage, pageSize]);

  const [greeting, setGreeting] = useState('Welcome back');
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const handleOpenCreateProject = (wsId?: string) => {
    const targetWsId = wsId || workspaces[0]?.id || '';
    setSelectedWorkspaceId(targetWsId);
    setCreateProjectOpen(true);
  };

  return (
    <>
      <div style={{ width: '100%', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <DashboardHero
          userName={user?.fullName || (user as any)?.displayName || 'User'}
          greeting={greeting}
          hasWorkspaces={workspaces.length > 0}
          onCreateWorkspace={() => setCreateWorkspaceOpen(true)}
          onCreateProject={() => handleOpenCreateProject()}
        />

        <DashboardStats
          workspacesCount={workspaces.length}
          projectsCount={allProjects.length}
          issuesCount={myIssues.length}
          isLoadingWorkspaces={isWorkspacesLoading}
          isLoadingProjects={isProjectsLoading}
          isLoadingIssues={isIssuesLoading}
        />

        <DashboardProjects
          projects={allProjects}
          isLoading={isProjectsLoading}
          hasWorkspaces={workspaces.length > 0}
          onCreateProject={() => handleOpenCreateProject()}
        />

        <DashboardWorkspaces
          workspaces={workspaces}
          allProjects={allProjects}
          isLoading={isWorkspacesLoading}
          onCreateWorkspace={() => setCreateWorkspaceOpen(true)}
        />

        <AssignedToMeSection
          workspaces={workspaces}
          availableProjects={availableProjectsForFilter}
          filterWorkspaceId={filterWorkspaceId}
          onFilterWorkspaceChange={(id) => {
            setFilterWorkspaceId(id);
            setFilterProjectId('all');
            setCurrentPage(1);
          }}
          filterProjectId={filterProjectId}
          onFilterProjectChange={(id) => {
            setFilterProjectId(id);
            setCurrentPage(1);
          }}
          issues={paginatedIssues}
          totalIssues={totalIssues}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <CreateWorkspaceModal open={createWorkspaceOpen} onClose={() => setCreateWorkspaceOpen(false)} />
      <CreateProjectModal
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        workspaceId={selectedWorkspaceId || undefined}
      />
    </>
  );
}
