import { PageHeader } from '@/components/ui/Premium';
import { getLabCustomOptions } from '@/lib/data/lab-custom-options';
import { LensTypeForm } from './LensTypeForm';

export default async function NewLensTypePage() {
  const optionGroups = await getLabCustomOptions([
    'brand',
    'lens_category',
    'lens_material',
    'refractive_index',
    'lens_treatment',
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backHref="/lab/lens-types"
        eyebrow="Catalogo"
        title="Nova lente base"
        description="Cadastre a lente tecnica, materiais, tratamentos e prazos padrao antes de criar SKUs por grau."
      />

      <LensTypeForm
        optionGroups={{
          brand: optionGroups.brand || [],
          lens_category: optionGroups.lens_category || [],
          lens_material: optionGroups.lens_material || [],
          refractive_index: optionGroups.refractive_index || [],
          lens_treatment: optionGroups.lens_treatment || [],
        }}
      />
    </div>
  );
}
