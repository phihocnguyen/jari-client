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
  leadId?: string;
  leadName?: string;
  leadEmail?: string;
  leadAvatarUrl?: string;
  defaultAssignee?: 'UNASSIGNED' | 'PROJECT_LEAD';
  projectType?: ProjectType;
  avatarUrl?: string;
  avatarIcon?: string;
  avatarColor?: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  role?: ProjectRole;
}

export interface ProjectMember {
  userId: string;
  fullName: string;
  displayName?: string;
  email: string;
  avatarUrl?: string;
  role: ProjectRole;
  joinedAt?: string;
}

export interface CreateProjectRequest {
  name: string;
  projectKey: string;
  description?: string;
  leadId?: string;
  projectType?: ProjectType;
  avatarIcon?: string;
  avatarColor?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  leadId?: string;
  status?: ProjectStatus;
  defaultAssignee?: 'UNASSIGNED' | 'PROJECT_LEAD';
  avatarIcon?: string;
  avatarColor?: string;
}

export interface AddProjectMemberRequest {
  userId?: string;
  email?: string;
  roleName: ProjectRole;
}

export interface UpdateProjectMemberRoleRequest {
  roleName: ProjectRole;
}

