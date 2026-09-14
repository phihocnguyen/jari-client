import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const ADMIN_USER = {
  id: '11111111-1111-1111-1111-111111111111',
  fullName: 'Admin User',
  email: 'admin@jari.com',
  avatarUrl: undefined,
};

const DEMO_WORKSPACES = [
  {
    id: 'ws-demo-1',
    name: 'Acme Engineering',
    workspaceKey: 'ACME',
    slug: 'acme-eng',
    description: 'Primary workspace for Acme Software products',
    role: 'WORKSPACE_ADMIN' as const,
    memberCount: 5,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ws-demo-2',
    name: 'Design Systems & UI',
    workspaceKey: 'DSUI',
    slug: 'design-ui',
    description: 'Jari component library and design system',
    role: 'WORKSPACE_MEMBER' as const,
    memberCount: 3,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
];

const DEMO_PROJECTS = [
  {
    id: 'proj-demo-1',
    workspaceId: 'ws-demo-1',
    name: 'Jari Core App',
    projectKey: 'JARI',
    key: 'JARI',
    description: 'Next-gen agile project management platform',
    avatarColor: '#10B981',
    memberCount: 4,
    role: 'PROJECT_ADMIN' as const,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'proj-demo-2',
    workspaceId: 'ws-demo-1',
    name: 'Backend Services API',
    projectKey: 'API',
    key: 'API',
    description: 'Spring Boot microservices & WebSocket service',
    avatarColor: '#6366F1',
    memberCount: 3,
    role: 'PROJECT_ADMIN' as const,
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
  },
];

const DEMO_SPRINTS = [
  {
    id: 'sprint-demo-1',
    projectId: 'proj-demo-1',
    name: 'Sprint 1 - Core UI & Drag and Drop',
    goal: 'Deliver interactive Kanban board with animations',
    status: 'ACTIVE' as const,
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2026-03-15T00:00:00Z',
    createdAt: '2026-03-01T00:00:00Z',
    issueCount: 3,
  },
  {
    id: 'sprint-demo-2',
    projectId: 'proj-demo-1',
    name: 'Sprint 2 - Real-time WebSocket Notifications',
    goal: 'Integrate live notifications for issue updates',
    status: 'PLANNING' as const,
    startDate: '2026-03-16T00:00:00Z',
    endDate: '2026-03-30T00:00:00Z',
    createdAt: '2026-03-01T00:00:00Z',
    issueCount: 2,
  },
];

import type { Issue } from '@/types/issue';

const DEMO_ISSUES: Issue[] = [
  {
    id: 'issue-demo-1',
    key: 'JARI-101',
    title: 'Design Glassmorphism Dashboard Cards',
    description: 'Create high-converting glassmorphic UI elements for the main overview page.',
    type: 'STORY' as const,
    status: 'IN_PROGRESS' as const,
    priority: 'HIGH' as const,
    storyPoints: 5,
    projectId: 'proj-demo-1',
    sprintId: 'sprint-demo-1',
    reporter: ADMIN_USER,
    assignee: ADMIN_USER,
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-02T10:00:00Z',
  },
  {
    id: 'issue-demo-2',
    key: 'JARI-102',
    title: 'Implement Drag and Drop Kanban Columns',
    description: 'Support smooth status transitions with optimistic updates.',
    type: 'TASK' as const,
    status: 'TODO' as const,
    priority: 'MEDIUM' as const,
    storyPoints: 3,
    projectId: 'proj-demo-1',
    sprintId: 'sprint-demo-1',
    reporter: ADMIN_USER,
    assignee: ADMIN_USER,
    createdAt: '2026-03-03T11:00:00Z',
    updatedAt: '2026-03-03T11:00:00Z',
  },
  {
    id: 'issue-demo-3',
    key: 'JARI-103',
    title: 'Fix Auth Token Refresh Interceptor',
    description: 'Handle demo bypass token without redirecting on 401.',
    type: 'BUG' as const,
    status: 'DONE' as const,
    priority: 'HIGHEST' as const,
    storyPoints: 2,
    projectId: 'proj-demo-1',
    sprintId: 'sprint-demo-1',
    reporter: ADMIN_USER,
    assignee: ADMIN_USER,
    createdAt: '2026-03-04T09:00:00Z',
    updatedAt: '2026-03-04T09:00:00Z',
  },
];

export function getDemoResponse(config: InternalAxiosRequestConfig): AxiosResponse {
  const url = config.url ?? '';
  const method = (config.method ?? 'get').toUpperCase();

  let responseData: unknown = { success: true, data: null };

  if (method === 'GET') {
    if (url.includes('/users/me')) {
      responseData = { success: true, data: ADMIN_USER };
    } else if (url.includes('/workspaces/') && url.endsWith('/members')) {
      responseData = {
        success: true,
        data: [{ userId: ADMIN_USER.id, fullName: ADMIN_USER.fullName, email: ADMIN_USER.email, role: 'WORKSPACE_ADMIN', joinedAt: '2026-01-01T00:00:00Z' }],
      };
    } else if (url.includes('/workspaces/') && url.endsWith('/projects')) {
      responseData = { success: true, data: DEMO_PROJECTS };
    } else if (url.match(/\/workspaces\/[^\/]+$/)) {
      const id = url.split('/').pop();
      const ws = DEMO_WORKSPACES.find(w => w.id === id) ?? DEMO_WORKSPACES[0];
      responseData = { success: true, data: ws };
    } else if (url.endsWith('/workspaces')) {
      responseData = { success: true, data: DEMO_WORKSPACES };
    } else if (url.includes('/projects/') && url.endsWith('/members')) {
      responseData = {
        success: true,
        data: [{ userId: ADMIN_USER.id, fullName: ADMIN_USER.fullName, email: ADMIN_USER.email, role: 'PROJECT_ADMIN' }],
      };
    } else if (url.includes('/projects/') && url.endsWith('/sprints')) {
      responseData = { success: true, data: DEMO_SPRINTS };
    } else if (url.includes('/projects/') && url.endsWith('/board')) {
      responseData = {
        success: true,
        data: {
          sprint: DEMO_SPRINTS[0],
          columns: [
            { statusName: 'TODO', issues: DEMO_ISSUES.filter(i => i.status === 'TODO') },
            { statusName: 'IN_PROGRESS', issues: DEMO_ISSUES.filter(i => i.status === 'IN_PROGRESS') },
            { statusName: 'IN_REVIEW', issues: DEMO_ISSUES.filter(i => i.status === 'IN_REVIEW') },
            { statusName: 'DONE', issues: DEMO_ISSUES.filter(i => i.status === 'DONE') },
          ],
        },
      };
    } else if (url.includes('/projects/') && url.endsWith('/issues')) {
      responseData = {
        content: DEMO_ISSUES,
        pageNumber: 0,
        pageSize: 20,
        totalElements: DEMO_ISSUES.length,
        totalPages: 1,
        last: true,
      };
    } else if (url.match(/\/projects\/[^\/]+$/)) {
      const id = url.split('/').pop();
      const proj = DEMO_PROJECTS.find(p => p.id === id) ?? DEMO_PROJECTS[0];
      responseData = { success: true, data: proj };
    } else if (url.includes('/issues/') && url.endsWith('/comments')) {
      responseData = {
        success: true,
        data: [
          {
            id: 'comment-demo-1',
            issueId: 'issue-demo-1',
            author: ADMIN_USER,
            content: 'Demo Comment: System initialized in demo mode.',
            createdAt: '2026-03-02T12:00:00Z',
            updatedAt: '2026-03-02T12:00:00Z',
          },
        ],
      };
    } else if (url.includes('/issues/') && url.endsWith('/history')) {
      responseData = {
        success: true,
        data: [
          {
            id: 'hist-demo-1',
            issueId: 'issue-demo-1',
            field: 'status',
            oldValue: 'TODO',
            newValue: 'IN_PROGRESS',
            changedBy: ADMIN_USER,
            changedAt: '2026-03-02T10:30:00Z',
          },
        ],
      };
    } else if (url.match(/\/issues\/[^\/]+$/)) {
      const id = url.split('/').pop();
      const issue = DEMO_ISSUES.find(i => i.id === id || i.key === id) ?? DEMO_ISSUES[0];
      responseData = {
        success: true,
        data: {
          ...issue,
          comments: [],
          children: [],
          sprint: DEMO_SPRINTS[0],
        },
      };
    }
  } else {
    // POST / PUT / PATCH / DELETE mutations in demo mode
    if (url.includes('/issues')) {
      responseData = {
        success: true,
        data: {
          id: 'issue-demo-' + Date.now(),
          key: 'JARI-999',
          title: 'New Demo Issue',
          type: 'TASK',
          status: 'TODO',
          priority: 'MEDIUM',
          projectId: 'proj-demo-1',
          sprintId: 'sprint-demo-1',
          reporter: ADMIN_USER,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    } else if (url.includes('/sprints')) {
      responseData = {
        success: true,
        data: {
          id: 'sprint-demo-' + Date.now(),
          projectId: 'proj-demo-1',
          name: 'New Demo Sprint',
          status: 'PLANNING',
          createdAt: new Date().toISOString(),
        },
      };
    } else if (url.includes('/projects')) {
      responseData = {
        success: true,
        data: {
          id: 'proj-demo-' + Date.now(),
          workspaceId: 'ws-demo-1',
          name: 'New Demo Project',
          projectKey: 'DEMO',
          key: 'DEMO',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    } else if (url.includes('/workspaces')) {
      responseData = {
        success: true,
        data: {
          id: 'ws-demo-' + Date.now(),
          name: 'New Demo Workspace',
          workspaceKey: 'NEW',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }
  }

  return {
    data: responseData,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
}
