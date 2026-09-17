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
    ownerId: ADMIN_USER.id,
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
    ownerId: '99999999-9999-9999-9999-999999999999',
    memberCount: 3,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
];

let DEMO_WORKSPACE_MEMBERS = [
  {
    userId: ADMIN_USER.id,
    fullName: ADMIN_USER.fullName,
    email: ADMIN_USER.email,
    role: 'WORKSPACE_ADMIN' as const,
    joinedAt: '2026-01-01T00:00:00Z',
    projectIds: ['00000000-0000-0000-0000-000000000003'],
    projectNames: ['Teams in Space'],
  },
  {
    userId: '22222222-2222-2222-2222-222222222222',
    fullName: 'Sarah Connor',
    email: 'sarah@jari.com',
    role: 'WORKSPACE_MEMBER' as const,
    joinedAt: '2026-02-15T00:00:00Z',
    projectIds: ['00000000-0000-0000-0000-000000000003'],
    projectNames: ['Teams in Space'],
  },
];

let DEMO_PROJECT_MEMBERS = [
  {
    userId: ADMIN_USER.id,
    fullName: ADMIN_USER.fullName,
    displayName: ADMIN_USER.fullName,
    email: ADMIN_USER.email,
    role: 'PROJECT_ADMIN' as const,
    joinedAt: '2026-02-01T00:00:00Z',
  },
  {
    userId: '22222222-2222-2222-2222-222222222222',
    fullName: 'Sarah Connor',
    displayName: 'Sarah Connor',
    email: 'sarah@jari.com',
    role: 'PROJECT_MEMBER' as const,
    joinedAt: '2026-02-15T00:00:00Z',
  },
];

const DEMO_PROJECTS = [
  {
    id: '00000000-0000-0000-0000-000000000003',
    workspaceId: 'ws-demo-1',
    name: 'Teams in Space',
    projectKey: 'TIS',
    key: 'TIS',
    description: 'Software project for space flight systems',
    leadId: ADMIN_USER.id,
    leadName: ADMIN_USER.fullName,
    leadEmail: ADMIN_USER.email,
    defaultAssignee: 'UNASSIGNED' as const,
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
    leadId: ADMIN_USER.id,
    leadName: ADMIN_USER.fullName,
    leadEmail: ADMIN_USER.email,
    defaultAssignee: 'PROJECT_LEAD' as const,
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
    projectId: '00000000-0000-0000-0000-000000000003',
    name: 'Board',
    goal: 'Deliver interactive Teams in Space Kanban board',
    status: 'ACTIVE' as const,
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2026-03-15T00:00:00Z',
    createdAt: '2026-03-01T00:00:00Z',
    issueCount: 8,
  },
];

const DEMO_ISSUE_TYPES = [
  { id: 'type-epic-1', name: 'EPIC', description: 'Large body of work that can be broken down', extra: null },
  { id: 'type-story-1', name: 'STORY', description: 'User story or feature request', extra: null },
  { id: 'type-task-1', name: 'TASK', description: 'A task to be completed', extra: null },
  { id: 'type-bug-1', name: 'BUG', description: 'A defect or problem found in the product', extra: null },
  { id: 'type-subtask-1', name: 'SUBTASK', description: 'A subtask belonging to a parent issue', extra: null },
];

const DEMO_STATUSES = [
  { id: 'status-todo-1', name: 'TO DO', description: null, extra: 'TODO' },
  { id: 'status-inprogress-1', name: 'IN PROGRESS', description: null, extra: 'IN_PROGRESS' },
  { id: 'status-inreview-1', name: 'IN REVIEW', description: null, extra: 'IN_PROGRESS' },
  { id: 'status-done-1', name: 'DONE', description: null, extra: 'DONE' },
  { id: 'status-cancelled-1', name: 'CANCELLED', description: null, extra: 'DONE' },
];

