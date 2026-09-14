// ─── Workspace Types ──────────────────────────────────────────────
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  role?: WorkspaceRole;
}

export type WorkspaceRole = 'WORKSPACE_ADMIN' | 'WORKSPACE_MEMBER' | 'WORKSPACE_VIEWER';

export interface WorkspaceMember {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  slug: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  slug?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: WorkspaceRole;
}

export interface UpdateMemberRoleRequest {
  role: WorkspaceRole;
}
