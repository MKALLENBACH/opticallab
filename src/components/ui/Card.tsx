import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--color-bg-surface)]
        border border-[var(--color-border)]
        rounded-[var(--radius-xl)]
        shadow-[var(--shadow-card)]
        overflow-hidden
        transition-all duration-200
        ${hover ? 'hover:shadow-[var(--shadow-lg)] hover:-translate-y-px hover:border-[var(--color-border-hover)] cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`px-6 py-4 border-b border-[var(--color-border)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: CardProps) {
  return (
    <h3
      className={`text-base font-semibold tracking-tight text-[var(--color-text-base)] ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }: CardProps) {
  return (
    <p
      className={`text-sm text-[var(--color-text-muted)] mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`px-6 py-4 bg-[var(--color-bg-surface-2)] border-t border-[var(--color-border)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
