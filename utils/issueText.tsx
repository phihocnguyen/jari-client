'use client';

import React from 'react';
import Link from 'next/link';

// Issue keys like MOBILE-5, KAN-3 (2+ letters prefix)
const ISSUE_KEY_PATTERN = /\b([A-Z][A-Z0-9]{1,}-\d+)\b/g;

/**
 * Renders plain text with issue keys (e.g. MOBILE-5) highlighted as links
 * that navigate to the full-page issue detail view.
 */
export function renderTextWithIssueKeys(text: string, projectId: string): React.ReactNode[] {
  if (!text) return [];
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(ISSUE_KEY_PATTERN.source, 'g');
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const key = match[1];
    nodes.push(
      <Link
        key={`issue-key-${i++}`}
        href={`/projects/${projectId}/issues/${key}`}
        style={{
          color: '#0c66e4',
          fontWeight: 600,
          textDecoration: 'none',
          backgroundColor: '#e9f2ff',
          padding: '0 4px',
          borderRadius: 3,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        onClick={(e) => e.stopPropagation()}
      >
        {key}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}
