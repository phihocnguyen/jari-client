'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// ─── Input Component ──────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  error?:     string;
  hint?:      string;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType  = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId    = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1" style={{ width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: error ? 'var(--color-red)' : 'var(--color-text-primary)',
              letterSpacing: 'var(--tracking-tight)',
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <span style={{
              position: 'absolute', left: 12,
              color: 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center',
              pointerEvents: 'none',
            }}>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={['input', error ? 'error' : '', className].filter(Boolean).join(' ')}
            style={{
              paddingLeft:  leftIcon  ? '2.5rem' : undefined,
              paddingRight: (rightIcon || isPassword) ? '2.5rem' : undefined,
            }}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute', right: 12,
                color: 'var(--color-text-secondary)',
                background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0,
              }}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {!isPassword && rightIcon && (
            <span style={{
              position: 'absolute', right: 12,
              color: 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center',
            }}>
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-red)' }}>
            {error}
          </span>
        )}
        {hint && !error && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            {hint}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
