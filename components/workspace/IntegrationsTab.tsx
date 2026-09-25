'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GitBranch, Link2, Unlink, ExternalLink, AlertCircle } from 'lucide-react';
import { githubApi } from '@/lib/api/github';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { Project } from '@/types/project';

interface IntegrationsTabProps {
  workspaceId: string;
  projects: Project[];
  isAdmin: boolean;
}

export function IntegrationsTab({ workspaceId, projects, isAdmin }: IntegrationsTabProps) {
  const qc = useQueryClient();

  const { data: installations = [], isLoading, isError, error } = useQuery({
    queryKey: ['github-installations', workspaceId],
    queryFn: () => githubApi.listInstallations(workspaceId),
    enabled: Boolean(workspaceId) && isAdmin,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('github') === 'connected') {
      toast.success('GitHub connected', 'Map each repository to a Jari project to enable linking.');
      qc.invalidateQueries({ queryKey: ['github-installations', workspaceId] });
      params.delete('github');
      const next = `${window.location.pathname}?tab=integrations`;
      window.history.replaceState({}, '', next);
    }
  }, [workspaceId, qc]);

  const connectMutation = useMutation({
    mutationFn: () => githubApi.getInstallUrl(workspaceId),
    onSuccess: (data) => {
      const url = (data as { url?: string })?.url;
      if (!url) {
        toast.error('GitHub App is not configured on the server');
        return;
      }
      window.location.href = url;
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to start GitHub install';
      toast.error(msg);
    },
  });

  const mapMutation = useMutation({
    mutationFn: ({ repoId, projectId }: { repoId: string; projectId: string | null }) =>
      githubApi.mapRepo(workspaceId, repoId, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['github-installations', workspaceId] });
      toast.success('Repository mapping updated');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update mapping';
      toast.error(msg);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (installationId: string) => githubApi.disconnect(workspaceId, installationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['github-installations', workspaceId] });
      toast.success('GitHub installation disconnected');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to disconnect';
      toast.error(msg);
    },
  });

  if (!isAdmin) {
    return (
      <div
        style={{
          padding: '1.5rem',
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.08)',
          background: '#fff',
          color: 'var(--color-text-secondary)',
          fontSize: '0.875rem',
        }}
      >
        Only workspace owners and admins can manage GitHub integrations.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.08)',
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: '#24292F',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <GitBranch size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                GitHub
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 4, maxWidth: 520 }}>
                Install the Jari GitHub App, then map each repository to a project. Branches, commits, and
                pull requests that mention an issue key (e.g. APP-1) will appear on that ticket&apos;s Development
                panel.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => connectMutation.mutate()}
            loading={connectMutation.isPending}
            leftIcon={<Link2 size={15} />}
          >
            {installations.length > 0 ? 'Add installation' : 'Connect GitHub'}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading installations…
        </div>
      )}

      {isError && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            padding: '12px 14px',
            borderRadius: 6,
            background: '#FFEBE6',
            color: '#DE350B',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={16} />
          {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to load GitHub installations. Ensure the GitHub App env vars are configured.'}
        </div>
      )}

      {!isLoading && !isError && installations.length === 0 && (
        <div
          style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            borderRadius: 8,
            border: '1.5px dashed rgba(0,0,0,0.12)',
            background: '#fff',
            color: 'var(--color-text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          No GitHub installations yet. Click <strong>Connect GitHub</strong> to install the app on your
          organization or account.
        </div>
      )}

      {installations.map((inst) => (
        <div
          key={inst.id}
          style={{
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.08)',
            background: '#fff',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              background: '#FAFBFC',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GitBranch size={16} />
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#172B4D' }}>
                {inst.accountLogin}
              </span>
              {inst.accountType && (
                <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                  {inst.accountType}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm(`Disconnect GitHub installation for ${inst.accountLogin}?`)) {
                  disconnectMutation.mutate(inst.id);
                }
              }}
              loading={disconnectMutation.isPending}
              leftIcon={<Unlink size={14} />}
            >
              Disconnect
            </Button>
          </div>

          {inst.repos.length === 0 ? (
            <div style={{ padding: '1.25rem 16px', color: '#626F86', fontSize: '0.8125rem' }}>
              No repositories in this installation. Reconfigure the GitHub App install to grant repo access.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #EBECF0' }}>
                  <th style={{ textAlign: 'left', padding: '8px 16px', color: '#44546F', fontWeight: 600 }}>
                    Repository
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 16px', color: '#44546F', fontWeight: 600 }}>
                    Projects
                  </th>
                </tr>
              </thead>
              <tbody>
                {inst.repos.map((repo) => (
                  <tr key={repo.id} style={{ borderBottom: '1px solid #F4F5F7' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <a
                        href={repo.htmlUrl || `https://github.com/${repo.fullName}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#0C66E4',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {repo.fullName}
                        <ExternalLink size={12} />
                      </a>
                      {!repo.projectId && (
                        <div style={{ fontSize: '0.75rem', color: '#FF8B00', marginTop: 2 }}>Unmapped</div>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <select
                        value={repo.projectId ?? ''}
                        disabled={mapMutation.isPending}
                        onChange={(e) => {
                          const value = e.target.value;
                          mapMutation.mutate({
                            repoId: repo.id,
                            projectId: value ? value : null,
                          });
                        }}
                        style={{
                          height: 32,
                          minWidth: 200,
                          padding: '0 8px',
                          borderRadius: 4,
                          border: '1px solid #DFE1E6',
                          fontSize: '0.8125rem',
                          color: '#172B4D',
                          background: '#fff',
                        }}
                      >
                        <option value="">Not mapped</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.projectKey || p.key})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
