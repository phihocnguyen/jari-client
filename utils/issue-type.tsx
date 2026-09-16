import React from 'react';
import { Zap, Bookmark, AlertCircle, CheckSquare } from 'lucide-react';
import { IssueType } from '@/types/issue';

export function SubtaskIcon({ size = 15, color = '#0c66e4' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <rect x="2" y="2" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
      <path
        d="M4.5 7V10C4.5 10.8 5.2 11.5 6 11.5H9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export const renderTypeIcon = (type: IssueType | string, size = 15) => {
  const normalized = (type || '').toUpperCase();
  switch (normalized) {
    case 'EPIC':
      return <Zap size={size} color="#9333ea" fill="#9333ea" />;
    case 'STORY':
      return <Bookmark size={size} color="#16a34a" fill="#16a34a" />;
    case 'BUG':
      return <AlertCircle size={size} color="#dc2626" />;
    case 'SUBTASK':
    case 'SUB-TASK':
    case 'SUB_TASK':
      return <SubtaskIcon size={size} color="#0c66e4" />;
    case 'TASK':
    default:
      return <CheckSquare size={size} color="#2563eb" />;
  }
};
