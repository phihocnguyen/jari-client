'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, ChevronsUp } from 'lucide-react';

export function SprintTimeline() {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div style={{
      backgroundColor: 'var(--color-surface-white)',
      borderRadius: 'var(--radius-card)',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
      overflow: 'visible',
    }}>
      {/* Header controls & Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2,
      }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: 28, height: 28, padding: 0, borderRadius: '50%' }}
          aria-label="Previous timeline period"
        >
          <ChevronLeft size={18} color="var(--color-green-brand)" />
        </button>

        {/* Floating Tooltip Card on Milestone 18 */}
        {showTooltip && (
          <div
            style={{
              position: 'absolute',
              top: -65,
              left: '52%',
              transform: 'translateX(-50%)',
              backgroundColor: '#FEF9C3',
              border: '1px solid #FDE047',
              borderRadius: '12px',
              padding: '10px 14px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              width: 220,
              zIndex: 10,
              cursor: 'pointer',
              transition: 'var(--transition-base)',
            }}
            onClick={() => setShowTooltip(v => !v)}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#854D0E', marginBottom: 2 }}>
              IA task end on 18 Mar
            </div>
            <div style={{ fontSize: '0.7rem', color: '#A16207', marginBottom: 6 }}>
              50% completed
            </div>

            {/* Progress bar line */}
            <div style={{ width: '100%', height: 4, borderRadius: 2, backgroundColor: '#FEF08A', marginBottom: 8, overflow: 'hidden' }}>
              <div style={{ width: '50%', height: '100%', backgroundColor: '#EAB308' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} color="#0284C7" />
                <ChevronsUp size={14} color="#DC2626" />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#854D0E' }}>3</span>
              </div>
              <ChevronRight size={14} color="#854D0E" />
            </div>

            {/* Bottom tooltip arrow */}
            <div style={{
              position: 'absolute',
              bottom: -6,
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 10,
              height: 10,
              backgroundColor: '#FEF9C3',
              borderRight: '1px solid #FDE047',
              borderBottom: '1px solid #FDE047',
            }} />
          </div>
        )}

        <button
          className="btn btn-ghost btn-sm"
          style={{ width: 28, height: 28, padding: 0, borderRadius: '50%' }}
          aria-label="Next timeline period"
        >
          <ChevronRight size={18} color="var(--color-green-brand)" />
        </button>
      </div>

      {/* Timeline Axis */}
      <div style={{ marginTop: '0.5rem', position: 'relative' }}>
        {/* Horizontal Line */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: 40,
          right: 40,
          height: 2,
          backgroundColor: '#E5E7EB',
          zIndex: 0,
        }} />

        {/* Milestone Pins Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          position: 'relative',
          zIndex: 1,
          marginBottom: 10,
        }}>
          {/* 28 Feb */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%', backgroundColor: '#22C55E', color: '#fff',
              fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>1</span>
          </div>

          {/* 7 Mar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%', backgroundColor: '#16A34A', color: '#fff',
              fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>4</span>
          </div>

          {/* Today 8 Mar Callout Pin */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -24 }}>
            <div style={{
              backgroundColor: '#fff', border: '1px solid var(--color-green-accent)', borderRadius: '12px',
              padding: '2px 10px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-green-brand)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-green-accent)' }} />
              Today, 8 Mar
            </div>
            <div style={{ width: 1, height: 8, backgroundColor: 'var(--color-green-accent)', margin: '2px 0' }} />
            <div style={{ width: 8, height: 8, border: '2px solid var(--color-green-accent)', backgroundColor: '#fff', transform: 'rotate(45deg)' }} />
          </div>

          {/* 14 Mar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%', backgroundColor: '#6366F1', color: '#fff',
              fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>11</span>
          </div>

          {/* 15 Mar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%', backgroundColor: '#EC4899', color: '#fff',
              fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>15</span>
          </div>

          {/* 18 Mar (Target Tooltip Pin) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%', backgroundColor: '#F97316', color: '#fff',
              fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 3px rgba(249, 115, 22, 0.25)',
            }}>18</span>
          </div>

          {/* 28 Mar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              padding: '2px 6px', borderRadius: '10px', backgroundColor: '#3B82F6', color: '#fff',
              fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2,
            }}>
              <span>28</span>
              <span>30</span>
            </div>
          </div>

          {/* 4 Apr */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%', backgroundColor: '#EAB308', color: '#fff',
              fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>4</span>
          </div>
        </div>

        {/* Dates & Day Ticks Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 30px',
        }}>
          {[
            { date: '28 Feb', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] },
            { date: '7 Mar',  days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] },
            { date: '14 Mar', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] },
            { date: '21 Mar', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] },
            { date: '28 Mar', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] },
            { date: '4 Apr',  days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] },
            { date: '11 Apr', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] },
          ].map((col, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                {col.date}
              </div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                {col.days.map((d, dIdx) => (
                  <span key={dIdx} style={{ fontSize: '0.625rem', color: 'var(--color-text-secondary)', opacity: 0.6 }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
