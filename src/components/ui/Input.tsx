import React, { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightElement, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`flex w-full flex-col gap-2 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="ml-1 text-[0.86rem] font-bold text-slate-200"
          >
            {label}
          </label>
        )}
        <div className="relative flex w-full items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center text-slate-500">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full bg-slate-950/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
              border border-white/10 rounded-2xl
              min-h-12 py-3 text-[0.95rem] font-medium
              text-white
              placeholder:text-slate-500
              transition-all duration-200
              ${leftIcon ? 'pl-14' : 'pl-4'}
              ${rightElement ? 'pr-14' : 'pr-4'}
              ${error
                ? 'border-red-400/55 bg-red-500/10 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.14)]'
                : 'focus:border-violet-300/60 focus:ring-2 focus:ring-violet-400/15 focus:shadow-[0_0_24px_rgba(129,140,248,0.13),inset_0_0_0_1px_rgba(129,140,248,0.18)] focus:bg-slate-950/80 hover:border-white/20 hover:bg-slate-950/72'
              }
              disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-white/50 disabled:opacity-60
            `}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center">
              {rightElement}
            </span>
          )}
        </div>
        {error && (
          <span className="ml-1 flex items-center gap-1.5 text-[0.8125rem] font-medium text-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="ml-1 text-[0.8125rem] text-slate-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
