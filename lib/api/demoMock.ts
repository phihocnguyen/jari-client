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
    name: 'Teams in Space',
    projectKey: 'TIS',
    key: 'TIS',
    description: 'Software project for space flight systems',
    avatarColor: '#EAB308',
    memberCount: 6,
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
    name: 'Board',
    goal: 'Deliver interactive Teams in Space Kanban board',
    status: 'ACTIVE' as const,
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2026-03-15T00:00:00Z',
    createdAt: '2026-03-01T00:00:00Z',
    issueCount: 8,
  },
];

import type { Issue } from '@/types/issue';

let DEMO_ISSUES: Issue[] = [
  {
    id: 'issue-demo-1',
    key: 'TIS-101',
    title: 'Add one more type of illustration on the home screen',
    tags: ['ILLUSTRATION'],
    subtext: 'Not started yet',
    type: 'STORY' as const,
    status: 'TODO' as const,
    priority: 'HIGH' as const,
    extraAssigneeCount: 4,
    projectId: 'proj-demo-1',
    sprintId: 'sprint-demo-1',
    reporter: ADMIN_USER,
    assignee: ADMIN_USER,
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-02T10:00:00Z',
  },
  {
    id: 'issue-demo-2',
    key: 'TIS-102',
    title: 'Create designs for admin, and for user web and android platform',
    tags: ['HI-FI DESIGN'],
    subtext: 'Not started yet',
    type: 'TASK' as const,
    status: 'TODO' as const,
    priority: 'HIGH' as const,
    extraAssigneeCount: 3,
    projectId: 'proj-demo-1',
    sprintId: 'sprint-demo-1',
    reporter: ADMIN_USER,
    assignee: ADMIN_USER,
    createdAt: '2026-03-03T11:00:00Z',
    updatedAt: '2026-03-03T11:00:00Z',
  },
  {
    id: 'issue-demo-3',
    key: 'TIS-103',
    title: 'Create prototype for admin, and for user web and android platform',
    tags: ['PROTOTYPE'],
    subtext: 'Not started yet',
    type: 'TASK' as const,
    status: 'TODO' as const,
    priority: 'MEDIUM' as const,
    extraAssigneeCount: 2,
    projectId: 'proj-demo-1',
    sprintId: 'sprint-demo-1',
    reporter: ADMIN_USER,
    assignee: ADMIN_USER,
    createdAt: '2026-03-03T14:00:00Z',
    updatedAt: '2026-03-03T14:00:00Z',
  },
  {
    id: 'issue-demo-4',
    key: 'TIS-104',
    title: 'Create Wireframes for admin, and for user web and android platform',
    tags: ['WIREFRAMES'],
    subtext: '50% completed',
    progressPercent: 50,
    type: 'STORY' as const,
    status: 'IN_PROGRESS' as const,
    priority: 'HIGH' as const,
    extraAssigneeCount: 5,
    projectId: 'proj-demo-1',
    sprintId: 'sprint-demo-1',
    reporter: ADMIN_USER,
    assignee: ADMIN_USER,
    createdAt: '2026-03-04T09:00:00Z',
    updatedAt: '2026-03-04T09:00:00Z',
  },
  {
    id: 'issue-demo-5',
    key: 'TIS-105',
    title: 'Create information architecture for admin, and for user web and android platform',
    tags: ['IA', 'UX'],
    subtext: '60% completed',
    progressPercent: 60,
    type: 'TASK' as const,
    status: 'IN_PROGRESS' as const,
    priority: 'HIGH' as const,
    extraAssigneeCount: 3,
    projectId: 'proj-demo-1',
    sprintId: 'sprint-demo-1',
    reporter: ADMIN_USER,
    assignee: ADMIN_USER,
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-03-05T08:00:00Z',
  },
  {
    id: 'issue-demo-6',
    key: 'TIS-106',
    title: 'Create Task Flow for admin, and for user web and android platform',
    tags: ['TASK FLOW', 'UX'],
    subtext: 'Under Review',
    progressPercent: 85,
    type: 'TASK' as const,
    status: 'IN_REVIEW' as const,
    priority: 'HIGH' as const,
    extraAssigneeCount: 4,
    projectId: 'proj-demo-1',
    sprintId: 'sprint-demo-1',
    reporter: ADMIN_USER,
    assignee: ADMIN_USER,
    createdAt: '2026-03-06T10:00:00Z',
    updatedAt: '2026-03-06T10:00:00Z',
  },
  {
    id: 'issue-demo-7',
    key: 'TIS-107',
    title: 'Create Personas for all type of users on the basis of research data',
    tags: ['USER PERSONAS', 'UX'],
    subtext: 'Task finished',
    progressPercent: 100,
    type: 'STORY' as const,
    status: 'DONE' as const,
    priority: 'HIGH' as const,
    extraAssigneeCount: 4,
    projectId: 'proj-demo-1',
    sprintId: 'sprint-demo-1',
    reporter: ADMIN_USER,
    assignee: ADMIN_USER,
    createdAt: '2026-03-07T11:00:00Z',
    updatedAt: '2026-03-07T11:00:00Z',
  },
  {
    id: 'issue-demo-8',
    key: 'TIS-108',
    title: 'Create User Stories for admin, and for user web and android platform',
    tags: ['USER STORIES', 'UX'],
    subtext: 'Task finished',
    progressPercent: 100,
    type: 'STORY' as const,
    status: 'DONE' as const,
    priority: 'HIGH' as const,
    extraAssigneeCount: 3,
    projectId: 'proj-demo-1',
    sprintId: 'sprint-demo-1',
    reporter: ADMIN_USER,
    assignee: ADMIN_USER,
    createdAt: '2026-03-08T09:00:00Z',
    updatedAt: '2026-03-08T09:00:00Z',
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
    let payload: any = {};
    if (typeof config.data === 'string') {
      try { payload = JSON.parse(config.data); } catch { payload = {}; }
    } else if (config.data) {
      payload = config.data;
    }

    if (method === 'DELETE' && url.includes('/issues/')) {
      const id = url.split('/').pop();
      DEMO_ISSUES = DEMO_ISSUES.filter((i) => i.id !== id);
      responseData = { success: true, data: 'Issue deleted' };
    } else if (method === 'PATCH' && url.includes('/issues/') && url.endsWith('/status')) {
      const parts = url.split('/');
      const id = parts[parts.length - 2];
      const found = DEMO_ISSUES.find((i) => i.id === id);
      if (found && payload.status) {
        found.status = payload.status;
        found.updatedAt = new Date().toISOString();
      }
      responseData = { success: true, data: found };
    } else if (method === 'PATCH' && url.includes('/issues/') && url.endsWith('/assignee')) {
      const parts = url.split('/');
      const id = parts[parts.length - 2];
      const found = DEMO_ISSUES.find((i) => i.id === id);
      if (found) {
        found.assignee = payload.assigneeId ? ADMIN_USER : undefined;
        found.updatedAt = new Date().toISOString();
      }
      responseData = { success: true, data: found };
    } else if (method === 'POST' && url.includes('/issues')) {
      const newIssue: Issue = {
        id: 'issue-demo-' + Date.now(),
        key: 'TIS-' + (DEMO_ISSUES.length + 101),
        title: payload.title || 'New Demo Issue',
        type: payload.type || 'TASK',
        status: payload.status || 'TODO',
        priority: payload.priority || 'MEDIUM',
        projectId: payload.projectId || 'proj-demo-1',
        sprintId: 'sprint-demo-1',
        reporter: ADMIN_USER,
        assignee: payload.assigneeId ? ADMIN_USER : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      DEMO_ISSUES.push(newIssue);
      responseData = { success: true, data: newIssue };
    } else if (method === 'PUT' && url.includes('/issues/')) {
      const id = url.split('/').pop();
      const found = DEMO_ISSUES.find((i) => i.id === id);
      if (found) {
        Object.assign(found, payload, { updatedAt: new Date().toISOString() });
      }
      responseData = { success: true, data: found };
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
