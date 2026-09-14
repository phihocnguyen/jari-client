'use client';

// ─── Skeleton Component ───────────────────────────────────────────
interface SkeletonProps {
  width?:   string | number;
  height?:  string | number;
  rounded?: boolean | string;
  className?: string;
}

export function Skeleton({ width = '100%', height = 16, rounded = true, className = '' }: SkeletonProps) {
  const borderRadius = typeof rounded === 'string' ? rounded : rounded ? 'var(--radius-md)' : '0';
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} />
      <Skeleton height={14} width="80%" />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
        <Skeleton width={60} height={22} rounded="var(--radius-pill)" />
        <Skeleton width={80} height={22} rounded="var(--radius-pill)" />
      </div>
    </div>
  );
}

// ─── Skeleton Issue Row ───────────────────────────────────────────
export function SkeletonIssueRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <Skeleton width={20} height={20} rounded="var(--radius-sm)" />
      <Skeleton width={60} height={14} />
      <Skeleton height={14} />
      <Skeleton width={24} height={24} rounded="50%" />
    </div>
  );
}
