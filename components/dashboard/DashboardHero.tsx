'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DashboardHeroProps {
  userName: string;
  greeting: string;
  hasWorkspaces: boolean;
  onCreateWorkspace: () => void;
  onCreateProject: () => void;
}

export function DashboardHero({
  userName,
  greeting,
  hasWorkspaces,
  onCreateWorkspace,
  onCreateProject,
}: DashboardHeroProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--color-house-green) 0%, #152B25 100%)',
        borderRadius: 'var(--radius-card)',
        padding: '2.25rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      {/* Decorative shapes */}
      <div
        style={{
          position: 'absolute',
          right: -30,
          top: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 117, 74, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1
          style={{
            color: '#fff',
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '0.375rem',
            letterSpacing: '-0.02em',
          }}
        >
          {greeting}, {userName.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', maxWidth: 500 }}>
          Here is your workspace overview. Select a project below to jump directly into the project summary.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
        <Button
          variant="outlined"
          onClick={onCreateWorkspace}
          style={{
            color: '#fff',
            borderColor: 'rgba(255,255,255,0.35)',
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
          leftIcon={<Plus size={15} />}
        >
          Workspace
        </Button>
        {hasWorkspaces && (
          <Button
            onClick={onCreateProject}
            style={{ backgroundColor: 'var(--color-green-accent)', color: '#fff' }}
            leftIcon={<Plus size={15} />}
          >
            New Project
          </Button>
        )}
      </div>
    </div>
  );
}
