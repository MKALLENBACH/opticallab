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
    font-semibold rounded-[var(--radius-md)]
    transition-all duration-150 select-none
    focus-visible:outline focus-visible:outline-2
    focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]
    active:scale-[0.97]
  `;

  const sizeStyles: Record<string, string> = {
    xs: 'px-2.5 py-1.5 text-[0.75rem] leading-none',
    sm: 'px-3.5 py-2 text-[0.8125rem]',
    md: 'px-4.5 py-2.5 text-[0.9375rem]',
    lg: 'px-6 py-3.5 text-base',
  };

  const variantStyles: Record<string, string> = {
    primary: `
      bg-[var(--color-primary)] text-white
      hover:bg-[var(--color-primary-hover)]
      shadow-sm hover:shadow-[var(--shadow-glow)]
    `,
    secondary: `
      bg-[var(--color-secondary)] text-white
      hover:bg-[var(--color-secondary-hover)]
      shadow-sm
    `,
    success: `
      bg-[var(--color-success)] text-white
      hover:opacity-90
      shadow-sm
    `,
    outline: `
      border-[1.5px] border-[var(--color-border)]
      text-[var(--color-text-base)]
      bg-[var(--color-bg-surface)]
      hover:bg-[var(--color-bg-surface-2)]
      hover:border-[var(--color-border-hover)]
    `,
    ghost: `
      text-[var(--color-text-muted)]
      hover:text-[var(--color-text-base)]
      hover:bg-[var(--color-bg-surface-2)]
    `,
    danger: `
      bg-[var(--color-error)] text-white
      hover:opacity-90
      shadow-sm
    `,
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed active:scale-100' : ''}
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
