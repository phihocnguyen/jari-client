'use client';

import React from 'react';

export function BoardSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '100%',
        animation: 'boardFadeIn 0.25s ease-out forwards',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes boardFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Board
          </h1>
          <div className="skeleton" style={{ width: '120px', height: '26px', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="skeleton" style={{ width: '110px', height: '32px', borderRadius: '6px' }} />
        </div>
      </div>

      {/* Filter Bar Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div className="skeleton" style={{ width: '220px', height: '34px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ width: '110px', height: '32px', borderRadius: '20px' }} />
        <div className="skeleton" style={{ width: '120px', height: '32px', borderRadius: '20px' }} />
      </div>

      {/* Kanban Columns Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
        }}
      >
        {['TO DO', 'IN PROGRESS', 'IN REVIEW', 'DONE'].map((colName, colIdx) => (
          <div
            key={colIdx}
            style={{
              backgroundColor: '#F4F5F7',
              borderRadius: '8px',
              padding: '12px 10px',
              minHeight: '480px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#5E6C84', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {colName}
              </span>
              <div className="skeleton" style={{ width: '22px', height: '18px', borderRadius: '10px' }} />
            </div>

            {/* Column Cards */}
            {Array.from({ length: colIdx === 0 ? 3 : colIdx === 1 ? 2 : 1 }).map((_, cardIdx) => (
              <div
                key={cardIdx}
                className="card"
                style={{
                  padding: '12px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  boxShadow: '0 1px 2px rgba(9, 30, 66, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {/* Title lines */}
                <div className="skeleton" style={{ width: cardIdx % 2 === 0 ? '85%' : '70%', height: '14px', borderRadius: '4px' }} />
                <div className="skeleton" style={{ width: '45%', height: '12px', borderRadius: '3px' }} />

                {/* Footer with key, priority, avatar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="skeleton" style={{ width: '14px', height: '14px', borderRadius: '2px' }} />
                    <div className="skeleton" style={{ width: '50px', height: '14px', borderRadius: '3px' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="skeleton" style={{ width: '14px', height: '14px', borderRadius: '2px' }} />
                    <div className="skeleton" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
