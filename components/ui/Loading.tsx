'use client';

import React from 'react';

export interface JariLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const JariLoader: React.FC<JariLoaderProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizePixels = {
    sm: 32,
    md: 48,
    lg: 72,
    xl: 96,
  }[size];

  const diamondSizes = {
    sm: 12,
    md: 18,
    lg: 26,
    xl: 34,
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: sizePixels, height: sizePixels }}
    >
      {/* Outer Orbital Ring 1 */}
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: '#00754A',
          borderRightColor: 'rgba(0, 117, 74, 0.2)',
          animation: 'orbitSpin 1.4s linear infinite',
        }}
      >
        <span
          className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-md"
          style={{ backgroundColor: '#00754A', boxShadow: '0 0 8px #00754A' }}
        />
      </div>

      {/* Inner Orbital Ring 2 (Reversed) */}
      <div
        className="absolute inset-[4px] rounded-full border-2 border-transparent"
        style={{
          borderBottomColor: '#1E3932',
          borderLeftColor: 'rgba(30, 57, 50, 0.2)',
          animation: 'orbitSpinReverse 2s linear infinite',
        }}
      >
        <span
          className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: '#cba258', boxShadow: '0 0 6px #cba258' }}
        />
      </div>

      {/* Central Pulsing Diamond */}
      <div
        className="flex items-center justify-center rounded-md bg-gradient-to-br from-[#00754A] to-[#1E3932] shadow-lg"
        style={{
          width: diamondSizes,
          height: diamondSizes,
          animation: 'diamondGlow 2.5s ease-in-out infinite',
        }}
      >
        <span
          className="text-white font-bold tracking-tighter"
          style={{
            fontSize: diamondSizes * 0.55,
            transform: 'rotate(-45deg)',
          }}
        >
          J
        </span>
      </div>
    </div>
  );
};

export interface FullPageLoaderProps {
  label?: string;
  sublabel?: string;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  label = 'Loading Jari data...',
  sublabel = 'Please wait a moment',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E3932]/30 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col items-center p-8 max-w-sm w-full mx-4 rounded-2xl bg-white/90 shadow-2xl border border-white/40 text-center relative overflow-hidden backdrop-blur-xl">
        {/* Top Shimmer Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#d4e9e2] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00754A] via-[#cba258] to-[#00754A] w-full"
            style={{ animation: 'shimmerBar 1.8s ease-in-out infinite' }}
          />
        </div>

        {/* Brand Diamond Orbit Loader */}
        <div className="my-4">
          <JariLoader size="xl" />
        </div>

        {/* Text Details */}
        <h3 className="text-lg font-bold text-[#1E3932] mt-2 tracking-tight">
          {label}
        </h3>
        <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide" style={{ animation: 'pulseSubtle 2s ease-in-out infinite' }}>
          {sublabel}
        </p>
      </div>
    </div>
  );
};

export interface LoadingSectionProps {
  label?: string;
  height?: string;
}

export const LoadingSection: React.FC<LoadingSectionProps> = ({
  label = 'Loading information...',
  height = 'h-64',
}) => {
  return (
    <div className={`w-full ${height} flex flex-col items-center justify-center p-6 bg-white/60 rounded-xl border border-gray-100 shadow-sm space-y-3`}>
      <JariLoader size="lg" />
      <span className="text-xs font-semibold text-[#1E3932]/70 tracking-wide" style={{ animation: 'pulseSubtle 1.8s ease-in-out infinite' }}>
        {label}
      </span>
    </div>
  );
};

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="w-full p-4 rounded-xl bg-white border border-gray-100 shadow-sm space-y-3 animate-pulse">
      <div className="h-5 bg-gray-200 rounded-md w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-100 rounded w-full flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
};

export const ButtonSpinner: React.FC = () => {
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
      style={{ animation: 'orbitSpin 0.8s linear infinite' }}
    />
  );
};

export default JariLoader;
