// ─── Server Component (SSR) ────────────────────────────────────────
interface ProjectSummaryHeaderProps {
  projectName?: string;
}

export function ProjectSummaryHeader({ projectName }: ProjectSummaryHeaderProps) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
        Projects
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, backgroundColor: '#EAB308',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '0.875rem',
        }}>
          H
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {projectName || 'Horizon'}
        </h1>
      </div>
    </div>
  );
}
