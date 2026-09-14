import { Avatar } from '@/components/ui/Avatar';

// ─── Server Component (SSR) ────────────────────────────────────────
export function RecentActivityWidget() {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent activity</h2>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
        Stay up to date with what&apos;s happening across the project.
      </p>

      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
        Today
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Activity Item 1 */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Avatar name="Jane Rotanson" size={32} />
          <div style={{ fontSize: '0.8125rem', lineHeight: 1.45 }}>
            <div>
              <span style={{ fontWeight: 600 }}>Jane Rotanson</span> changed status to <span style={{ fontWeight: 600 }}>Done</span> on{' '}
              <span style={{ color: 'var(--color-green-accent)', fontWeight: 600 }}>TIC-186 Team 24 design support</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>Just now</div>
          </div>
        </div>

        {/* Activity Item 2 */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Avatar name="Peter Andre" size={32} />
          <div style={{ fontSize: '0.8125rem', lineHeight: 1.45 }}>
            <div>
              <span style={{ fontWeight: 600 }}>Peter Andre</span> made 2 updates on{' '}
              <span style={{ color: 'var(--color-green-accent)', fontWeight: 600 }}>TIC-249 Approvals to software</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>about 15 hours ago</div>
          </div>
        </div>

        {/* Activity Item 3 with Quote Box */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Avatar name="Lucy Peters" size={32} />
          <div style={{ fontSize: '0.8125rem', lineHeight: 1.45, flex: 1 }}>
            <div>
              <span style={{ fontWeight: 600 }}>Lucy Peters</span> updated the description of{' '}
              <span style={{ color: 'var(--color-green-accent)', fontWeight: 600 }}>TIC-200 Budget tools</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 2, marginBottom: 8 }}>
              about 20 hours ago
            </div>

            {/* Quoted Box Snippet */}
            <div style={{
              backgroundColor: '#FAF9F6',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: '0.78125rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.4,
            }}>
              Request for design support to mock a potential future experience to make a case for public forms. Mocks included for the design within the file in{' '}
              <span style={{ color: 'var(--color-green-accent)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                https://hello.atlassian.net/wiki/spaces/Spork/pageid7580671230
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
