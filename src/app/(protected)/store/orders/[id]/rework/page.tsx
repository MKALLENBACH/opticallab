import { notFound } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { ReworkOrderForm } from '@/components/orders/ReworkOrderForm';
import { EmptyState, PageHeader, SectionCard } from '@/components/ui/Premium';
import { createClient } from '@/lib/supabase/server';
import { variantFromRow } from '@/components/orders/orderDraft';
import { getLabCustomOptions } from '@/lib/data/lab-custom-options';

export const metadata = { title: 'Abrir Retrabalho | LenteLink' };

function normalizeRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation ?? null;
}

async function fetchVariants(supabase: Awaited<ReturnType<typeof createClient>>, labId: string) {
  const { data } = await supabase
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
    .order('sku', { ascending: true });

  return (data || []).map((row) => variantFromRow(row as Record<string, unknown>));
}

export default async function StoreReworkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, lab_id, optical_store_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  let labId = profile?.lab_id ?? null;
  const storeId = profile?.optical_store_id ?? null;

  if (!labId && storeId) {
    const { data: store } = await supabase
      .from('optical_stores')
      .select('lab_id')
      .eq('id', storeId)
      .single();
    labId = store?.lab_id ?? null;
  }

  if (!profile?.id || !labId || !storeId) notFound();

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      order_type,
      confirmed_at,
      created_at,
      optical_store:optical_stores(name)
    `)
    .eq('id', id)
    .eq('lab_id', labId)
    .eq('optical_store_id', storeId)
    .single();

  if (!order) notFound();

  if (order.status !== 'finalizado' || order.order_type === 'rework') {
    const isNestedRework = order.order_type === 'rework';

    return (
      <div className="space-y-6 animate-slide-up">
        <PageHeader
          backHref={`/store/orders/${id}`}
          eyebrow="Retrabalho"
          title="Retrabalho indisponivel"
          description={isNestedRework ? 'Abra o retrabalho pelo pedido original finalizado.' : 'Apenas pedidos finalizados podem gerar retrabalho.'}
        />
        <SectionCard
          icon={AlertTriangle}
          title={isNestedRework ? 'Pedido ja e um retrabalho' : 'Pedido nao finalizado'}
          description={isNestedRework ? 'Nao e possivel encadear retrabalho sobre outro retrabalho.' : 'Este pedido ainda nao passou por todo o fluxo operacional.'}
        >
          <EmptyState
            icon={AlertTriangle}
            title={isNestedRework ? 'Abra retrabalho a partir do pedido original.' : 'Retrabalho so pode ser aberto para pedidos finalizados.'}
            description={isNestedRework ? 'Use o pedido finalizado que originou este retrabalho para preservar o historico corretamente.' : 'Finalize o pedido antes de solicitar refacao, substituicao ou analise.'}
          />
        </SectionCard>
      </div>
    );
  }

  const [{ data: items }, variants, customOptions] = await Promise.all([
    supabase
      .from('order_items')
      .select(`
        id,
        lens_type_id,
        lens_variant_id,
        quantity,
        sphere_esf,
        cylinder_cil,
        axis,
        addition_add,
        side,
        item_notes,
        lens_type:lens_types(name, brand, category, material, refractive_index, treatments),
        lens_variant:lens_variants(id, sku, quantity_available)
      `)
      .eq('order_id', id)
      .eq('lab_id', labId)
      .order('created_at', { ascending: true }),
    fetchVariants(supabase, labId),
    getLabCustomOptions(['rework_reason'], labId),
  ]);

  return (
    <ReworkOrderForm
      actor="store"
      labId={labId}
      profileId={profile.id}
      parentOrder={{ ...order, optical_store: normalizeRelation(order.optical_store) }}
      items={(items || []).map((item) => ({
        ...item,
        lens_type: normalizeRelation(item.lens_type),
        lens_variant: normalizeRelation(item.lens_variant),
      }))}
      variants={variants}
      reworkReasonOptions={customOptions.rework_reason || []}
    />
  );
}
