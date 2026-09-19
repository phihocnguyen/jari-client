'use client';

import React from 'react';

export function SkeletonIssueRow({ widthPercent = 60 }: { widthPercent?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #EBECF0',
        borderRadius: '6px',
        gap: '12px',
      }}
    >
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
        <div className="skeleton" style={{ width: '16px', height: '16px', borderRadius: '3px', flexShrink: 0 }} />
        <div className="skeleton" style={{ width: '16px', height: '16px', borderRadius: '3px', flexShrink: 0 }} />
        <div className="skeleton" style={{ width: '65px', height: '16px', borderRadius: '4px', flexShrink: 0 }} />
        <div className="skeleton" style={{ width: `${widthPercent}%`, height: '16px', borderRadius: '4px', maxWidth: '400px' }} />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div className="skeleton" style={{ width: '70px', height: '22px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
        <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
      </div>
    </div>
  );
}

export function BacklogSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', userSelect: 'none' }}>
      {/* Filter Bar Skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div className="skeleton" style={{ width: '200px', height: '34px', borderRadius: '6px' }} />
          {/* Filter dropdowns */}
          <div className="skeleton" style={{ width: '90px', height: '34px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ width: '80px', height: '34px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ width: '85px', height: '34px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ width: '80px', height: '34px', borderRadius: '6px' }} />
        </div>
      </div>

      {/* Sprint Card Skeleton */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #DFE1E6',
          overflow: 'hidden',
        }}
      >
        {/* Sprint Header */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: '#F1F2F4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #DFE1E6',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="skeleton" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '140px', height: '18px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '60px', height: '18px', borderRadius: '12px' }} />
            <div className="skeleton" style={{ width: '110px', height: '14px', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="skeleton" style={{ width: '88px', height: '28px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Sprint Items */}
        <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <SkeletonIssueRow widthPercent={55} />
          <SkeletonIssueRow widthPercent={70} />
          <SkeletonIssueRow widthPercent={45} />
        </div>
      </div>

      {/* Backlog Section Skeleton */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #DFE1E6',
          overflow: 'hidden',
        }}
      >
        {/* Backlog Header */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: '#F1F2F4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #DFE1E6',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="skeleton" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '80px', height: '18px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '90px', height: '14px', borderRadius: '4px' }} />
          </div>
          <div className="skeleton" style={{ width: '100px', height: '28px', borderRadius: '4px' }} />
        </div>

        {/* Backlog Items */}
        <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <SkeletonIssueRow widthPercent={65} />
          <SkeletonIssueRow widthPercent={50} />
          <SkeletonIssueRow widthPercent={75} />
          <SkeletonIssueRow widthPercent={40} />
        </div>
      </div>
    </div>
  );
}
