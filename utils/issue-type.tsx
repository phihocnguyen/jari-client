import React from 'react';
import { Zap, Bookmark, AlertCircle, GitFork, CheckSquare } from 'lucide-react';
import { IssueType } from '@/types/issue';

export const renderTypeIcon = (type: IssueType, size = 15) => {
  switch (type) {
    case 'EPIC':
      return <Zap size={size} color="#9333ea" fill="#9333ea" />;
    case 'STORY':
      return <Bookmark size={size} color="#16a34a" fill="#16a34a" />;
    case 'BUG':
      return <AlertCircle size={size} color="#dc2626" />;
    case 'SUBTASK':
      return <GitFork size={size} color="#0284c7" />;
    case 'TASK':
    default:
      return <CheckSquare size={size} color="#2563eb" />;
  }
};
