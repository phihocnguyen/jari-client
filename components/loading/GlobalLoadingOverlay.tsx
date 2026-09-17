'use client';

import React from 'react';
import { JariLoader } from '@/components/ui/Loading';

export interface GlobalLoadingOverlayProps {
  label?: string;
  sublabel?: string;
}

export function GlobalLoadingOverlay({
  label = 'Opening project...',
  sublabel = 'Please wait a moment',
}: GlobalLoadingOverlayProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        animation: 'globalLoadingFadeIn 0.2s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes globalLoadingFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmerBarMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulseText {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Centered Glassmorphic Loading Card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem 2.5rem',
          maxWidth: '340px',
          width: '90%',
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Shimmer Progress Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: '#D4E9E2',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              background: 'linear-gradient(90deg, #00754A, #10B981, #cba258, #00754A)',
              animation: 'shimmerBarMove 1.6s ease-in-out infinite',
            }}
          />
        </div>

        {/* Brand Loader */}
        <div style={{ margin: '1rem 0' }}>
          <JariLoader size="lg" />
        </div>

        {/* Status Text */}
        <h3
          style={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: '#1E3932',
            margin: '0.25rem 0 0',
            letterSpacing: '-0.01em',
          }}
        >
          {label}
        </h3>
        <p
          style={{
            fontSize: '0.75rem',
            color: '#64748B',
            marginTop: '0.375rem',
            fontWeight: 500,
            animation: 'pulseText 2s ease-in-out infinite',
          }}
        >
          {sublabel}
        </p>
      </div>
    </div>
  );
}
