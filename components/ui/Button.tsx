'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

// ─── Button Component ─────────────────────────────────────────────
type ButtonVariant = 'primary' | 'outlined' | 'ghost' | 'danger' | 'gold';
type ButtonSize    = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:  'btn btn-primary',
  outlined: 'btn btn-outlined',
  ghost:    'btn btn-ghost',
  danger:   'btn btn-danger',
  gold:     'btn',
};

const sizeClass: Record<ButtonSize, string> = {
  sm:   'btn-sm',
  md:   '',
  lg:   'btn-lg',
  icon: 'btn-icon',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, fullWidth, children, className = '', disabled, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          variantClass[variant],
          sizeClass[size],
          fullWidth ? 'w-full' : '',
          className,
        ].filter(Boolean).join(' ')}
        style={
          variant === 'gold'
            ? { background: 'transparent', border: '1px solid var(--color-gold)', color: 'var(--color-gold)', ...style }
            : style
        }
        {...props}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
