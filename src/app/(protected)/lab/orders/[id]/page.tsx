import { notFound } from 'next/navigation';
import { LabOrderDetailActions } from '@/components/orders/OrderDetailActions';
import { OrderDetailView, type OrderDetailData, type OrderHistoryDetail, type OrderItemDetail } from '@/components/orders/OrderDetailView';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Detalhe do Pedido | LenteLink' };

function normalizeRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation ?? null;
}

export default async function LabOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  const labId = profile?.lab_id;
  if (!labId) notFound();

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id,
      lab_id,
      order_number,
      status,
      priority,
      desired_delivery_date,
      notes,
      internal_notes,
      confirmed_at,
      created_at,
      updated_at,
      optical_store:optical_stores(name, document, responsible_name, email, phone)
    `)
    .eq('id', id)
    .eq('lab_id', labId)
    .single();

  if (!order) notFound();

  const [{ data: items }, { data: history }] = await Promise.all([
    supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        sphere_esf,
        cylinder_cil,
        axis,
        addition_add,
        side,
        item_notes,
        lens_type:lens_types(name, brand, category, material),
        lens_variant:lens_variants(sku, quantity_available)
      `)
      .eq('order_id', id)
      .eq('lab_id', labId)
      .order('created_at', { ascending: true }),
    supabase
      .from('order_status_history')
      .select('id, old_status, new_status, changed_by_profile_id, notes, created_at')
      .eq('order_id', id)
      .eq('lab_id', labId)
      .order('created_at', { ascending: false }),
  ]);

  const profileIds = Array.from(new Set((history || []).map((entry) => entry.changed_by_profile_id).filter(Boolean)));
  const { data: profiles } = profileIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', profileIds)
    : { data: [] };
  const profileMap = new Map((profiles || []).map((entry) => [entry.id, entry.full_name]));

  const typedOrder = {
    ...order,
    optical_store: normalizeRelation(order.optical_store),
  } as OrderDetailData;

  const typedItems = (items || []).map((item) => ({
    ...item,
    lens_type: normalizeRelation(item.lens_type),
    lens_variant: normalizeRelation(item.lens_variant),
  })) as OrderItemDetail[];

  const typedHistory = (history || []).map((entry) => ({
    ...entry,
    changed_by_name: profileMap.get(entry.changed_by_profile_id) || null,
  })) as OrderHistoryDetail[];

  return (
    <OrderDetailView
      order={typedOrder}
      items={typedItems}
      history={typedHistory}
      backHref="/lab/orders"
      eyebrow="Pedido recebido"
      description="Detalhes operacionais, itens, historico e observacoes do pedido recebido da otica."
      showInternalNotes
      sideActions={<LabOrderDetailActions orderId={typedOrder.id} status={typedOrder.status} internalNotes={typedOrder.internal_notes} />}
    />
  );
}
