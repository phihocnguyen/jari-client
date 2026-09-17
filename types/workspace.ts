// ─── Workspace Types ──────────────────────────────────────────────
export interface Workspace {
  id: string;
  name: string;
  workspaceKey: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  role?: WorkspaceRole;
}

export type WorkspaceRole = 'WORKSPACE_ADMIN' | 'WORKSPACE_MEMBER' | 'WORKSPACE_VIEWER';

export interface WorkspaceMember {
  userId: string;
  fullName: string;
  displayName?: string;
  email: string;
  avatarUrl?: string;
  role: WorkspaceRole;
  joinedAt: string;
  projectIds?: string[];
  projectNames?: string[];
}

export interface CreateWorkspaceRequest {
  name: string;
  workspaceKey: string;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
}

export interface InviteMemberRequest {
  userId?: string;
  email?: string;
  roleName: WorkspaceRole;
  projectIds?: string[];
}

export interface UpdateMemberRoleRequest {
  roleName: WorkspaceRole;
}

export interface UpdateMemberProjectsRequest {
  projectIds: string[];
}
