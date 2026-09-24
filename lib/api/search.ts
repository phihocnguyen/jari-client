import apiClient from './client';
import { normalizeIssue } from './issue';
import type { PageResponse } from '@/types/api';
import type { Issue } from '@/types/issue';

export const searchApi = {
  /** Global issue search across all accessible projects/workspaces. */
  issues: async (keyword: string, size = 20): Promise<PageResponse<Issue>> => {
    const res = await apiClient.get<any>('/search/issues', {
      params: { keyword, size, page: 0 },
    });
    const payload = res.data;
    const pageData = payload?.data?.data ? payload.data : payload?.data ? payload.data : payload;
    const rawList: any[] = Array.isArray(pageData?.data)
      ? pageData.data
      : Array.isArray(pageData?.content)
        ? pageData.content
        : Array.isArray(pageData)
          ? pageData
          : [];

    return {
      data: rawList.map((item) => {
        const issue = normalizeIssue(item);
        return {
          ...issue,
          projectName: item.projectName,
          projectKey: item.projectKey,
        };
      }),
      page: pageData?.page ?? pageData?.pageNumber ?? 0,
      size: pageData?.size ?? pageData?.pageSize ?? size,
      total: pageData?.total ?? pageData?.totalElements ?? rawList.length,
      totalPages: pageData?.totalPages ?? 1,
    };
  },
};
