import { Check } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface SelectableOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface OptionChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
  selected?: boolean;
  children: ReactNode;
}

export function OptionChip({
  value,
  selected = false,
  children,
  className = '',
  disabled,
  ...props
}: OptionChipProps) {
  return (
    <button
      type="button"
      value={value}
      aria-pressed={selected}
      disabled={disabled}
      className={`
        inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 py-2
        text-center text-[0.86rem] font-extrabold leading-tight transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        disabled:cursor-not-allowed disabled:opacity-45
        ${selected
          ? 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(79,70,229,0.42),rgba(147,51,234,0.28))] text-white shadow-[0_0_24px_rgba(139,92,246,0.16),inset_0_1px_0_rgba(255,255,255,0.14)]'
          : 'border-white/10 bg-slate-950/42 text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-violet-300/28 hover:bg-white/[0.055] hover:text-white'}
        ${className}
      `}
      {...props}
    >
      {selected && <Check size={14} strokeWidth={3} className="flex-shrink-0 text-violet-100" />}
      <span>{children}</span>
    </button>
  );
}

interface ChipSelectorProps {
  options: SelectableOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ChipSelector({
  options,
  selectedValues,
  onToggle,
  disabled = false,
  className = '',
}: ChipSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      {options.map((option) => (
        <OptionChip
          key={option.value}
          value={option.value}
          selected={selectedValues.includes(option.value)}
          disabled={disabled || option.disabled}
          onClick={() => onToggle(option.value)}
        >
          {option.label}
        </OptionChip>
      ))}
    </div>
  );
}
