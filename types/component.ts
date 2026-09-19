export interface ComponentLead {
  id: string;
  username?: string;
  displayName?: string;
  fullName?: string;
  avatarUrl?: string;
  email?: string;
}

export interface ProjectComponent {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  lead?: ComponentLead;
  issueCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComponentInput {
  name: string;
  description?: string;
  leadId?: string;
}

export interface UpdateComponentInput {
  name?: string;
  description?: string;
  leadId?: string;
}