const DEMO_PRIORITIES = [
  { id: 'priority-highest-1', name: 'HIGHEST', description: null, extra: '1' },
  { id: 'priority-high-1', name: 'HIGH', description: null, extra: '2' },
  { id: 'priority-medium-1', name: 'MEDIUM', description: null, extra: '3' },
  { id: 'priority-low-1', name: 'LOW', description: null, extra: '4' },
  { id: 'priority-lowest-1', name: 'LOWEST', description: null, extra: '5' },
];

import type { Issue, IssueType, IssuePriority, IssueStatus } from '@/types/issue';

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
    projectId: '00000000-0000-0000-0000-000000000003',
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
    projectId: '00000000-0000-0000-0000-000000000003',
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
    projectId: '00000000-0000-0000-0000-000000000003',
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
    projectId: '00000000-0000-0000-0000-000000000003',
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
    projectId: '00000000-0000-0000-0000-000000000003',
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
    projectId: '00000000-0000-0000-0000-000000000003',
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
    projectId: '00000000-0000-0000-0000-000000000003',
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
    projectId: '00000000-0000-0000-0000-000000000003',
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
    if (url.includes('/ref/issue-types')) {
      responseData = { success: true, data: DEMO_ISSUE_TYPES };
    } else if (url.includes('/ref/statuses')) {
      responseData = { success: true, data: DEMO_STATUSES };
    } else if (url.includes('/ref/priorities')) {
      responseData = { success: true, data: DEMO_PRIORITIES };
    } else if (url.includes('/users/search')) {
      responseData = {
        success: true,
        data: [
          ADMIN_USER,
          { id: '22222222-2222-2222-2222-222222222222', fullName: 'Sarah Connor', email: 'sarah@jari.com', createdAt: '2026-01-01T00:00:00Z' },
          { id: '33333333-3333-3333-3333-333333333333', fullName: 'Alex Rivera', email: 'alex@jari.com', createdAt: '2026-01-01T00:00:00Z' },
        ],
      };
    } else if (url.includes('/workspaces/') && url.endsWith('/members')) {
      responseData = {
        success: true,
        data: DEMO_WORKSPACE_MEMBERS,
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
        data: DEMO_PROJECT_MEMBERS,
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
      const proj = DEMO_PROJECTS.find(p => p.id === id || p.projectKey?.toLowerCase() === id?.toLowerCase() || p.key?.toLowerCase() === id?.toLowerCase()) ?? DEMO_PROJECTS[0];
      responseData = { success: true, data: proj };
    } else if (url.includes('/projects/') && url.endsWith('/releases')) {
      responseData = {
        success: true,
        data: [
          { id: 'release-demo-1', name: 'v1.0.0-beta', description: 'Initial beta launch', status: 'UNRELEASED', releaseDate: '2026-09-30' },
          { id: 'release-demo-2', name: 'v0.9.0', description: 'Alpha release', status: 'RELEASED', releaseDate: '2026-08-15' },
        ],
      };
    } else if (url.includes('/projects/') && url.endsWith('/labels')) {
      responseData = {
        success: true,
        data: [
          { id: 'label-demo-1', name: 'frontend', color: '#0c66e4' },
          { id: 'label-demo-2', name: 'backend', color: '#22a06b' },
          { id: 'label-demo-3', name: 'design', color: '#ae4787' },
        ],
      };
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

    if (method === 'POST' && url.includes('/workspaces/') && url.endsWith('/members')) {
      const newMember = {
        userId: payload.userId || '33333333-3333-3333-3333-333333333333',
        fullName: payload.email ? payload.email.split('@')[0] : 'Invited Member',
        email: payload.email || 'invited@jari.com',
        role: payload.roleName || 'WORKSPACE_MEMBER',
        joinedAt: new Date().toISOString(),
        projectIds: payload.projectIds || [],
        projectNames: (payload.projectIds || []).map((pid: string) => DEMO_PROJECTS.find(p => p.id === pid)?.name || 'Project'),
      };
      DEMO_WORKSPACE_MEMBERS.push(newMember);
      responseData = { success: true, data: newMember };
    } else if (method === 'PUT' && url.includes('/workspaces/') && url.includes('/members/') && url.endsWith('/role')) {
      const parts = url.split('/');
      const userId = parts[parts.indexOf('members') + 1];
      const member = DEMO_WORKSPACE_MEMBERS.find(m => m.userId === userId);
      if (member) {
        member.role = payload.roleName;
      }
      responseData = { success: true, data: member || DEMO_WORKSPACE_MEMBERS[0] };
    } else if (method === 'PUT' && url.includes('/workspaces/') && url.includes('/members/') && url.endsWith('/projects')) {
      const parts = url.split('/');
      const userId = parts[parts.indexOf('members') + 1];
      const member = DEMO_WORKSPACE_MEMBERS.find(m => m.userId === userId);
      if (member) {
        member.projectIds = payload.projectIds || [];
        member.projectNames = (payload.projectIds || []).map((pid: string) => DEMO_PROJECTS.find(p => p.id === pid)?.name || 'Project');
      }
      responseData = { success: true, data: member || DEMO_WORKSPACE_MEMBERS[0] };
    } else if (method === 'DELETE' && url.includes('/workspaces/') && url.includes('/members/')) {
      const userId = url.split('/').pop();
      DEMO_WORKSPACE_MEMBERS = DEMO_WORKSPACE_MEMBERS.filter(m => m.userId !== userId);
      responseData = { success: true, data: 'Member removed' };
    } else if (method === 'DELETE' && url.includes('/issues/')) {
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
    } else if (method === 'POST' && url.includes('/sprints/') && url.endsWith('/issues')) {
      const parts = url.split('/');
      const sprintId = parts[parts.indexOf('sprints') + 1];
      const found = DEMO_ISSUES.find((i) => i.id === payload.issueId);
      if (found) {
        found.sprintId = sprintId;
      }
      responseData = { success: true, data: null, message: 'Issue added to sprint' };
    } else if (method === 'POST' && url.includes('/issues')) {
      const typeItem = DEMO_ISSUE_TYPES.find((t) => t.id === payload.issueTypeId);
      const prioItem = DEMO_PRIORITIES.find((p) => p.id === payload.priorityId);
      const statItem = DEMO_STATUSES.find((s) => s.id === payload.statusId);

      const resolvedType = (payload.type || typeItem?.name || 'TASK') as IssueType;
      const resolvedPriority = (payload.priority || prioItem?.name || 'MEDIUM') as IssuePriority;
      const resolvedStatus = (payload.status || (statItem?.extra || 'TODO')) as IssueStatus;

      const newIssue: Issue = {
        id: 'issue-demo-' + Date.now(),
        key: 'TIS-' + (DEMO_ISSUES.length + 101),
        title: payload.title || 'New Demo Issue',
        description: payload.description,
        type: resolvedType,
        status: resolvedStatus,
        priority: resolvedPriority,
        projectId: payload.projectId || '00000000-0000-0000-0000-000000000003',
        sprintId: payload.sprintId || 'sprint-demo-1',
        parentId: payload.parentId,
        storyPoints: payload.storyPoints != null ? Number(payload.storyPoints) : undefined,
        dueDate: payload.dueDate,
        reporter: ADMIN_USER,
        assignee: payload.assigneeId ? ADMIN_USER : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      DEMO_ISSUES.push(newIssue);
      responseData = { success: true, data: newIssue };
    } else if (method === 'PATCH' && url.endsWith('/release')) {
      const id = url.split('/')[2];
      const found = DEMO_ISSUES.find((i) => i.id === id);
      const releases = [
        { id: 'release-demo-1', name: 'v1.0.0-beta' },
        { id: 'release-demo-2', name: 'v0.9.0' },
      ];
      if (found) {
        const rel = releases.find((r) => r.id === payload.releaseId);
        (found as any).releaseId = rel?.id;
        (found as any).releaseName = rel?.name;
      }
      responseData = { success: true, data: found };
    } else if (method === 'POST' && url.endsWith('/releases')) {
      responseData = {
        success: true,
        data: {
          id: 'release-demo-' + Date.now(),
          name: payload.name,
          description: payload.description,
          status: 'UNRELEASED',
          releaseDate: payload.releaseDate,
        },
      };
    } else if (method === 'PATCH' && url.endsWith('/dates')) {
      const id = url.split('/')[2];
      const found = DEMO_ISSUES.find((i) => i.id === id);
      if (found) {
        found.startDate = payload.startDate ?? undefined;
        found.dueDate = payload.dueDate ?? undefined;
      }
      responseData = { success: true, data: found };
    } else if (method === 'PATCH' && url.endsWith('/parent')) {
      const id = url.split('/')[2];
      const found = DEMO_ISSUES.find((i) => i.id === id);
      if (found) {
        found.parentId = payload.parentId ?? undefined;
      }
      responseData = { success: true, data: found };
    } else if (method === 'PUT' && url.endsWith('/labels')) {
      const id = url.split('/')[2];
      const allLabels = [
        { id: 'label-demo-1', name: 'frontend', color: '#0c66e4' },
        { id: 'label-demo-2', name: 'backend', color: '#22a06b' },
        { id: 'label-demo-3', name: 'design', color: '#ae4787' },
      ];
      const selected = allLabels.filter((l) => (payload.labelIds || []).includes(l.id));
      const found = DEMO_ISSUES.find((i) => i.id === id);
      if (found) {
        (found as any).labels = selected;
      }
      responseData = { success: true, data: found };
    } else if (method === 'POST' && url.endsWith('/labels')) {
      responseData = {
        success: true,
        data: { id: 'label-demo-' + Date.now(), name: payload.name, color: '#0c66e4' },
      };
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
          projectId: '00000000-0000-0000-0000-000000000003',
          name: 'New Demo Sprint',
          status: 'PLANNING',
          createdAt: new Date().toISOString(),
        },
      };
    } else if (method === 'PUT' && url.includes('/projects/') && url.includes('/members/') && url.endsWith('/role')) {
      const parts = url.split('/');
      const userId = parts[parts.length - 2];
      const found = DEMO_PROJECT_MEMBERS.find(m => m.userId === userId);
      if (found) {
        found.role = payload.roleName;
      }
      responseData = { success: true, data: found };
    } else if (method === 'POST' && url.includes('/projects/') && url.endsWith('/members')) {
      const newMember = {
        userId: payload.userId || 'user-demo-' + Date.now(),
        fullName: payload.fullName || (payload.email ? payload.email.split('@')[0] : 'New Member'),
        displayName: payload.fullName || (payload.email ? payload.email.split('@')[0] : 'New Member'),
        email: payload.email || 'member@jari.com',
        role: payload.roleName || 'PROJECT_MEMBER',
        joinedAt: new Date().toISOString(),
      };
      DEMO_PROJECT_MEMBERS.push(newMember);
      responseData = { success: true, data: newMember };
    } else if (method === 'DELETE' && url.includes('/projects/') && url.includes('/members/')) {
      const userId = url.split('/').pop();
      DEMO_PROJECT_MEMBERS = DEMO_PROJECT_MEMBERS.filter(m => m.userId !== userId);
      responseData = { success: true, data: null, message: 'Member removed' };
    } else if (method === 'PUT' && url.match(/\/projects\/[^\/]+$/)) {
      const id = url.split('/').pop();
      const proj = DEMO_PROJECTS.find(p => p.id === id || p.projectKey?.toLowerCase() === id?.toLowerCase() || p.key?.toLowerCase() === id?.toLowerCase());
      if (proj) {
        Object.assign(proj, payload, { updatedAt: new Date().toISOString() });
      }
      responseData = { success: true, data: proj ?? DEMO_PROJECTS[0] };
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
