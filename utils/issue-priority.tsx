import React from 'react';
import { ChevronsUp, ArrowUp, ArrowDown, ChevronsDown, Minus } from 'lucide-react';
import { IssuePriority } from '@/types/issue';

export const renderPriorityIcon = (priority: IssuePriority, size = 14) => {
  switch (priority) {
    case 'HIGHEST':
      return <ChevronsUp size={size} color="#dc2626" />;
    case 'HIGH':
      return <ArrowUp size={size} color="#dc2626" />;
    case 'LOW':
      return <ArrowDown size={size} color="#2563eb" />;
    case 'LOWEST':
      return <ChevronsDown size={size} color="#2563eb" />;
    case 'MEDIUM':
      return <Minus size={size} color="#d97706" />;
    default:
      return null;
  }
};

export const formatPriorityLabel = (priority?: string) => {
  const upper = (priority || '').toUpperCase().trim();
  switch (upper) {
    case 'HIGHEST':
      return { label: 'Highest', color: '#dc2626' };
    case 'HIGH':
      return { label: 'High', color: '#dc2626' };
    case 'MEDIUM':
      return { label: 'Medium', color: '#d97706' };
    case 'LOW':
      return { label: 'Low', color: '#2563eb' };
    case 'LOWEST':
      return { label: 'Lowest', color: '#64748b' };
    default:
      return { label: priority || 'Medium', color: 'var(--color-text-primary)' };
  }
};

