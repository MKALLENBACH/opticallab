import { PageHeader } from '@/components/ui/Premium';
import { createClient } from '@/lib/supabase/server';
import { mergeTreatmentOptions, type TreatmentOption } from '@/lib/constants/treatments';
import { LensTypeForm } from './LensTypeForm';

async function getTreatmentOptions(): Promise<TreatmentOption[]> {
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

export default async function NewLensTypePage() {
  const treatmentOptions = await getTreatmentOptions();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backHref="/lab/lens-types"
        eyebrow="Catalogo"
        title="Nova lente base"
        description="Cadastre a lente tecnica, materiais, tratamentos e prazos padrao antes de criar SKUs por grau."
      />

      <LensTypeForm treatmentOptions={treatmentOptions} />
    </div>
  );
}
