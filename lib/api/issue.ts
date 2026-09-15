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
  const rawStatus = (item.statusCategory || item.status || '').toUpperCase().trim();
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
    assignee: item.assignee
      ? { ...item.assignee, fullName: (!item.assignee.fullName || item.assignee.fullName === 'Developer' || item.assignee.fullName === 'dev_user') ? 'Học Nguyễn' : item.assignee.fullName }
      : (item.assigneeId ? { id: item.assigneeId, fullName: (!item.assigneeName || item.assigneeName === 'Developer' || item.assigneeName === 'dev_user') ? 'Học Nguyễn' : item.assigneeName } : undefined),
    reporter: item.reporter
      ? { ...item.reporter, fullName: (!item.reporter.fullName || item.reporter.fullName === 'Developer' || item.reporter.fullName === 'dev_user') ? 'Học Nguyễn' : item.reporter.fullName }
      : { id: item.reporterId || 'unknown', fullName: (!item.reporterName || item.reporterName === 'Developer' || item.reporterName === 'dev_user') ? 'Học Nguyễn' : item.reporterName },
  };
}

// ─── Issue API ────────────────────────────────────────────────────
export const issueApi = {
  list: async (projectId: string, filters?: IssueFilter): Promise<PageResponse<Issue>> => {
    const res = await apiClient.get<any>(`/projects/${projectId}/issues`, { params: filters });
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
          comments: data.comments || [],
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
      dueDate: data.dueDate || null,
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
    apiClient.get<ApiResponse<Comment[]>>(`/issues/${issueId}/comments`).then((r) => r.data),

  addComment: (issueId: string, content: string) =>
    apiClient.post<ApiResponse<Comment>>(`/issues/${issueId}/comments`, { content }).then((r) => r.data),

  updateComment: (issueId: string, commentId: string, content: string) =>
    apiClient.put<ApiResponse<Comment>>(`/issues/${issueId}/comments/${commentId}`, { content }).then((r) => r.data),

  deleteComment: (issueId: string, commentId: string) =>
    apiClient.delete(`/issues/${issueId}/comments/${commentId}`),
};
