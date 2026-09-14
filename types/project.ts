// ─── Project Types ────────────────────────────────────────────────
export type ProjectType = 'SOFTWARE' | 'BUSINESS' | 'SERVICE_DESK';
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED';
export type ProjectRole = 'PROJECT_ADMIN' | 'PROJECT_MEMBER' | 'PROJECT_VIEWER';

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  projectKey: string;
  key?: string;
  description?: string;
  avatarUrl?: string;
  avatarColor?: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  role?: ProjectRole;
}

export interface ProjectMember {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: ProjectRole;
}

export interface CreateProjectRequest {
  name: string;
  projectKey: string;
  description?: string;
  leadId?: string;
  projectType?: ProjectType;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  leadId?: string;
  status?: ProjectStatus;
}
