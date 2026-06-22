import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-bold rounded-2xl
    transition-all duration-200 select-none
    focus-visible:outline focus-visible:outline-2
    focus-visible:outline-offset-2 focus-visible:outline-violet-300
    active:scale-[0.97]
    whitespace-nowrap
  `;

  const sizeStyles: Record<string, string> = {
    xs: 'px-2.5 py-1.5 text-[0.75rem] leading-none rounded-xl',
    sm: 'px-3.5 py-2 text-[0.8125rem] min-h-9',
    md: 'px-4 py-2.5 text-[0.92rem] min-h-11',
    lg: 'px-6 py-3.5 text-base min-h-12',
  };

  const variantStyles: Record<string, string> = {
    primary: `
      bg-[linear-gradient(135deg,#4f46e5,#9333ea)] text-white
      border border-violet-300/20
      shadow-[0_18px_34px_-18px_rgba(139,92,246,1),inset_0_1px_0_rgba(255,255,255,0.18)]
      hover:-translate-y-[1px]
      hover:shadow-[0_22px_42px_-18px_rgba(139,92,246,1),inset_0_1px_0_rgba(255,255,255,0.24)]
    `,
    secondary: `
      bg-white/[0.055] text-white
      border border-white/10
      shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
      hover:bg-white/[0.085]
      hover:border-violet-300/25
    `,
    success: `
      bg-[linear-gradient(135deg,#059669,#10b981)] text-white
      border border-emerald-300/20
      shadow-[0_4px_15px_rgba(16,185,129,0.25)]
      hover:-translate-y-[1px]
      hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)]
    `,
    outline: `
      border border-white/10
      text-slate-200
      bg-slate-950/35
      hover:bg-white/[0.055]
      hover:border-violet-300/25
      hover:text-white
    `,
    ghost: `
      text-slate-400
      hover:text-white
      hover:bg-white/[0.055]
    `,
    danger: `
      bg-[linear-gradient(135deg,#dc2626,#ef4444)] text-white
      border border-red-300/20
      shadow-[0_4px_15px_rgba(239,68,68,0.25)]
      hover:-translate-y-[1px]
      hover:shadow-[0_6px_20px_rgba(239,68,68,0.35)]
    `,
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed active:scale-100 hover:transform-none hover:shadow-none' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}
