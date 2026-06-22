export interface TreatmentOption {
  value: string;
  label: string;
  isDefault?: boolean;
}

export const DEFAULT_TREATMENT_OPTIONS: TreatmentOption[] = [
  { value: 'Antirreflexo', label: 'Antirreflexo', isDefault: true },
  { value: 'Blue Cut', label: 'Blue Cut', isDefault: true },
  { value: 'Fotossensível', label: 'Fotossensível', isDefault: true },
  { value: 'Polarizada', label: 'Polarizada', isDefault: true },
  { value: 'Proteção UV', label: 'Proteção UV', isDefault: true },
  { value: 'Endurecida', label: 'Endurecida', isDefault: true },
  { value: 'Hidrofóbica', label: 'Hidrofóbica', isDefault: true },
  { value: 'Oleofóbica', label: 'Oleofóbica', isDefault: true },
];

export const OTHER_TREATMENT_OPTION: TreatmentOption = { value: '__other__', label: 'Outro' };
export const AVAILABLE_TREATMENTS = [...DEFAULT_TREATMENT_OPTIONS, OTHER_TREATMENT_OPTION] as const;

const LEGACY_TREATMENT_LABELS: Record<string, string> = {
  antirreflexo: 'Antirreflexo',
  blue_cut: 'Blue Cut',
  fotossensivel: 'Fotossensível',
  polarizada: 'Polarizada',
  uv: 'Proteção UV',
  endurecida: 'Endurecida',
  hidrofobica: 'Hidrofóbica',
  oleofobica: 'Oleofóbica',
  outro: 'Outro',
};

export type TreatmentValue = string;

export function normalizeTreatmentName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function mergeTreatmentOptions(options: TreatmentOption[] = []): TreatmentOption[] {
  const merged = new Map<string, TreatmentOption>();
  const customOptions: TreatmentOption[] = [];

  for (const option of DEFAULT_TREATMENT_OPTIONS) {
    merged.set(normalizeTreatmentName(option.label), option);
  }

  for (const option of options) {
    const label = option.label.trim();
    if (!label) continue;

    const normalizedLabel = normalizeTreatmentName(label);
    const nextOption = {
      value: option.value || label,
      label,
      isDefault: option.isDefault,
    };

    if (option.isDefault) {
      merged.set(normalizedLabel, nextOption);
    } else if (!merged.has(normalizedLabel)) {
      customOptions.push(nextOption);
      merged.set(normalizedLabel, nextOption);
    }
  }

  return [
    ...DEFAULT_TREATMENT_OPTIONS.map((option) => merged.get(normalizeTreatmentName(option.label)) || option),
    ...customOptions.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')),
  ];
}

export function getTreatmentLabel(value: string): string {
  const legacyLabel = LEGACY_TREATMENT_LABELS[value];
  if (legacyLabel) return legacyLabel;

  const normalizedValue = normalizeTreatmentName(value);
  const treatment = DEFAULT_TREATMENT_OPTIONS.find((option) => (
    normalizeTreatmentName(option.value) === normalizedValue
    || normalizeTreatmentName(option.label) === normalizedValue
  ));

  return treatment ? treatment.label : value;
}
