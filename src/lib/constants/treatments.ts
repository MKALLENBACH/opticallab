export const AVAILABLE_TREATMENTS = [
  { value: 'antirreflexo', label: 'Antirreflexo' },
  { value: 'blue_cut', label: 'Blue Cut' },
  { value: 'fotossensivel', label: 'Fotossensível' },
  { value: 'polarizada', label: 'Polarizada' },
  { value: 'uv', label: 'Proteção UV' },
  { value: 'endurecida', label: 'Endurecida' },
  { value: 'hidrofobica', label: 'Hidrofóbica' },
  { value: 'oleofobica', label: 'Oleofóbica' },
  { value: 'outro', label: 'Outro' },
] as const;

export type TreatmentValue = (typeof AVAILABLE_TREATMENTS)[number]['value'];

export function getTreatmentLabel(value: string): string {
  const treatment = AVAILABLE_TREATMENTS.find((t) => t.value === value);
  return treatment ? treatment.label : value;
}
