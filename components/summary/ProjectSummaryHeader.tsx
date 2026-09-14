// ─── Server Component (SSR) ────────────────────────────────────────
interface ProjectSummaryHeaderProps {
  projectName?: string;
}

export function ProjectSummaryHeader({ projectName }: ProjectSummaryHeaderProps) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        Projects
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, backgroundColor: '#00754A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '0.9375rem',
        }}>
          {projectName ? projectName.charAt(0).toUpperCase() : 'T'}
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-green-brand)', letterSpacing: '-0.02em' }}>
          {projectName || 'Teams in Space'}
        </h1>
      </div>
    </div>
  );
}
