export type DevelopmentType = 'COMMIT' | 'PULL_REQUEST' | 'BRANCH';

export interface IssueDevelopment {
  id: string;
  issueId: string;
  type: DevelopmentType;
  repoUrl?: string;
  title: string;
  url: string;
  status?: string;
  author?: string;
  createdAt: string;
}

export interface CreateDevelopmentInput {
  type: DevelopmentType;
  repoUrl?: string;
  title: string;
  url: string;
  status?: string;
  author?: string;
}
