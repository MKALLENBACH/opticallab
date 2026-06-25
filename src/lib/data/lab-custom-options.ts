import { createClient } from '@/lib/supabase/server';
import {
  mergeLabOptions,
  type LabOption,
  type LabOptionType,
} from '@/lib/constants/lab-options';

export type LabOptionsByType = Partial<Record<LabOptionType, LabOption[]>>;

export async function getLabCustomOptions(optionTypes: LabOptionType[], labId?: string | null): Promise<LabOptionsByType> {
  const supabase = await createClient();
  let resolvedLabId = labId ?? null;

  if (!resolvedLabId) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return {};

    const { data: profile } = await supabase
      .from('profiles')
      .select('lab_id, optical_store_id')
      .eq('auth_user_id', userData.user.id)
      .single();

    resolvedLabId = profile?.lab_id ?? null;

    if (!resolvedLabId && profile?.optical_store_id) {
      const { data: store } = await supabase
        .from('optical_stores')
        .select('lab_id')
        .eq('id', profile.optical_store_id)
        .single();
      resolvedLabId = store?.lab_id ?? null;
    }
  }

  if (!resolvedLabId || !optionTypes.length) return {};

  const [{ data }, { data: lensTypes }] = await Promise.all([
    supabase
      .from('lab_custom_options')
      .select('option_type, name')
      .eq('lab_id', resolvedLabId)
      .eq('status', 'active')
      .in('option_type', optionTypes)
      .order('name', { ascending: true }),
    optionTypes.some((type) => ['brand', 'lens_category', 'lens_material', 'refractive_index', 'lens_treatment'].includes(type))
      ? supabase
        .from('lens_types')
        .select('brand, category, material, refractive_index, treatments')
        .eq('lab_id', resolvedLabId)
      : Promise.resolve({ data: [] }),
  ]);

  const grouped: LabOptionsByType = {};

  for (const type of optionTypes) {
    const custom = (data || [])
      .filter((option) => option.option_type === type)
      .map((option) => ({ value: option.name, label: option.name, isDefault: false }));
    const existingFromCatalog = (lensTypes || []).flatMap((lensType) => {
      if (type === 'brand') return lensType.brand ? [String(lensType.brand)] : [];
      if (type === 'lens_category') return lensType.category ? [String(lensType.category)] : [];
      if (type === 'lens_material') return lensType.material ? [String(lensType.material)] : [];
      if (type === 'refractive_index') return lensType.refractive_index ? [String(lensType.refractive_index)] : [];
      if (type === 'lens_treatment') return Array.isArray(lensType.treatments) ? lensType.treatments.map(String) : [];
      return [];
    }).map((value) => ({ value, label: value, isDefault: false }));

    grouped[type] = mergeLabOptions(type, [...custom, ...existingFromCatalog]);
  }

  return grouped;
}
