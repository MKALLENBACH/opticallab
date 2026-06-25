export type LabOptionType =
  | 'brand'
  | 'lens_category'
  | 'lens_material'
  | 'refractive_index'
  | 'lens_treatment'
  | 'rework_reason';

export interface LabOption {
  value: string;
  label: string;
  isDefault?: boolean;
}

export const DEFAULT_BRAND_OPTIONS: LabOption[] = [];

export const DEFAULT_LENS_CATEGORY_OPTIONS: LabOption[] = [
  { value: 'monofocal', label: 'Monofocal', isDefault: true },
  { value: 'bifocal', label: 'Bifocal', isDefault: true },
  { value: 'multifocal_progressiva', label: 'Multifocal / Progressiva', isDefault: true },
  { value: 'ocupacional', label: 'Ocupacional', isDefault: true },
  { value: 'solar_grau', label: 'Solar com grau', isDefault: true },
  { value: 'tratamento_especial', label: 'Tratamento especial', isDefault: true },
];

export const DEFAULT_LENS_MATERIAL_OPTIONS: LabOption[] = [
  { value: 'cr39', label: 'CR-39', isDefault: true },
  { value: 'policarbonato', label: 'Policarbonato', isDefault: true },
  { value: 'trivex', label: 'Trivex', isDefault: true },
  { value: 'resina', label: 'Resina', isDefault: true },
  { value: 'alto_indice', label: 'Alto indice', isDefault: true },
  { value: 'mineral', label: 'Mineral', isDefault: true },
];

export const DEFAULT_REFRACTIVE_INDEX_OPTIONS: LabOption[] = [
  { value: '1.49', label: '1.49', isDefault: true },
  { value: '1.56', label: '1.56', isDefault: true },
  { value: '1.59', label: '1.59', isDefault: true },
  { value: '1.60', label: '1.60', isDefault: true },
  { value: '1.67', label: '1.67', isDefault: true },
  { value: '1.74', label: '1.74', isDefault: true },
];

export const DEFAULT_TREATMENT_OPTIONS: LabOption[] = [
  { value: 'Antirreflexo', label: 'Antirreflexo', isDefault: true },
  { value: 'Blue Cut', label: 'Blue Cut', isDefault: true },
  { value: 'Fotossensivel', label: 'Fotossensivel', isDefault: true },
  { value: 'Polarizada', label: 'Polarizada', isDefault: true },
  { value: 'Protecao UV', label: 'Protecao UV', isDefault: true },
  { value: 'Endurecida', label: 'Endurecida', isDefault: true },
  { value: 'Hidrofobica', label: 'Hidrofobica', isDefault: true },
  { value: 'Oleofobica', label: 'Oleofobica', isDefault: true },
];

export const DEFAULT_REWORK_REASON_OPTIONS: LabOption[] = [
  { value: 'erro_de_medico', label: 'Erro de Medico', isDefault: true },
];

export const DEFAULT_OPTIONS_BY_TYPE: Record<LabOptionType, LabOption[]> = {
  brand: DEFAULT_BRAND_OPTIONS,
  lens_category: DEFAULT_LENS_CATEGORY_OPTIONS,
  lens_material: DEFAULT_LENS_MATERIAL_OPTIONS,
  refractive_index: DEFAULT_REFRACTIVE_INDEX_OPTIONS,
  lens_treatment: DEFAULT_TREATMENT_OPTIONS,
  rework_reason: DEFAULT_REWORK_REASON_OPTIONS,
};

export const OPTION_CREATE_LABEL: Record<LabOptionType, string> = {
  brand: 'Cadastrar nova marca',
  lens_category: 'Cadastrar nova categoria',
  lens_material: 'Cadastrar novo material',
  refractive_index: 'Cadastrar novo indice de refracao',
  lens_treatment: 'Cadastrar novo tratamento',
  rework_reason: 'Cadastrar novo motivo de retrabalho',
};

export function normalizeCustomOption(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function cleanCustomOption(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function mergeLabOptions(optionType: LabOptionType, customOptions: LabOption[] = []): LabOption[] {
  const defaults = DEFAULT_OPTIONS_BY_TYPE[optionType] || [];
  const merged = new Map<string, LabOption>();
  const custom: LabOption[] = [];

  for (const option of defaults) {
    merged.set(normalizeCustomOption(option.label), option);
  }

  for (const option of customOptions) {
    const label = cleanCustomOption(option.label || option.value);
    if (!label) continue;
    const key = normalizeCustomOption(label);
    const next = { value: option.value || label, label, isDefault: Boolean(option.isDefault) };

    if (next.isDefault) {
      merged.set(key, next);
    } else if (!merged.has(key)) {
      merged.set(key, next);
      custom.push(next);
    }
  }

  return [
    ...defaults.map((option) => merged.get(normalizeCustomOption(option.label)) || option),
    ...custom.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')),
  ];
}

export function labelForLabOption(optionType: LabOptionType, value: string | null | undefined): string {
  if (!value) return '-';
  const options = DEFAULT_OPTIONS_BY_TYPE[optionType] || [];
  const normalized = normalizeCustomOption(value);
  return options.find((option) => (
    normalizeCustomOption(option.value) === normalized
    || normalizeCustomOption(option.label) === normalized
  ))?.label || value;
}
