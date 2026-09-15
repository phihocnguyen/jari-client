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
