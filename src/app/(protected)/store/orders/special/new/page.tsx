import { createClient } from '@/lib/supabase/server';
import { SpecialOrderForm } from './SpecialOrderForm';

export const metadata = { title: 'Pedido Especial | LenteLink' };

export default async function NewSpecialOrderPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, lab_id, optical_store_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  let labId = profile?.lab_id ?? null;

  if (!labId && profile?.optical_store_id) {
    const { data: store } = await supabase
      .from('optical_stores')
      .select('lab_id')
      .eq('id', profile.optical_store_id)
      .single();
    labId = store?.lab_id ?? null;
  }

  if (!profile?.id || !labId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Otica sem laboratorio vinculado.</p>
      </div>
    );
  }

  const [{ data: lensTypes }, { data: variants }] = await Promise.all([
    supabase
      .from('lens_types')
      .select('id, name, brand, category, material, refractive_index, treatments')
      .eq('lab_id', labId)
      .eq('status', 'active')
      .order('name', { ascending: true }),
    supabase
      .from('lens_variants')
      .select(`
        id,
        lens_type_id,
        sku,
        sphere_esf,
        cylinder_cil,
        axis,
        addition_add,
        side,
        quantity_available,
        minimum_stock,
        delivery_time_in_stock_days,
        production_time_out_of_stock_days,
        lens_type:lens_types!inner(
          id,
          name,
          brand,
          status,
          category,
          material,
          refractive_index,
          treatments,
          allow_order_when_out_of_stock,
          default_delivery_time_in_stock_days,
          default_production_time_out_of_stock_days
        )
      `)
      .eq('lab_id', labId)
      .eq('status', 'active')
      .eq('lens_type.status', 'active')
      .order('quantity_available', { ascending: false })
      .order('sku', { ascending: true }),
  ]);

  return (
    <SpecialOrderForm
      lensTypes={(lensTypes || []).map((lensType) => ({
        ...lensType,
        treatments: Array.isArray(lensType.treatments) ? lensType.treatments.map(String) : [],
      }))}
      variants={(variants || []) as Record<string, unknown>[]}
      labId={labId}
      profileId={profile.id}
    />
  );
}
