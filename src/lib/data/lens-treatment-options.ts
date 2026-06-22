import { mergeTreatmentOptions, type TreatmentOption } from '@/lib/constants/treatments';
import { createClient } from '@/lib/supabase/server';

export async function getAvailableTreatmentOptions(): Promise<TreatmentOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lens_treatment_options')
    .select('name, is_default')
    .eq('status', 'active')
    .order('is_default', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    return mergeTreatmentOptions();
  }

  return mergeTreatmentOptions((data || []).map((option) => ({
    value: option.name,
    label: option.name,
    isDefault: Boolean(option.is_default),
  })));
}
