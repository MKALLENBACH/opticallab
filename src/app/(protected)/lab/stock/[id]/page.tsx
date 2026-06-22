import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/Premium';
import { createClient } from '@/lib/supabase/server';
import { EntityStatus, LensSide } from '@/lib/types/enums';
import { LensVariantForm } from '../new/LensVariantForm';

export default async function EditLensVariantPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: variant } = await supabase
    .from('lens_variants')
    .select(`
      id,
      lens_type_id,
      sku,
      barcode,
      sphere_esf,
      cylinder_cil,
      axis,
      addition_add,
      side,
      quantity_available,
      minimum_stock,
      location,
      delivery_time_in_stock_days,
      production_time_out_of_stock_days,
      status
    `)
    .eq('id', id)
    .eq('lab_id', profile.lab_id)
    .single();

  if (!variant) notFound();

  const { data: lensTypes } = await supabase
    .from('lens_types')
    .select('id, name, brand')
    .eq('lab_id', profile.lab_id)
    .or(`status.eq.active,id.eq.${variant.lens_type_id}`)
    .order('name');

  const initialData = {
    ...variant,
    side: variant.side as LensSide | null,
    status: variant.status as EntityStatus,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backHref="/lab/stock"
        eyebrow="Estoque"
        title="Editar SKU"
        description="Atualize grau, quantidade, prazos, status e os dados usados na busca das oticas."
      />

      <LensVariantForm mode="edit" initialData={initialData} lensTypes={lensTypes || []} />
    </div>
  );
}
