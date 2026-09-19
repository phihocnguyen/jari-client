'use client';

import React from 'react';
import { Rocket, Code2, LayoutGrid, Bug, Sparkles } from 'lucide-react';

export function JiraCloudSmileyIcon({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <path
        d="M28 68 C22 68 18 64 18 58 C18 52.5 22 48.5 27 48 C27.5 40 34 33 43 33 C46.5 33 49.5 34.5 52 37 C56 31 63 28 70 31 C77 34 81 40 81 48 C86 48.5 90 52.5 90 58 C90 64 85 68 79 68 Z"
        fill={color}
      />
      <circle cx="43" cy="50" r="2.8" fill="#0C66E4" />
      <circle cx="59" cy="50" r="2.8" fill="#0C66E4" />
      <path
        d="M47 56 Q51 61 55 56"
        stroke="#E2483D"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export const PROJECT_ICONS = [
  { id: 'cloud', label: 'Cloud', icon: JiraCloudSmileyIcon },
  { id: 'rocket', label: 'Rocket', icon: Rocket },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { id: 'bug', label: 'Bug', icon: Bug },
  { id: 'sparkles', label: 'Features', icon: Sparkles },
];

export const PROJECT_COLORS = [
  '#0C66E4', // Blue
  '#00754A', // Green
  '#6554C0', // Purple
  '#EAB308', // Yellow
  '#EA580C', // Orange
  '#E11D48', // Red
  '#0284C7', // Sky
  '#475569', // Slate
];

interface ProjectIconProps {
  icon?: string | null;
  color?: string | null;
  name?: string;
  size?: number;
  iconSize?: number;
  borderRadius?: number | string;
  style?: React.CSSProperties;
}

export function ProjectIcon({
  icon,
  color = '#0C66E4',
  name = 'Project',
  size = 36,
  iconSize,
  borderRadius = 8,
  style,
}: ProjectIconProps) {
  const effectiveColor = color || '#0C66E4';
  const effectiveIconSize = iconSize || Math.round(size * 0.58);
  const initial = (name || 'P').charAt(0).toUpperCase();

  const renderIcon = () => {
    switch (icon) {
      case 'rocket':
        return <Rocket size={effectiveIconSize} color="#FFFFFF" />;
      case 'code':
        return <Code2 size={effectiveIconSize} color="#FFFFFF" />;
      case 'kanban':
        return <LayoutGrid size={effectiveIconSize} color="#FFFFFF" />;
      case 'bug':
        return <Bug size={effectiveIconSize} color="#FFFFFF" />;
      case 'sparkles':
        return <Sparkles size={effectiveIconSize} color="#FFFFFF" />;
      case 'cloud':
      default:
        if (icon === 'cloud' || !initial) {
          return <JiraCloudSmileyIcon size={effectiveIconSize} color="#FFFFFF" />;
        }
        return (
          <span
            style={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: `${Math.round(size * 0.45)}px`,
              lineHeight: 1,
            }}
          >
            {initial}
          </span>
        );
    }
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: effectiveColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        ...style,
      }}
    >
      {renderIcon()}
    </div>
  );
}
