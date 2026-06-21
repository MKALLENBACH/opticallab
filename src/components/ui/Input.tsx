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
      <div className={`flex flex-col gap-2 w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[0.9rem] font-semibold text-white/90"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-4 pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full bg-[rgba(15,17,26,0.6)]
              border border-white/10 rounded-xl
              px-4 py-3.5 text-[0.95rem] font-medium
              text-white
              placeholder:text-white/30
              transition-all duration-300
              ${leftIcon ? 'pl-[2.75rem]' : ''}
              ${rightElement ? 'pr-[2.75rem]' : ''}
              ${error
                ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                : 'focus:border-indigo-400 focus:shadow-[0_0_24px_rgba(129,140,248,0.2),inset_0_0_0_1px_rgba(129,140,248,0.3)] focus:bg-[rgba(20,22,35,0.8)] hover:border-white/25 hover:bg-[rgba(20,22,35,0.7)]'
              }
              disabled:bg-white/5 disabled:text-white/50
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
