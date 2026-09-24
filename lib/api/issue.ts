import apiClient from './client';
import type { ApiResponse, PageResponse } from '@/types/api';
import type {
  Issue,
  IssueDetail,
  IssueHistory,
  Comment,
  CreateIssueRequest,
  UpdateIssueRequest,
  IssueFilter,
  IssueType,
  IssueStatus,
  IssuePriority,
} from '@/types/issue';

export function normalizeIssue(item: any): Issue {
  if (!item) return item;

  // Map backend status representation ("TO DO", "IN PROGRESS", etc.)
  let mappedStatus: IssueStatus = 'TODO';
  const rawStatus = (item.status || item.statusCategory || '').toUpperCase().trim();
  if (rawStatus === 'DONE' || rawStatus === 'CANCELLED') {
    mappedStatus = 'DONE';
  } else if (rawStatus === 'IN_PROGRESS' || rawStatus === 'IN PROGRESS') {
    mappedStatus = 'IN_PROGRESS';
  } else if (rawStatus === 'IN_REVIEW' || rawStatus === 'IN REVIEW') {
    mappedStatus = 'IN_REVIEW';
  } else {
    mappedStatus = 'TODO';
  }

  const rawType = (item.issueType || item.type || 'TASK').toUpperCase() as IssueType;
  const rawPriority = (item.priority || 'MEDIUM').toUpperCase() as IssuePriority;

  return {
    ...item,
    id: item.id,
    key: item.issueKey || item.key || item.id,
    issueKey: item.issueKey || item.key,
    title: item.title || '',
    description: item.description,
    type: rawType,
    issueType: item.issueType || rawType,
    status: mappedStatus,
    statusCategory: item.statusCategory || (mappedStatus === 'DONE' ? 'DONE' : mappedStatus === 'TODO' ? 'TODO' : 'IN_PROGRESS'),
    priority: rawPriority,
    projectId: item.projectId,
    sprintId: item.sprintId,
    parentId: item.parentId,
    storyPoints: item.storyPoints != null ? Number(item.storyPoints) : undefined,
    dueDate: item.dueDate,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    labels: item.labels || [],
    components: item.components || [],
    releaseId: item.releaseId,
    releaseName: item.releaseName,
    assignee: item.assignee
      ? { ...item.assignee, fullName: (!item.assignee.fullName || item.assignee.fullName === 'Developer' || item.assignee.fullName === 'dev_user') ? 'Học Nguyễn' : item.assignee.fullName }
      : (item.assigneeId ? { id: item.assigneeId, fullName: (!item.assigneeName || item.assigneeName === 'Developer' || item.assigneeName === 'dev_user') ? 'Học Nguyễn' : item.assigneeName } : undefined),
    reporter: item.reporter
      ? { ...item.reporter, fullName: (!item.reporter.fullName || item.reporter.fullName === 'Developer' || item.reporter.fullName === 'dev_user') ? 'Học Nguyễn' : item.reporter.fullName }
      : { id: item.reporterId || 'unknown', fullName: (!item.reporterName || item.reporterName === 'Developer' || item.reporterName === 'dev_user') ? 'Học Nguyễn' : item.reporterName },
  };
}

// Backend returns comments with flat author fields (authorId/authorName)
// while the UI expects a nested `author` object.
export function normalizeComment(item: any): Comment {
  if (!item) return item;
  const rawAuthorName =
    item.author?.fullName || item.author?.name || item.authorName || 'Unknown';
  return {
    ...item,
    issueId: item.issueId,
    author: item.author
      ? { ...item.author, fullName: rawAuthorName }
      : { id: item.authorId || 'unknown', fullName: rawAuthorName },
    content: item.content ?? '',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
  };
}

