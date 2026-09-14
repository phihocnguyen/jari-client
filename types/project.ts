// ─── Project Types ────────────────────────────────────────────────
export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description?: string;
  avatarUrl?: string;
  avatarColor?: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  role?: ProjectRole;
}

export type ProjectRole = 'PROJECT_ADMIN' | 'PROJECT_MEMBER' | 'PROJECT_VIEWER';

export interface ProjectMember {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: ProjectRole;
}

export interface CreateProjectRequest {
  name: string;
  key?: string;
  description?: string;
  avatarColor?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  avatarColor?: string;
}
