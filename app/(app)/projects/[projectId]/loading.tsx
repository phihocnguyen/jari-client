export default function ProjectLoading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '100%',
        animation: 'projectFadeIn 0.3s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes projectFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, #E2E8F0 25%, #EDF2F7 50%, #E2E8F0 75%);
          background-size: 200% 100%;
          animation: skeletonShimmer 1.5s infinite, skeletonPulse 2s infinite ease-in-out;
        }
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Top Header Skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            className="skeleton-shimmer"
            style={{ width: 140, height: 14, borderRadius: 4 }}
          />
          <div
            className="skeleton-shimmer"
            style={{ width: 220, height: 32, borderRadius: 6 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="skeleton-shimmer"
            style={{ width: 100, height: 34, borderRadius: 6 }}
          />
          <div
            className="skeleton-shimmer"
            style={{ width: 110, height: 34, borderRadius: 6 }}
          />
        </div>
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 0',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div
          className="skeleton-shimmer"
          style={{ width: 240, height: 32, borderRadius: 6 }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="skeleton-shimmer"
              style={{ width: 30, height: 30, borderRadius: '50%' }}
            />
          ))}
        </div>
        <div
          className="skeleton-shimmer"
          style={{ width: 80, height: 26, borderRadius: 14 }}
        />
      </div>

      {/* Board Columns Skeleton (4 Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))',
          gap: '1rem',
          marginTop: '0.5rem',
        }}
      >
        {[
          { title: 'TO DO', count: 3 },
          { title: 'IN PROGRESS', count: 2 },
          { title: 'REVIEW', count: 1 },
          { title: 'DONE', count: 2 },
        ].map((col, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#F4F5F7',
              borderRadius: 8,
              padding: '12px 10px',
              minHeight: '65vh',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Column Header Skeleton */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 6px' }}>
              <div
                className="skeleton-shimmer"
                style={{ width: 90, height: 16, borderRadius: 4 }}
              />
              <div
                className="skeleton-shimmer"
                style={{ width: 24, height: 18, borderRadius: 10 }}
              />
            </div>

            {/* Column Cards Skeleton */}
            {Array.from({ length: col.count }).map((_, cIdx) => (
              <div
                key={cIdx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 6,
                  padding: 12,
                  boxShadow: '0 1px 2px rgba(9, 30, 66, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  className="skeleton-shimmer"
                  style={{ width: '85%', height: 16, borderRadius: 4 }}
                />
                <div
                  className="skeleton-shimmer"
                  style={{ width: '60%', height: 12, borderRadius: 4 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <div
                    className="skeleton-shimmer"
                    style={{ width: 50, height: 14, borderRadius: 4 }}
                  />
                  <div
                    className="skeleton-shimmer"
                    style={{ width: 22, height: 22, borderRadius: '50%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
