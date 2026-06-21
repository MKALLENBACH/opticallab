import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className={`flex flex-col gap-1 w-full ${className}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-base)]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`
            w-full bg-[var(--color-bg-surface)] border rounded-md px-3 py-2 text-base transition-all
            ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'}
            disabled:bg-[var(--color-bg-surface-hover)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed
          `}
          {...props}
        />
        {error && <span className="text-sm text-[var(--color-error)]">{error}</span>}
        {!error && helperText && <span className="text-sm text-[var(--color-text-muted)]">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
