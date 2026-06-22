import { notFound } from 'next/navigation';
import { OrderBuilder, type EditableOrderDraft } from '@/components/orders/OrderBuilder';
import { variantFromRow, type OrderDraftItem } from '@/components/orders/orderDraft';
import { createClient } from '@/lib/supabase/server';
import { OrderPriority, OrderStatus } from '@/lib/types/enums';

export const metadata = { title: 'Novo Pedido | LenteLink' };

function normalizeRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation ?? null;
}

function toVariantRow(item: Record<string, unknown>) {
  const lensVariant = normalizeRelation(item.lens_variant as Record<string, unknown> | Record<string, unknown>[] | null);
  const lensType = normalizeRelation(item.lens_type as Record<string, unknown> | Record<string, unknown>[] | null);

  return {
    ...(lensVariant || {}),
    id: item.lens_variant_id || lensVariant?.id,
    lens_type_id: item.lens_type_id || lensType?.id || lensVariant?.lens_type_id,
    sku: lensVariant?.sku || '',
    sphere_esf: item.sphere_esf ?? lensVariant?.sphere_esf,
    cylinder_cil: item.cylinder_cil ?? lensVariant?.cylinder_cil,
    axis: item.axis ?? lensVariant?.axis,
    addition_add: item.addition_add ?? lensVariant?.addition_add,
    lens_type: lensType,
  } as Record<string, unknown>;
}

export default async function NewStoreOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ variantId?: string; editId?: string }>;
}) {
  const { variantId, editId } = await searchParams;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id, optical_store_id')
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

  if (!labId || !storeId) {
    return (
      <OrderBuilder
        blockedMessage="Sua otica precisa estar vinculada a um laboratorio antes de criar pedidos."
      />
    );
  }

  if (editId) {
    const { data: order } = await supabase
      .from('orders')
      .select('id, status, notes, priority, desired_delivery_date')
      .eq('id', editId)
      .eq('lab_id', labId)
      .eq('optical_store_id', storeId)
      .single();

    if (!order) notFound();

    const { data: items } = await supabase
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
        item_notes,
        lens_type:lens_types(
          id,
          name,
          brand,
          category,
          material,
          refractive_index,
          treatments,
          allow_order_when_out_of_stock,
          default_delivery_time_in_stock_days,
          default_production_time_out_of_stock_days
        ),
        lens_variant:lens_variants(
          id,
          lens_type_id,
          sku,
          sphere_esf,
          cylinder_cil,
          axis,
          addition_add,
          quantity_available,
          minimum_stock,
          delivery_time_in_stock_days,
          production_time_out_of_stock_days
        )
      `)
      .eq('order_id', editId)
      .eq('lab_id', labId)
      .order('created_at', { ascending: true });

    const editableItems = (items || []).map((item) => ({
      variant: variantFromRow(toVariantRow(item as Record<string, unknown>)),
      quantity: Number(item.quantity ?? 1),
      item_notes: item.item_notes || '',
    })) as OrderDraftItem[];

    const editOrder: EditableOrderDraft = {
      id: order.id,
      status: order.status,
      notes: order.notes || '',
      priority: (order.priority as OrderPriority) || OrderPriority.NORMAL,
      desired_delivery_date: order.desired_delivery_date || '',
      items: editableItems,
    };

    return (
      <OrderBuilder
        editOrder={editOrder}
        blockedMessage={order.status !== OrderStatus.AGUARDANDO_CONFIRMACAO
          ? 'Este pedido ja foi confirmado pelo laboratorio. Somente pedidos aguardando confirmacao podem ser editados pela otica.'
          : null}
      />
    );
  }

  const { data: selectedVariant } = variantId
    ? await supabase
      .from('lens_variants')
      .select(`
        id,
        lens_type_id,
        sku,
        sphere_esf,
        cylinder_cil,
        axis,
        addition_add,
        quantity_available,
        minimum_stock,
        delivery_time_in_stock_days,
        production_time_out_of_stock_days,
        lens_type:lens_types(
          id,
          name,
          brand,
          category,
          material,
          refractive_index,
          treatments,
          allow_order_when_out_of_stock,
          default_delivery_time_in_stock_days,
          default_production_time_out_of_stock_days
        )
      `)
      .eq('id', variantId)
      .eq('lab_id', labId)
      .eq('status', 'active')
      .single()
    : { data: null };

  return (
    <OrderBuilder
      initialVariant={selectedVariant ? variantFromRow(selectedVariant as Record<string, unknown>) : null}
    />
  );
}
