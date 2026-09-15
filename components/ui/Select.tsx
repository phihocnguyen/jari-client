'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badgeStyle?: { bg: string; color: string; border?: string };
  disabled?: boolean;
}

interface SelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  renderTrigger?: (selectedOption?: SelectOption<T>, isOpen?: boolean) => React.ReactNode;
  align?: 'left' | 'right';
  minWidth?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  renderTrigger,
  align = 'left',
  minWidth = 160,
  className,
  style,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width?: number }>({
    top: 0,
    left: 0,
  });
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const calculatedLeft = align === 'right' ? rect.right - (typeof minWidth === 'number' ? minWidth : 160) : rect.left;
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: Math.max(8, calculatedLeft + window.scrollX),
        width: rect.width,
      });
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (triggerRef.current && triggerRef.current.contains(e.target as Node)) {
        return;
      }
      const menuEl = document.getElementById('custom-select-portal-menu');
      if (menuEl && menuEl.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    }

    function handleScrollOrResize() {
      setIsOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      ref={triggerRef}
      onClick={handleToggle}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        ...style,
      }}
    >
      {renderTrigger ? (
        renderTrigger(selectedOption, isOpen)
      ) : (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '6px 10px',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.15)',
            borderRadius: 6,
            fontSize: '0.8125rem',
            color: 'var(--color-text-primary)',
            minWidth: 120,
            transition: 'all 0.15s ease',
            boxShadow: isOpen ? '0 0 0 2px rgba(12, 102, 228, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {selectedOption?.icon}
            {selectedOption?.badgeStyle ? (
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: 3,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: selectedOption.badgeStyle.bg,
                  color: selectedOption.badgeStyle.color,
                  border: selectedOption.badgeStyle.border
                    ? `1px solid ${selectedOption.badgeStyle.border}`
                    : 'none',
                }}
              >
                {selectedOption.label}
              </span>
            ) : (
              <span>{selectedOption?.label || placeholder}</span>
            )}
          </div>
          <ChevronDown
            size={14}
            style={{
              color: 'var(--color-text-secondary)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
            }}
          />
        </div>
      )}

      {isOpen &&
        mounted &&
        createPortal(
          <div
            id="custom-select-portal-menu"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: menuPosition.top,
              left: menuPosition.left,
              zIndex: 9999,
              minWidth: minWidth,
              backgroundColor: '#ffffff',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(9, 30, 66, 0.18), 0 0 1px rgba(9, 30, 66, 0.31)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              padding: '4px 0',
              maxHeight: 280,
              overflowY: 'auto',
              animation: 'fadeInScale 0.12s ease-out',
            }}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={String(opt.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!opt.disabled) {
                      onChange(opt.value);
                      setIsOpen(false);
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    cursor: opt.disabled ? 'not-allowed' : 'pointer',
                    opacity: opt.disabled ? 0.5 : 1,
                    backgroundColor: isSelected ? '#e9f2ff' : 'transparent',
                    color: isSelected ? '#0c66e4' : 'var(--color-text-primary)',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!opt.disabled && !isSelected) {
                      e.currentTarget.style.backgroundColor = '#f1f2f4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!opt.disabled && !isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {opt.icon}
                    {opt.badgeStyle ? (
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: 3,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: opt.badgeStyle.bg,
                          color: opt.badgeStyle.color,
                          border: opt.badgeStyle.border
                            ? `1px solid ${opt.badgeStyle.border}`
                            : 'none',
                        }}
                      >
                        {opt.label}
                      </span>
                    ) : (
                      <span>{opt.label}</span>
                    )}
                  </div>

                  {isSelected && <Check size={14} style={{ color: '#0c66e4', flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
