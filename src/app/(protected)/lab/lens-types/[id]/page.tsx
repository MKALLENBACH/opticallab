import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/Premium';
import { getLabCustomOptions } from '@/lib/data/lab-custom-options';
import { createClient } from '@/lib/supabase/server';
import { EntityStatus } from '@/lib/types/enums';
import { LensTypeForm } from '../new/LensTypeForm';

export default async function EditLensTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (!profile?.lab_id) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Laboratorio nao encontrado.</p>
      </div>
    );
  }

  const [{ data: lens }, optionGroups] = await Promise.all([
    supabase
      .from('lens_types')
      .select(`
        id,
        name,
        brand,
        model,
        category,
        material,
        refractive_index,
        treatments,
        allow_order_when_out_of_stock,
        default_delivery_time_in_stock_days,
        default_production_time_out_of_stock_days,
        description,
        status
      `)
      .eq('id', id)
      .eq('lab_id', profile.lab_id)
      .single(),
    getLabCustomOptions([
      'brand',
      'lens_category',
      'lens_material',
      'refractive_index',
      'lens_treatment',
    ], profile.lab_id),
  ]);

  if (!lens) notFound();

  const initialData = {
    ...lens,
    category: lens.category as string | null,
    material: lens.material as string | null,
    refractive_index: lens.refractive_index as string | null,
    treatments: (lens.treatments || []) as string[],
    status: lens.status as EntityStatus,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backHref="/lab/lens-types"
        eyebrow="Catalogo"
        title="Editar lente base"
        description="Atualize dados comerciais, tratamentos, status e prazos usados na busca das oticas."
      />

      <LensTypeForm
        mode="edit"
        initialData={initialData}
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
