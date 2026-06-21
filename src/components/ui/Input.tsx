import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full bg-[rgba(0,0,0,0.2)]
              border border-[var(--color-border)] rounded-[var(--radius-md)]
              px-3.5 py-2.5 text-[0.9375rem]
              text-[var(--color-text-base)]
              placeholder:text-[var(--color-text-subtle)]
              transition-all duration-200
              ${leftIcon ? 'pl-9' : ''}
              ${rightElement ? 'pr-10' : ''}
              ${error
                ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.05)]'
                : 'focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_3px_var(--color-primary-light)] focus:bg-[rgba(0,0,0,0.35)] hover:border-[var(--color-border-hover)]'
              }
              disabled:bg-[rgba(255,255,255,0.02)] disabled:text-[var(--color-text-muted)]
              disabled:cursor-not-allowed disabled:opacity-60
            `}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 flex items-center text-[var(--color-text-muted)]">
              {rightElement}
            </span>
          )}
        </div>
        {error && (
          <span className="text-[0.8125rem] text-[var(--color-error)] font-medium flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-[0.8125rem] text-[var(--color-text-muted)]">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
