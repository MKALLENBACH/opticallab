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
    default: 'bg-white/[0.045] text-slate-300 border-white/10',
    success: 'bg-emerald-500/12 text-emerald-200 border-emerald-400/25 shadow-[0_0_14px_rgba(16,185,129,0.12)]',
    warning: 'bg-amber-500/13 text-amber-200 border-amber-400/25 shadow-[0_0_14px_rgba(245,158,11,0.12)]',
    error:   'bg-red-500/13 text-red-200 border-red-400/25 shadow-[0_0_14px_rgba(239,68,68,0.12)]',
    info:    'bg-blue-500/13 text-blue-200 border-blue-400/25 shadow-[0_0_14px_rgba(59,130,246,0.12)]',
    urgent:  'bg-rose-500/14 text-rose-200 border-rose-400/25 shadow-[0_0_14px_rgba(225,29,72,0.14)]',
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
    sm: 'px-2 py-1 text-[0.68rem] gap-1',
    md: 'px-2.5 py-1.5 text-[0.74rem] gap-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border
        font-bold uppercase tracking-[0.08em] leading-none
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
