import apiClient from './client';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { Issue, IssueDetail, IssueHistory, Comment, CreateIssueRequest, UpdateIssueRequest, IssueFilter } from '@/types/issue';

// ─── Issue API ────────────────────────────────────────────────────
export const issueApi = {
  list: (projectId: string, filters?: IssueFilter) =>
    apiClient.get<PageResponse<Issue>>(`/projects/${projectId}/issues`, { params: filters }).then(r => r.data),

  get: (issueId: string) =>
    apiClient.get<ApiResponse<IssueDetail>>(`/issues/${issueId}`).then(r => r.data),

  create: (projectId: string, data: CreateIssueRequest) =>
    apiClient.post<ApiResponse<Issue>>(`/projects/${projectId}/issues`, data).then(r => r.data),

  update: (issueId: string, data: UpdateIssueRequest) =>
    apiClient.put<ApiResponse<Issue>>(`/issues/${issueId}`, data).then(r => r.data),

  delete: (issueId: string) =>
    apiClient.delete(`/issues/${issueId}`),

  updateStatus: (issueId: string, status: string) =>
    apiClient.patch<ApiResponse<Issue>>(`/issues/${issueId}/status`, { status }).then(r => r.data),

  updateAssignee: (issueId: string, assigneeId: string | null) =>
    apiClient.patch<ApiResponse<Issue>>(`/issues/${issueId}/assignee`, { assigneeId }).then(r => r.data),

  // History
  getHistory: (issueId: string) =>
    apiClient.get<ApiResponse<IssueHistory[]>>(`/issues/${issueId}/history`).then(r => r.data),

  // Comments
  listComments: (issueId: string) =>
    apiClient.get<ApiResponse<Comment[]>>(`/issues/${issueId}/comments`).then(r => r.data),

  addComment: (issueId: string, content: string) =>
    apiClient.post<ApiResponse<Comment>>(`/issues/${issueId}/comments`, { content }).then(r => r.data),

  updateComment: (issueId: string, commentId: string, content: string) =>
    apiClient.put<ApiResponse<Comment>>(`/issues/${issueId}/comments/${commentId}`, { content }).then(r => r.data),

  deleteComment: (issueId: string, commentId: string) =>
    apiClient.delete(`/issues/${issueId}/comments/${commentId}`),
};
