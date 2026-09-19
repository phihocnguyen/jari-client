'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { formatDisplayDateDMY, parseDMYToISO, todayISO } from './sidebarUtils';

interface IssueDateInputProps {
  value?: string;
  onChange: (iso: string | null) => void;
}

export function IssueDateInput({ value, onChange }: IssueDateInputProps) {
  const [text, setText] = useState(formatDisplayDateDMY(value) || formatDisplayDateDMY(todayISO()));
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(formatDisplayDateDMY(value) || formatDisplayDateDMY(todayISO()));
  }, [value]);

  const commit = () => {
    const iso = parseDMYToISO(text);
    if (iso) {
      if (iso !== (value ? value.substring(0, 10) : null)) onChange(iso);
    } else {
      setText(formatDisplayDateDMY(value) || formatDisplayDateDMY(todayISO()));
    }
  };

  const openPicker = () => {
    const el = pickerRef.current;
    if (el) {
      try {
        (el as any).showPicker?.();
      } catch {
        el.click();
      }
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 4px',
        borderRadius: 4,
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <button
        type="button"
        title="Open calendar"
        onClick={openPicker}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#626f86',
        }}
      >
        <Calendar size={14} color="#626f86" />
      </button>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        placeholder="dd/MM/yyyy"
        style={{
          width: 86,
          border: 'none',
          background: 'transparent',
          color: '#172b4d',
          fontSize: '0.8125rem',
          outline: 'none',
          padding: '1px 2px',
          cursor: 'text',
        }}
      />

      <input
        ref={pickerRef}
        type="date"
        value={value ? value.substring(0, 10) : ''}
        onChange={(e) => {
          onChange(e.target.value || null);
          setText(formatDisplayDateDMY(e.target.value) || formatDisplayDateDMY(todayISO()));
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          pointerEvents: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
        }}
        tabIndex={-1}
      />
    </div>
  );
}
