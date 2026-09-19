'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { NavigationLoadingContext } from './NavigationLoadingContext';
import { GlobalLoadingOverlay } from './GlobalLoadingOverlay';

interface GlobalLoadingProviderProps {
  children: React.ReactNode;
}

export function GlobalLoadingProvider({ children }: GlobalLoadingProviderProps) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Opening project...');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevPathnameRef = useRef(pathname);

  const startNavigation = useCallback((label?: string) => {
    if (label) setLoadingLabel(label);
    setIsNavigating(true);

    // Safety timeout: auto dismiss after 6 seconds in case of network issue
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 6000);
  }, []);

  const stopNavigation = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsNavigating(false);
  }, []);

  // When pathname changes, keep the loader visible briefly for smooth transition, then dismiss
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (isNavigating) {
        const timer = setTimeout(() => {
          setIsNavigating(false);
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, isNavigating]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <NavigationLoadingContext.Provider
      value={{
        isNavigating,
        loadingLabel,
        startNavigation,
        stopNavigation,
      }}
    >
      {children}
      {isNavigating && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            zIndex: 99999,
            overflow: 'hidden',
            backgroundColor: 'rgba(0, 117, 74, 0.15)',
          }}
        >
          <style>{`
            @keyframes topNavShimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
          <div
            style={{
              height: '100%',
              width: '100%',
              background: 'linear-gradient(90deg, #00754A, #10B981, #00754A)',
              animation: 'topNavShimmer 1.2s ease-in-out infinite',
            }}
          />
        </div>
      )}
    </NavigationLoadingContext.Provider>
  );
}
