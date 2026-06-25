'use client';

import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createLabCustomOption } from '@/actions/lab-custom-options';
import {
  OPTION_CREATE_LABEL,
  type LabOption,
  type LabOptionType,
} from '@/lib/constants/lab-options';
import { Button } from './Button';
import { Input } from './Input';
import { ChipSelector, OptionChip } from './OptionChip';

interface LabOptionSelectProps {
  label: string;
  name?: string;
  optionType: LabOptionType;
  options: LabOption[];
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
}

interface LabOptionMultiSelectProps {
  label?: string;
  optionType: LabOptionType;
  options: LabOption[];
  selectedValues: string[];
  disabled?: boolean;
  onChange: (values: string[]) => void;
}

const OTHER_VALUE = '__other__';

function upsertOption(options: LabOption[], option: LabOption) {
  const exists = options.some((item) => item.value === option.value || item.label.toLowerCase() === option.label.toLowerCase());
  return exists ? options : [...options, option].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}

export function LabOptionSelect({
  label,
  name,
  optionType,
  options,
  value,
  defaultValue = '',
  disabled,
  placeholder = 'Selecione...',
  onChange,
}: LabOptionSelectProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [availableOptions, setAvailableOptions] = useState(options);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentValue = isControlled ? value : internalValue;

  const normalizedOptions = useMemo(() => {
    const map = new Map<string, LabOption>();
    for (const option of availableOptions) map.set(option.value, option);
    if (currentValue && !map.has(currentValue)) map.set(currentValue, { value: currentValue, label: currentValue });
    return [...map.values()];
  }, [availableOptions, currentValue]);

  const setValue = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const saveCustom = async () => {
    setError(null);
    setMessage(null);
    setIsSaving(true);
    const result = await createLabCustomOption({ optionType, name: newName });
    setIsSaving(false);

    if (result.error || !result.option) {
      setError(result.error || 'Nao foi possivel salvar a opcao.');
      return;
    }

    const option = { value: result.option.value, label: result.option.label, isDefault: false };
    setAvailableOptions((current) => upsertOption(current, option));
    setValue(option.value);
    setNewName('');
    setIsCreating(false);
    setMessage(result.option.message);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="ml-1 text-[0.86rem] font-bold text-slate-200">{label}</label>
      <select
        name={name}
        value={currentValue || ''}
        onChange={(event) => {
          if (event.target.value === OTHER_VALUE) {
            setIsCreating(true);
            return;
          }
          setValue(event.target.value);
        }}
        disabled={disabled || isSaving}
      >
        <option value="">{placeholder}</option>
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
        <option value={OTHER_VALUE}>Outro</option>
      </select>

      {isCreating && (
        <div className="rounded-2xl border border-violet-300/18 bg-violet-500/[0.055] p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <Input
              label={OPTION_CREATE_LABEL[optionType]}
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              disabled={isSaving}
              placeholder="Digite o novo valor"
            />
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => setIsCreating(false)} leftIcon={<X size={16} />}>
              Cancelar
            </Button>
            <Button type="button" isLoading={isSaving} onClick={saveCustom} leftIcon={<Plus size={16} />}>
              Salvar e usar
            </Button>
          </div>
        </div>
      )}

      {(error || message) && (
        <p className={`text-[0.82rem] font-semibold ${error ? 'text-red-200' : 'text-emerald-200'}`}>
          {error || message}
        </p>
      )}
    </div>
  );
}

export function LabOptionMultiSelect({
  label,
  optionType,
  options,
  selectedValues,
  disabled,
  onChange,
}: LabOptionMultiSelectProps) {
  const [availableOptions, setAvailableOptions] = useState(options);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allOptions = useMemo(() => {
    const map = new Map<string, LabOption>();
    for (const option of availableOptions) map.set(option.value, option);
    for (const value of selectedValues) if (!map.has(value)) map.set(value, { value, label: value });
    return [...map.values()];
  }, [availableOptions, selectedValues]);

  const toggle = (value: string) => {
    onChange(selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value]);
  };

  const saveCustom = async () => {
    setError(null);
    setMessage(null);
    setIsSaving(true);
    const result = await createLabCustomOption({ optionType, name: newName });
    setIsSaving(false);

    if (result.error || !result.option) {
      setError(result.error || 'Nao foi possivel salvar a opcao.');
      return;
    }

    const option = { value: result.option.value, label: result.option.label, isDefault: false };
    setAvailableOptions((current) => upsertOption(current, option));
    if (!selectedValues.includes(option.value)) onChange([...selectedValues, option.value]);
    setNewName('');
    setIsCreating(false);
    setMessage(result.option.message);
  };

  return (
    <div>
      {label && <p className="mb-3 ml-1 text-[0.86rem] font-bold text-slate-200">{label}</p>}
      <div className="flex flex-wrap gap-2.5">
        <ChipSelector options={allOptions} selectedValues={selectedValues} onToggle={toggle} disabled={disabled || isSaving} />
        <OptionChip
          value={OTHER_VALUE}
          selected={isCreating}
          disabled={disabled || isSaving}
          onClick={() => {
            setIsCreating((current) => !current);
            setError(null);
            setMessage(null);
          }}
        >
          Outro
        </OptionChip>
      </div>

      {isCreating && (
        <div className="mt-4 rounded-2xl border border-violet-300/18 bg-violet-500/[0.055] p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <Input
              label={OPTION_CREATE_LABEL[optionType]}
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              disabled={isSaving}
              placeholder="Digite o novo valor"
            />
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => setIsCreating(false)} leftIcon={<X size={16} />}>
              Cancelar
            </Button>
            <Button type="button" isLoading={isSaving} onClick={saveCustom} leftIcon={<Plus size={16} />}>
              Salvar e usar
            </Button>
          </div>
        </div>
      )}

      {(error || message) && (
        <div className={`mt-3 rounded-2xl border px-4 py-3 text-[0.88rem] font-semibold ${error ? 'border-red-400/25 bg-red-500/12 text-red-100' : 'border-emerald-400/25 bg-emerald-500/12 text-emerald-100'}`}>
          {error || message}
        </div>
      )}
    </div>
  );
}
