import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-slate-950/52
        border border-white/10
        rounded-3xl
        shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.055)]
        backdrop-blur-xl
        overflow-hidden
        transition-all duration-300
        ${hover ? 'hover:shadow-[0_26px_70px_-40px_rgba(99,102,241,0.55)] hover:-translate-y-[2px] hover:border-violet-300/30 hover:bg-slate-950/68 cursor-pointer' : ''}
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
      className={`border-b border-white/10 px-5 py-5 sm:px-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: CardProps) {
  return (
    <h3
      className={`text-lg font-bold tracking-tight text-[var(--color-text-base)] ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }: CardProps) {
  return (
    <p
      className={`text-[0.9375rem] text-[var(--color-text-muted)] mt-1.5 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`border-t border-white/10 bg-white/[0.025] px-5 py-4 sm:px-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
