'use client';

import React from 'react';

export function SummarySkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '100%',
        animation: 'summaryFadeIn 0.25s ease-out forwards',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes summaryFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Summary
        </h1>
      </div>

      {/* Metric Cards Row Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '0.5rem',
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              backgroundColor: '#FFFFFF',
            }}
          >
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="skeleton" style={{ width: '60%', height: 16, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column Dashboard Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: '1.5rem',
              height: '380px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Widget Header Skeleton */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div className="skeleton" style={{ width: 140, height: 20, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4 }} />
            </div>

            {/* Widget Content Body Skeleton */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
              <div className="skeleton" style={{ width: '100%', height: 32, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: '85%', height: 24, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: '70%', height: 24, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: '90%', height: 20, borderRadius: 4 }} />
            </div>

            {/* Widget Footer Skeleton */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
              <div className="skeleton" style={{ width: 80, height: 16, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
