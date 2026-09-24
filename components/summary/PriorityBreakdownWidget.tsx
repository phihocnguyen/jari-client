'use client';

import { useState } from 'react';
import { ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from 'lucide-react';
import type { PriorityCount } from '@/types/summary';

interface PriorityBreakdownWidgetProps {
  projectId?: string;
  priorityBreakdown?: PriorityCount[];
  isLoading?: boolean;
}

const STANDARD_PRIORITIES = [
  {
    key: 'HIGHEST',
    label: 'Highest',
    color: '#DC2626',
    icon: <ChevronsUp size={13} color="#DC2626" style={{ flexShrink: 0 }} />,
  },
  {
    key: 'HIGH',
    label: 'High',
    color: '#EA580C',
    icon: <ChevronUp size={13} color="#EA580C" style={{ flexShrink: 0 }} />,
  },
  {
    key: 'MEDIUM',
    label: 'Medium',
    color: '#D97706',
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M3 6h10M3 10h10" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'LOW',
    label: 'Low',
    color: '#2563EB',
    icon: <ChevronDown size={13} color="#2563EB" style={{ flexShrink: 0 }} />,
  },
  {
    key: 'LOWEST',
    label: 'Lowest',
    color: '#0284C7',
    icon: <ChevronsDown size={13} color="#0284C7" style={{ flexShrink: 0 }} />,
  },
];

function getTicksAndMax(maxCount: number) {
  if (maxCount <= 22) {
    return { topTick: 20, ticks: [20, 15, 10, 5, 0] };
  }
  const step = Math.max(5, Math.ceil(maxCount / 4 / 5) * 5);
  return {
    topTick: step * 4,
    ticks: [step * 4, step * 3, step * 2, step, 0],
  };
}

export function PriorityBreakdownWidget({ priorityBreakdown, isLoading }: PriorityBreakdownWidgetProps) {
  const [hoveredPriority, setHoveredPriority] = useState<string | null>(null);

  // Map incoming data
  const countMap = new Map<string, number>();
  (priorityBreakdown ?? []).forEach((item) => {
    countMap.set(item.priority.toUpperCase(), item.count);
  });

  const columns = STANDARD_PRIORITIES.map((p) => ({
    ...p,
    count: countMap.get(p.key) ?? 0,
  }));

  const maxCount = Math.max(...columns.map((c) => c.count), 0);
  const { topTick, ticks } = getTicksAndMax(maxCount);

  // Height of chart plotting area in px
  const chartHeight = 150;

  return (
    <div className="card" style={{ padding: '1.5rem', height: '380px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ marginBottom: 4 }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Priority breakdown</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Get a holistic view of how work is being prioritized.
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 4 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem 0', fontSize: '0.875rem' }}>
            Loading priorities...
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Chart Container: Y-Axis + Grid + Columns */}
            <div style={{ display: 'flex', position: 'relative' }}>
              {/* Left Y-Axis Labels */}
              <div
                style={{
                  width: 30,
                  height: chartHeight,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  paddingRight: 8,
                  fontSize: '0.6875rem',
                  color: 'var(--color-text-secondary)',
                  userSelect: 'none',
                }}
              >
                {ticks.map((tickVal) => (
                  <span key={tickVal} style={{ lineHeight: 1 }}>
                    {tickVal}
                  </span>
                ))}
              </div>

              {/* Chart Plot Area with Grid Lines */}
              <div
                style={{
                  flex: 1,
                  height: chartHeight,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                {/* Horizontal Grid Lines */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {ticks.map((tickVal, i) => (
                    <div
                      key={tickVal}
                      style={{
                        width: '100%',
                        borderBottom: i === ticks.length - 1 ? '1.5px solid #7A869A' : '1px solid #EBECF0',
                        position: 'relative',
                      }}
                    >
                      {/* Left tick notch */}
                      <span
                        style={{
                          position: 'absolute',
                          left: -5,
                          top: -1,
                          width: 5,
                          height: 1,
                          backgroundColor: i === ticks.length - 1 ? '#7A869A' : '#D1D5DB',
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* 5 Priority Columns */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    alignItems: 'flex-end',
                  }}
                >
                  {columns.map((col) => {
                    const rawHeight = topTick > 0 ? (col.count / topTick) * chartHeight : 0;
                    // Cap visually so it doesn't break parent container, but allows slight overflow like in Jira image
                    const barHeight = Math.min(rawHeight, chartHeight + 16);
                    const isHovered = hoveredPriority === col.key;

                    return (
                      <div
                        key={col.key}
                        onMouseEnter={() => setHoveredPriority(col.key)}
                        onMouseLeave={() => setHoveredPriority(null)}
                        style={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          position: 'relative',
                          cursor: col.count > 0 ? 'pointer' : 'default',
                        }}
                      >
                        {/* Interactive Tooltip */}
                        {isHovered && col.count > 0 && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: barHeight + 8,
                              backgroundColor: '#172B4D',
                              color: '#fff',
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              pointerEvents: 'none',
                              zIndex: 10,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            }}
                          >
                            {col.label}: {col.count}
                          </div>
                        )}

                        {/* Bar */}
                        {col.count > 0 ? (
                          <div
                            style={{
                              width: 'min(42px, 60%)',
                              height: `${barHeight}px`,
                              backgroundColor: isHovered ? '#6B778C' : '#7A869A',
                              borderRadius: '2px 2px 0 0',
                              transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease',
                            }}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Baseline Tick Notches between Columns */}
            <div style={{ display: 'flex', marginLeft: 30, height: 6 }}>
              <div
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                }}
              >
                {columns.map((col, idx) => (
                  <div
                    key={col.key}
                    style={{
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Tick mark under column center on the baseline */}
                    <span
                      style={{
                        position: 'absolute',
                        top: 0,
                        width: 1,
                        height: 4,
                        backgroundColor: '#7A869A',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* X-Axis Labels */}
            <div
              style={{
                marginLeft: 30,
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                paddingTop: 4,
              }}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    fontSize: '0.75rem',
                    color: 'var(--color-text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.icon}
                  <span>{col.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
