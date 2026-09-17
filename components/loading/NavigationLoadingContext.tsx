'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface NavigationLoadingContextType {
  isNavigating: boolean;
  loadingLabel: string;
  startNavigation: (label?: string) => void;
  stopNavigation: () => void;
}

export const NavigationLoadingContext = createContext<NavigationLoadingContextType>({
  isNavigating: false,
  loadingLabel: 'Loading...',
  startNavigation: () => {},
  stopNavigation: () => {},
});

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);
  if (!context) {
    throw new Error('useNavigationLoading must be used within a GlobalLoadingProvider');
  }
  return context;
}