// ─── Issue API ────────────────────────────────────────────────────
export const issueApi = {
  list: async (projectId: string, filters?: IssueFilter): Promise<PageResponse<Issue>> => {
    // Backend IssueFilterRequest uses `keyword` (Elasticsearch / JPA). Map client `query` → `keyword`.
    let params: Record<string, unknown> | undefined;
    if (filters) {
      const { query, keyword, ...rest } = filters;
      const kw = keyword ?? query;
      params = { ...rest };
      if (kw != null && String(kw).length > 0) {
        params.keyword = kw;
      }
    }
    const res = await apiClient.get<any>(`/projects/${projectId}/issues`, { params });
    const payload = res.data;

    // Handle both ApiResponse<PageResponse<Issue>> from Spring Boot and mock PageResponse
    const pageData = payload?.data?.data ? payload.data : payload?.data ? payload.data : payload;
    const rawList: any[] = Array.isArray(pageData?.data)
      ? pageData.data
      : Array.isArray(pageData?.content)
        ? pageData.content
        : Array.isArray(pageData)
          ? pageData
          : [];

    return {
      data: rawList.map(normalizeIssue),
      page: pageData?.page ?? pageData?.pageNumber ?? 0,
      size: pageData?.size ?? pageData?.pageSize ?? 20,
      total: pageData?.total ?? pageData?.totalElements ?? rawList.length,
      totalPages: pageData?.totalPages ?? 1,
    };
  },

  get: (issueId: string) =>
    apiClient.get<ApiResponse<IssueDetail>>(`/issues/${issueId}`).then((r) => {
      const data = r.data.data;
      return {
        ...r.data,
        data: {
        ...normalizeIssue(data),
        comments: (data.comments || []).map(normalizeComment),
        children: (data.children || []).map(normalizeIssue),
          sprint: data.sprint,
        },
      };
    }),

  create: async (projectId: string, data: CreateIssueRequest): Promise<ApiResponse<Issue>> => {
    // Construct request body for POST /api/v1/projects/{projectId}/issues
    const body: Record<string, any> = {
      title: data.title,
      description: data.description || undefined,
      issueTypeId: data.issueTypeId,
      statusId: data.statusId,
      priorityId: data.priorityId,
      assigneeId: data.assigneeId || null,
      parentId: data.parentId || null,
      storyPoints: data.storyPoints ?? null,
      startDate: data.startDate || null,
      dueDate: data.dueDate || null,
      sprintId: data.sprintId || null,
      // Fallback fields for demo mock compatibility
      type: data.type,
      status: data.status,
      priority: data.priority,
    };

    const res = await apiClient.post<ApiResponse<any>>(`/projects/${projectId}/issues`, body);
    const createdRaw = res.data?.data;
    const normalized = normalizeIssue(createdRaw);

    // If sprintId is provided, also attach the created issue to the sprint via Section 10.6 API
    if (data.sprintId && normalized.id) {
      try {
        await apiClient.post(`/sprints/${data.sprintId}/issues`, { issueId: normalized.id });
      } catch (err) {
        console.warn('Could not attach issue to sprint:', err);
      }
    }

    return {
      ...res.data,
      data: normalized,
    };
  },

  update: (issueId: string, data: UpdateIssueRequest) =>
    apiClient.put<ApiResponse<Issue>>(`/issues/${issueId}`, data).then((r) => ({
      ...r.data,
      data: normalizeIssue(r.data.data),
    })),

  delete: (issueId: string) => apiClient.delete(`/issues/${issueId}`),

  updateStatus: (issueId: string, status: string) =>
    apiClient.patch<ApiResponse<Issue>>(`/issues/${issueId}/status`, { status }).then((r) => ({
      ...r.data,
      data: normalizeIssue(r.data.data),
    })),

  updateAssignee: (issueId: string, assigneeId: string | null) =>
    apiClient.patch<ApiResponse<Issue>>(`/issues/${issueId}/assignee`, { assigneeId }).then((r) => ({
      ...r.data,
      data: normalizeIssue(r.data.data),
    })),

  updateParent: (issueId: string, parentId: string | null) =>
    apiClient.patch<ApiResponse<Issue>>(`/issues/${issueId}/parent`, { parentId }).then((r) => ({
      ...r.data,
      data: normalizeIssue(r.data.data),
    })),

  updateDates: (issueId: string, dates: { startDate?: string | null; dueDate?: string | null }) =>
    apiClient.patch<ApiResponse<Issue>>(`/issues/${issueId}/dates`, dates).then((r) => ({
      ...r.data,
      data: normalizeIssue(r.data.data),
    })),

  setRelease: (issueId: string, releaseId: string | null) =>
    apiClient.patch<ApiResponse<Issue>>(`/issues/${issueId}/release`, { releaseId }).then((r) => ({
      ...r.data,
      data: normalizeIssue(r.data.data),
    })),

  updateSprint: (issueId: string, sprintId: string | null) =>
    apiClient.patch<ApiResponse<Issue>>(`/issues/${issueId}/sprint`, { sprintId }).then((r) => ({
      ...r.data,
      data: normalizeIssue(r.data.data),
    })),

  setLabels: (issueId: string, labelIds: string[]) =>
    apiClient.put<ApiResponse<Issue>>(`/issues/${issueId}/labels`, { labelIds }).then((r) => ({
      ...r.data,
      data: normalizeIssue(r.data.data),
    })),

  setComponents: (issueId: string, componentIds: string[]) =>
    apiClient.put<ApiResponse<Issue>>(`/issues/${issueId}/components`, { componentIds }).then((r) => ({
      ...r.data,
      data: normalizeIssue(r.data.data),
    })),

  getHistory: (issueId: string) =>
    apiClient.get<ApiResponse<any[]>>(`/issues/${issueId}/history`).then((r) => {
      const rawList = r.data?.data || (Array.isArray(r.data) ? r.data : []);
      return (Array.isArray(rawList) ? rawList : []).map((item: any) => ({
        id: item.id,
        issueId: issueId,
        field: item.field,
        oldValue: item.oldValue,
        newValue: item.newValue,
        changedBy: {
          id: item.userId || item.changedBy?.id || 'unknown',
          fullName: item.userName || item.changedBy?.fullName || item.changedBy?.displayName || 'Học Nguyễn',
        },
        changedAt: item.createdAt || item.changedAt || new Date().toISOString(),
      }));
    }),

  // Comments
  listComments: (issueId: string) =>
    apiClient.get<ApiResponse<Comment[]>>(`/issues/${issueId}/comments`).then((r) => {
      const rawList = r.data?.data ?? r.data;
      return (Array.isArray(rawList) ? rawList : []).map(normalizeComment);
    }),

  addComment: (issueId: string, content: string) =>
    apiClient.post<ApiResponse<Comment>>(`/issues/${issueId}/comments`, { content }).then((r) => r.data),

  updateComment: (issueId: string, commentId: string, content: string) =>
    apiClient.put<ApiResponse<Comment>>(`/issues/${issueId}/comments/${commentId}`, { content }).then((r) => r.data),

  deleteComment: (issueId: string, commentId: string) =>
    apiClient.delete(`/issues/${issueId}/comments/${commentId}`),

  // Watchers
  getWatchers: (issueId: string) =>
    apiClient.get<ApiResponse<WatchersResponse>>(`/issues/${issueId}/watchers`).then((r) => r.data.data),

  watchIssue: (issueId: string) =>
    apiClient.post<ApiResponse<void>>(`/issues/${issueId}/watchers`).then((r) => r.data),

  unwatchIssue: (issueId: string) =>
    apiClient.delete<ApiResponse<void>>(`/issues/${issueId}/watchers`).then((r) => r.data),

  reorderIssues: (projectId: string, issueIds: string[]) =>
    apiClient.put<ApiResponse<void>>(`/projects/${projectId}/issues/reorder`, { issueIds }),
};

export interface WatcherUser {
  id: string;
  username: string;
  displayName: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface WatchersResponse {
  count: number;
  isWatching: boolean;
  watchers: WatcherUser[];
}

