'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Plus,
  Layers,
  User as UserIcon,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  AlertCircle,
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { componentApi } from '@/lib/api/component';
import type { ProjectComponent, CreateComponentInput, UpdateComponentInput } from '@/types/component';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectComponentsPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  const projectId = resolvedParams?.projectId ?? '';

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ProjectComponent | null>(null);
  const [deletingComponent, setDeletingComponent] = useState<ProjectComponent | null>(null);

  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLeadId, setFormLeadId] = useState('');

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then(r => r.data) : null),
    enabled: Boolean(projectId),
  });

  const { data: components = [], isLoading } = useQuery({
    queryKey: ['project-components', projectId],
    queryFn: () => (projectId ? componentApi.list(projectId) : []),
    enabled: Boolean(projectId),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => (projectId ? projectApi.listMembers(projectId).then(r => r.data ?? []) : []),
    enabled: Boolean(projectId),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateComponentInput) => componentApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-components', projectId] });
      toast.success('Component created successfully');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create component');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateComponentInput }) => componentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-components', projectId] });
      toast.success('Component updated successfully');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update component');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => componentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-components', projectId] });
      toast.success('Component deleted successfully');
      setDeletingComponent(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete component');
    },
  });

  const openCreateModal = () => {
    setFormName('');
    setFormDesc('');
    setFormLeadId('');
    setEditingComponent(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (comp: ProjectComponent) => {
    setEditingComponent(comp);
    setFormName(comp.name);
    setFormDesc(comp.description || '');
    setFormLeadId(comp.lead?.id || '');
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingComponent(null);
    setFormName('');
    setFormDesc('');
    setFormLeadId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Component name is required');
      return;
    }

    if (editingComponent) {
      updateMutation.mutate({
        id: editingComponent.id,
        data: {
          name: formName.trim(),
          description: formDesc.trim() || undefined,
          leadId: formLeadId || undefined,
        },
      });
    } else {
      createMutation.mutate({
        name: formName.trim(),
        description: formDesc.trim() || undefined,
        leadId: formLeadId || undefined,
      });
    }
  };

  if (!projectId) return null;

  const filteredComponents = components.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Components
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Group your issues into distinct modules, features, or architecture components for {project?.name || 'this project'}.
          </p>
        </div>

        <Button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Create component
        </Button>
      </div>

      {/* Sub-nav Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', gap: 16 }}>
        <button
          type="button"
          style={{
            padding: '8px 2px',
            border: 'none',
            background: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: '#0c66e4',
            borderBottom: '2px solid #0c66e4',
            cursor: 'pointer',
          }}
        >
          All components
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 34px',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.15)',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: 'var(--color-surface-white)',
              }}
            />
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {filteredComponents.length} {filteredComponents.length === 1 ? 'component' : 'components'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f2f4', borderRadius: 6, padding: 2 }}>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            title="Table view"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              borderRadius: 4,
              border: 'none',
              backgroundColor: viewMode === 'table' ? 'var(--color-surface-white)' : 'transparent',
              color: viewMode === 'table' ? '#0c66e4' : '#626f86',
              boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              gap: 4,
            }}
          >
            <LayoutList size={14} />
            <span>Table</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            title="Grid view"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              borderRadius: 4,
              border: 'none',
              backgroundColor: viewMode === 'cards' ? 'var(--color-surface-white)' : 'transparent',
              color: viewMode === 'cards' ? '#0c66e4' : '#626f86',
              boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              gap: 4,
            }}
          >
            <LayoutGrid size={14} />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading components...
        </div>
      ) : filteredComponents.length === 0 ? (
        <div
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface-white)',
            borderRadius: 12,
            border: '1px dashed rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ padding: 16, borderRadius: '50%', backgroundColor: '#e9f2ff', color: '#0c66e4' }}>
            <Layers size={36} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
            {searchQuery ? 'No components found matching your search' : 'No components created yet'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: 460, lineHeight: 1.5 }}>
            Components help organize your project into sub-sections like Frontend, Backend, API, Database, or specific features.
          </p>
          {!searchQuery && (
            <Button onClick={openCreateModal} style={{ marginTop: 8 }}>
              <Plus size={16} /> Create your first component
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--color-surface-white)',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.84rem',
              backgroundColor: 'var(--color-surface-white)',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', backgroundColor: 'var(--color-surface-white)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#44546f', backgroundColor: 'var(--color-surface-white)' }}>Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#44546f', backgroundColor: 'var(--color-surface-white)' }}>Description</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#44546f', backgroundColor: 'var(--color-surface-white)' }}>Component lead</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#44546f', backgroundColor: 'var(--color-surface-white)' }}>Issues linked</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#44546f', textAlign: 'right', backgroundColor: 'var(--color-surface-white)' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--color-surface-white)' }}>
              {filteredComponents.map((comp) => {
                const leadName = comp.lead?.displayName || comp.lead?.fullName || comp.lead?.username || 'Unassigned';
                return (
                  <tr
                    key={comp.id}
                    style={{
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                      transition: 'background-color 0.12s ease',
                      backgroundColor: 'var(--color-surface-white)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-white)')}
                  >
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', backgroundColor: 'inherit' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            backgroundColor: '#e9f2ff',
                            color: '#0c66e4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Layers size={16} />
                        </div>
                        <Link
                          href={`/projects/${projectId}/list?component=${comp.id}`}
                          style={{
                            fontWeight: 600,
                            color: '#0c66e4',
                            textDecoration: 'none',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                        >
                          {comp.name}
                        </Link>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', color: comp.description ? '#44546f' : '#a5adba', maxWidth: 320, backgroundColor: 'inherit' }}>
                      {comp.description || '—'}
                    </td>

                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', backgroundColor: 'inherit' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {comp.lead ? (
                          <Avatar name={leadName} size={22} />
                        ) : (
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              backgroundColor: '#f1f2f4',
                              color: '#626f86',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <UserIcon size={12} />
                          </div>
                        )}
                        <span style={{ color: comp.lead ? '#172b4d' : '#626f86', fontWeight: comp.lead ? 500 : 400 }}>
                          {leadName}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', backgroundColor: 'inherit' }}>
                      <Link
                        href={`/projects/${projectId}/list?component=${comp.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          color: '#0c66e4',
                          fontWeight: 600,
                          textDecoration: 'none',
                          backgroundColor: '#e9f2ff',
                          padding: '3px 8px',
                          borderRadius: 12,
                          fontSize: '0.75rem',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        <span>{comp.issueCount} {comp.issueCount === 1 ? 'issue' : 'issues'}</span>
                        <ExternalLink size={11} />
                      </Link>
                    </td>

                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right', backgroundColor: 'inherit' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(comp)}
                          title="Edit component"
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 6,
                            borderRadius: 4,
                            cursor: 'pointer',
                            color: '#626f86',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingComponent(comp)}
                          title="Delete component"
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 6,
                            borderRadius: 4,
                            cursor: 'pointer',
                            color: '#de350b',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffebe6')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem', width: '100%' }}>
          {filteredComponents.map((comp) => {
            const leadName = comp.lead?.displayName || comp.lead?.fullName || comp.lead?.username || 'Unassigned';
            return (
              <div
                key={comp.id}
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 10,
                  backgroundColor: 'var(--color-surface-white)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: '#e9f2ff',
                          color: '#0c66e4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Layers size={20} />
                      </div>
                      <div>
                        <Link
                          href={`/projects/${projectId}/list?component=${comp.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                        >
                          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                            {comp.name}
                          </h2>
                        </Link>
                        <Link
                          href={`/projects/${projectId}/list?component=${comp.id}`}
                          style={{
                            fontSize: '0.75rem',
                            color: '#0c66e4',
                            textDecoration: 'none',
                            fontWeight: 500,
                          }}
                        >
                          {comp.issueCount} {comp.issueCount === 1 ? 'issue' : 'issues'} linked
                        </Link>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(comp)}
                        title="Edit component"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 6,
                          borderRadius: 4,
                          cursor: 'pointer',
                          color: '#626f86',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingComponent(comp)}
                        title="Delete component"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 6,
                          borderRadius: 4,
                          cursor: 'pointer',
                          color: '#de350b',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffebe6')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: comp.description ? 'var(--color-text-secondary)' : '#a5adba',
                      lineHeight: 1.45,
                      marginBottom: '1.25rem',
                      minHeight: '2.5rem',
                      fontStyle: comp.description ? 'normal' : 'italic',
                    }}
                  >
                    {comp.description || 'No description provided.'}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    paddingTop: '0.75rem',
                    marginTop: 'auto',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {comp.lead ? (
                      <Avatar name={leadName} size={24} />
                    ) : (
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: '#f1f2f4',
                          color: '#626f86',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <UserIcon size={13} />
                      </div>
                    )}
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      Lead: <span style={{ color: 'var(--color-text-primary)' }}>{leadName}</span>
                    </span>
                  </div>

                  <Link
                    href={`/projects/${projectId}/list?component=${comp.id}`}
                    style={{
                      fontSize: '0.75rem',
                      color: '#0c66e4',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    <span>View issues ({comp.issueCount})</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal — portal via shared Modal (z-index 200) */}
      <Modal
        open={isCreateModalOpen}
        onClose={closeModal}
        title={editingComponent ? 'Edit component' : 'Create component'}
        size="sm"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#44546f', marginBottom: 6 }}>
              Name <span style={{ color: '#de350b' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. UI Engine, Authentication, API"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.15)',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: 'var(--color-surface-white)',
              }}
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#44546f', marginBottom: 6 }}>
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the scope or purpose of this component..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.15)',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
                backgroundColor: 'var(--color-surface-white)',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#44546f', marginBottom: 6 }}>
              Component Lead
            </label>
            <select
              value={formLeadId}
              onChange={(e) => setFormLeadId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.15)',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: 'var(--color-surface-white)',
              }}
            >
              <option value="">No component lead</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.displayName || m.fullName || m.email || m.userId}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingComponent ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deletingComponent)}
        onClose={() => setDeletingComponent(null)}
        title="Delete component?"
        size="sm"
      >
        {deletingComponent && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: '#de350b' }}>
              <AlertCircle size={28} />
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#44546f', lineHeight: 1.5 }}>
                Are you sure you want to delete component <strong>{deletingComponent.name}</strong>?
                This will remove the component from all linked issues, but will not delete the issues themselves.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button type="button" variant="ghost" onClick={() => setDeletingComponent(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingComponent.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
