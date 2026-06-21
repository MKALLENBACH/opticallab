import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'urgent';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default: 'bg-[var(--color-bg-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)]',
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)] shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    error:   'bg-[var(--color-error-bg)] text-[var(--color-error-text)] border-[var(--color-error-border)] shadow-[0_0_10px_rgba(239,68,68,0.1)]',
    info:    'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-info-border)] shadow-[0_0_10px_rgba(59,130,246,0.1)]',
    urgent:  'bg-[var(--color-urgent-bg)] text-[var(--color-urgent-text)] border-[var(--color-urgent-border)] shadow-[0_0_10px_rgba(225,29,72,0.1)]',
  };

  const dotColors: Record<string, string> = {
    default: 'bg-[var(--color-text-muted)]',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    error:   'bg-[var(--color-error)]',
    info:    'bg-[var(--color-info)]',
    urgent:  'bg-[var(--color-urgent)]',
  };

  const sizeStyles: Record<string, string> = {
    sm: 'px-2 py-0.5 text-[0.6875rem] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full border
        tracking-wide leading-none
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}
