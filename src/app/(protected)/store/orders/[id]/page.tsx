import { notFound } from 'next/navigation';
import { StoreOrderDetailActions } from '@/components/orders/OrderDetailActions';
import { OrderDetailView, type OrderDetailData, type OrderHistoryDetail, type OrderItemDetail } from '@/components/orders/OrderDetailView';
import { createClient } from '@/lib/supabase/server';
import { getOrderAttachmentViews } from '@/lib/data/order-attachments';

export const metadata = { title: 'Detalhe do Pedido | LenteLink' };

function normalizeRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation ?? null;
}

export default async function StoreOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id, optical_store_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  const labId = profile?.lab_id;
  const storeId = profile?.optical_store_id;
  if (!labId || !storeId) notFound();

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id,
      lab_id,
      order_number,
      status,
      order_type,
      special_status,
      parent_order_id,
      rework_reason,
      rework_status,
      rework_opened_by_role,
      rework_rejected_reason,
      rework_accepted_at,
      priority,
      desired_delivery_date,
      estimated_delivery_date,
      lab_estimated_delivery_notes,
      special_rejection_reason,
      notes,
      internal_notes,
      confirmed_at,
      created_at,
      updated_at,
      optical_store:optical_stores(name, document, responsible_name, email, phone)
    `)
    .eq('id', id)
    .eq('lab_id', labId)
    .eq('optical_store_id', storeId)
    .single();

  if (!order) notFound();

  const [{ data: items }, { data: history }, { data: parentOrder }, { data: linkedReworks }, attachments] = await Promise.all([
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
        source_order_item_id,
        rework_action,
        lens_type:lens_types(name, brand, category, material, refractive_index, treatments),
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
    order.parent_order_id
      ? supabase
        .from('orders')
        .select('id, order_number, status')
        .eq('id', order.parent_order_id)
        .eq('lab_id', labId)
        .eq('optical_store_id', storeId)
        .single()
      : Promise.resolve({ data: null }),
    supabase
      .from('orders')
      .select('id, order_number, status, rework_status')
      .eq('parent_order_id', id)
      .eq('lab_id', labId)
      .eq('optical_store_id', storeId)
      .eq('order_type', 'rework')
      .order('created_at', { ascending: false }),
    getOrderAttachmentViews(id, labId),
  ]);

  const profileIds = Array.from(new Set((history || []).map((entry) => entry.changed_by_profile_id).filter(Boolean)));
  const { data: profiles } = profileIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', profileIds)
    : { data: [] };
  const profileMap = new Map((profiles || []).map((entry) => [entry.id, entry.full_name]));

  const typedOrder = {
    ...order,
    optical_store: normalizeRelation(order.optical_store),
    parent_order: parentOrder || null,
    linked_reworks: linkedReworks || [],
    attachments,
  } as OrderDetailData;

  const typedItems = (items || []).map((item) => ({
    ...item,
    lens_type: normalizeRelation(item.lens_type),
    lens_variant: normalizeRelation(item.lens_variant),
  })) as OrderItemDetail[];

  const typedHistory = (history || []).map((entry) => ({
    ...entry,
    changed_by_name: profileMap.get(entry.changed_by_profile_id)
      || (entry.old_status && entry.old_status !== entry.new_status ? 'Laboratorio' : null),
  })) as OrderHistoryDetail[];

  return (
    <OrderDetailView
      order={typedOrder}
      items={typedItems}
      history={typedHistory}
      backHref="/store/orders"
      eyebrow="Meu pedido"
      description="Acompanhe status, itens solicitados e historico do pedido enviado ao laboratorio."
      sideActions={<StoreOrderDetailActions orderId={typedOrder.id} status={typedOrder.status} orderType={typedOrder.order_type} />}
    />
  );
}
