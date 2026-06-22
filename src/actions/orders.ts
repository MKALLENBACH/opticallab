'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { canTransitionStatus } from '@/lib/constants/order-flow';
import { OrderPriority, OrderStatus, UserRole } from '@/lib/types/enums';

const orderBuilderItemSchema = z.object({
  lens_variant_id: z.string().uuid('Lente invalida.'),
  quantity: z.number().int().min(1, 'Quantidade deve ser maior que zero.'),
  item_notes: z.string().trim().max(1000).nullable().optional(),
});

const storeOrderPayloadSchema = z.object({
  notes: z.string().trim().max(2000).nullable().optional(),
  priority: z.nativeEnum(OrderPriority).default(OrderPriority.NORMAL),
  desired_delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  items: z.array(orderBuilderItemSchema).min(1, 'Adicione pelo menos uma lente ao pedido.'),
});

const updateStatusSchema = z.object({
  orderId: z.string().uuid(),
  nextStatus: z.nativeEnum(OrderStatus),
  internalNotes: z.string().trim().max(2000).nullable().optional(),
});

type StoreOrderPayload = z.infer<typeof storeOrderPayloadSchema>;
type ValidatedOrderItem = StoreOrderPayload['items'][number] & {
  lens_type_id: string;
  sphere_esf: number | null;
  cylinder_cil: number | null;
  axis: number | null;
  addition_add: number | null;
  prism: string | null;
  prism_base: string | null;
  base_curve: number | null;
  diameter: number | null;
  side: string | null;
};

type ProfileContext = {
  id: string;
  role: UserRole;
  lab_id: string;
  optical_store_id: string | null;
};

function normalizeRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation ?? null;
}

async function getProfileContext() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return { supabase, error: 'Sessao expirada. Faca login novamente.' as const };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role, lab_id, optical_store_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (error || !profile) {
    return { supabase, error: 'Perfil nao encontrado para o usuario autenticado.' as const };
  }

  let labId = profile.lab_id as string | null;

  if (!labId && profile.optical_store_id) {
    const { data: store } = await supabase
      .from('optical_stores')
      .select('lab_id')
      .eq('id', profile.optical_store_id)
      .single();
    labId = store?.lab_id ?? null;
  }

  if (!labId) {
    return { supabase, error: 'Laboratorio vinculado nao encontrado.' as const };
  }

  return {
    supabase,
    profile: {
      id: profile.id,
      role: profile.role as UserRole,
      lab_id: labId,
      optical_store_id: profile.optical_store_id,
    } satisfies ProfileContext,
  };
}

async function validateStoreOrderItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  labId: string,
  rawItems: StoreOrderPayload['items']
): Promise<{ items?: ValidatedOrderItem[]; error?: string }> {
  const labSettingsResult = await supabase
    .from('lab_settings')
    .select('allow_order_when_out_of_stock')
    .eq('lab_id', labId)
    .single();

  const labAllowsOutOfStock = labSettingsResult.data?.allow_order_when_out_of_stock ?? true;
  const variantIds = rawItems.map((item) => item.lens_variant_id);

  if (new Set(variantIds).size !== variantIds.length) {
    return { error: 'Ha lentes duplicadas no pedido. Ajuste a quantidade no item existente.' };
  }

  const { data: variants, error } = await supabase
    .from('lens_variants')
    .select(`
      id,
      lab_id,
      lens_type_id,
      sphere_esf,
      cylinder_cil,
      axis,
      addition_add,
      prism,
      prism_base,
      base_curve,
      diameter,
      side,
      quantity_available,
      status,
      lens_type:lens_types(id, status, allow_order_when_out_of_stock)
    `)
    .in('id', variantIds)
    .eq('lab_id', labId);

  if (error) {
    return { error: 'Nao foi possivel validar as lentes selecionadas.' };
  }

  const variantMap = new Map((variants || []).map((variant) => [variant.id, variant]));
  const validated: ValidatedOrderItem[] = [];

  for (const item of rawItems) {
    const variant = variantMap.get(item.lens_variant_id);
    if (!variant) {
      return { error: 'Uma das lentes selecionadas nao pertence ao laboratorio vinculado.' };
    }

    if (variant.status !== 'active') {
      return { error: `A lente ${item.lens_variant_id} nao esta ativa para pedidos.` };
    }

    const lensType = normalizeRelation(variant.lens_type as {
      id: string;
      status: string;
      allow_order_when_out_of_stock: boolean | null;
    } | {
      id: string;
      status: string;
      allow_order_when_out_of_stock: boolean | null;
    }[] | null);

    if (!lensType || lensType.status !== 'active') {
      return { error: 'Uma das lentes selecionadas nao esta ativa no catalogo.' };
    }

    const canOrderWithoutStock = lensType.allow_order_when_out_of_stock ?? labAllowsOutOfStock;
    const quantityAvailable = Number(variant.quantity_available ?? 0);

    if (quantityAvailable < item.quantity && !canOrderWithoutStock) {
      return {
        error: `Estoque insuficiente para o SKU selecionado e este item nao permite pedido sem pronta entrega.`,
      };
    }

    validated.push({
      ...item,
      lens_type_id: variant.lens_type_id,
      sphere_esf: variant.sphere_esf === null ? null : Number(variant.sphere_esf),
      cylinder_cil: variant.cylinder_cil === null ? null : Number(variant.cylinder_cil),
      axis: variant.axis === null ? null : Number(variant.axis),
      addition_add: variant.addition_add === null ? null : Number(variant.addition_add),
      prism: variant.prism,
      prism_base: variant.prism_base,
      base_curve: variant.base_curve === null ? null : Number(variant.base_curve),
      diameter: variant.diameter === null ? null : Number(variant.diameter),
      side: variant.side,
    });
  }

  return { items: validated };
}

function revalidateOrderRoutes(orderId?: string) {
  revalidatePath('/store/orders');
  revalidatePath('/lab/orders');
  revalidatePath('/store/dashboard');
  revalidatePath('/lab/dashboard');
  if (orderId) {
    revalidatePath(`/store/orders/${orderId}`);
    revalidatePath(`/lab/orders/${orderId}`);
  }
}

export async function createStoreOrderAction(payload: StoreOrderPayload) {
  const parsed = storeOrderPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Revise os dados do pedido.' };
  }

  const context = await getProfileContext();
  if ('error' in context) return { error: context.error };

  const { supabase, profile } = context;

  if (!profile.optical_store_id || ![UserRole.OPTICAL_ADMIN, UserRole.OPTICAL_USER].includes(profile.role)) {
    return { error: 'Apenas usuarios de otica podem criar pedidos por este fluxo.' };
  }

  const validated = await validateStoreOrderItems(supabase, profile.lab_id, parsed.data.items);
  if (validated.error || !validated.items) return { error: validated.error || 'Itens invalidos.' };

  const { data: orderNumber, error: numberError } = await supabase.rpc('get_next_order_number', {
    p_lab_id: profile.lab_id,
  });

  if (numberError || !orderNumber) {
    return { error: 'Nao foi possivel gerar o numero do pedido.' };
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      lab_id: profile.lab_id,
      optical_store_id: profile.optical_store_id,
      order_number: orderNumber,
      status: OrderStatus.AGUARDANDO_CONFIRMACAO,
      priority: parsed.data.priority,
      desired_delivery_date: parsed.data.desired_delivery_date || null,
      requested_by_profile_id: profile.id,
      notes: parsed.data.notes || null,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    return { error: 'Nao foi possivel criar o pedido.' };
  }

  const { error: itemsError } = await supabase.from('order_items').insert(
    validated.items.map((item) => ({
      order_id: order.id,
      lab_id: profile.lab_id,
      lens_type_id: item.lens_type_id,
      lens_variant_id: item.lens_variant_id,
      quantity: item.quantity,
      sphere_esf: item.sphere_esf,
      cylinder_cil: item.cylinder_cil,
      axis: item.axis,
      addition_add: item.addition_add,
      prism: item.prism,
      prism_base: item.prism_base,
      base_curve: item.base_curve,
      diameter: item.diameter,
      side: item.side,
      item_notes: item.item_notes || null,
    }))
  );

  if (itemsError) {
    return { error: 'Pedido criado, mas houve erro ao vincular os itens. Contate o laboratorio.' };
  }

  await supabase.from('order_status_history').insert({
    order_id: order.id,
    lab_id: profile.lab_id,
    old_status: null,
    new_status: OrderStatus.AGUARDANDO_CONFIRMACAO,
    changed_by_profile_id: profile.id,
    notes: 'Pedido criado pela otica.',
  });

  revalidateOrderRoutes(order.id);
  return { success: true, orderId: order.id };
}

export async function updateStoreOrderAction(orderId: string, payload: StoreOrderPayload) {
  const parsed = storeOrderPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Revise os dados do pedido.' };
  }

  const context = await getProfileContext();
  if ('error' in context) return { error: context.error };

  const { supabase, profile } = context;

  if (!profile.optical_store_id || ![UserRole.OPTICAL_ADMIN, UserRole.OPTICAL_USER].includes(profile.role)) {
    return { error: 'Apenas usuarios de otica podem editar este pedido.' };
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status, lab_id, optical_store_id')
    .eq('id', orderId)
    .eq('lab_id', profile.lab_id)
    .eq('optical_store_id', profile.optical_store_id)
    .single();

  if (orderError || !order) {
    return { error: 'Pedido nao encontrado.' };
  }

  if (order.status !== OrderStatus.AGUARDANDO_CONFIRMACAO) {
    return { error: 'Este pedido ja foi confirmado pelo laboratorio. Para alteracoes, entre em contato com o laboratorio.' };
  }

  const validated = await validateStoreOrderItems(supabase, profile.lab_id, parsed.data.items);
  if (validated.error || !validated.items) return { error: validated.error || 'Itens invalidos.' };

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      priority: parsed.data.priority,
      desired_delivery_date: parsed.data.desired_delivery_date || null,
      notes: parsed.data.notes || null,
    })
    .eq('id', orderId);

  if (updateError) {
    return { error: 'Nao foi possivel atualizar os dados do pedido.' };
  }

  const { error: deleteError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', orderId)
    .eq('lab_id', profile.lab_id);

  if (deleteError) {
    return { error: 'Nao foi possivel substituir os itens do pedido.' };
  }

  const { error: insertError } = await supabase.from('order_items').insert(
    validated.items.map((item) => ({
      order_id: orderId,
      lab_id: profile.lab_id,
      lens_type_id: item.lens_type_id,
      lens_variant_id: item.lens_variant_id,
      quantity: item.quantity,
      sphere_esf: item.sphere_esf,
      cylinder_cil: item.cylinder_cil,
      axis: item.axis,
      addition_add: item.addition_add,
      prism: item.prism,
      prism_base: item.prism_base,
      base_curve: item.base_curve,
      diameter: item.diameter,
      side: item.side,
      item_notes: item.item_notes || null,
    }))
  );

  if (insertError) {
    return { error: 'Nao foi possivel salvar os itens atualizados.' };
  }

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    lab_id: profile.lab_id,
    old_status: OrderStatus.AGUARDANDO_CONFIRMACAO,
    new_status: OrderStatus.AGUARDANDO_CONFIRMACAO,
    changed_by_profile_id: profile.id,
    notes: 'Pedido editado pela otica.',
  });

  revalidateOrderRoutes(orderId);
  return { success: true, orderId };
}

export async function updateLabOrderStatusAction(input: z.infer<typeof updateStatusSchema>) {
  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) return { error: 'Transicao de status invalida.' };

  const context = await getProfileContext();
  if ('error' in context) return { error: context.error };

  const { supabase, profile } = context;

  if (![UserRole.LAB_ADMIN, UserRole.LAB_USER].includes(profile.role)) {
    return { error: 'Apenas usuarios do laboratorio podem alterar status.' };
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status, lab_id, internal_notes')
    .eq('id', parsed.data.orderId)
    .eq('lab_id', profile.lab_id)
    .single();

  if (orderError || !order) return { error: 'Pedido nao encontrado.' };

  const currentStatus = order.status as OrderStatus;
  const nextStatus = parsed.data.nextStatus;

  if (!canTransitionStatus(currentStatus, nextStatus, true)) {
    return { error: 'Esta transicao de status nao e permitida.' };
  }

  if (nextStatus === OrderStatus.CONFIRMADO) {
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('id, lens_variant_id, quantity, lens_variant:lens_variants(id, quantity_available, sku)')
      .eq('order_id', order.id)
      .eq('lab_id', profile.lab_id);

    if (itemsError) return { error: 'Nao foi possivel validar o estoque dos itens.' };

    for (const item of items || []) {
      const variant = normalizeRelation(item.lens_variant as { id: string; quantity_available: number; sku: string } | { id: string; quantity_available: number; sku: string }[] | null);
      if (!variant) continue;

      if (Number(variant.quantity_available ?? 0) < Number(item.quantity ?? 0)) {
        return { error: `Estoque insuficiente para confirmar este pedido. Ajuste o estoque ou edite o pedido. SKU: ${variant.sku}.` };
      }
    }

    for (const item of items || []) {
      const variant = normalizeRelation(item.lens_variant as { id: string; quantity_available: number; sku: string } | { id: string; quantity_available: number; sku: string }[] | null);
      if (!variant) continue;

      const newQuantity = Number(variant.quantity_available ?? 0) - Number(item.quantity ?? 0);
      const { error: stockError } = await supabase
        .from('lens_variants')
        .update({ quantity_available: newQuantity })
        .eq('id', variant.id)
        .eq('lab_id', profile.lab_id);

      if (stockError) return { error: `Nao foi possivel baixar o estoque do SKU ${variant.sku}.` };

      await supabase.from('inventory_movements').insert({
        lab_id: profile.lab_id,
        lens_variant_id: variant.id,
        movement_type: 'saida',
        quantity: Number(item.quantity ?? 0),
        reason: 'Confirmacao de pedido',
        order_id: order.id,
        created_by_profile_id: profile.id,
      });
    }
  }

  if (nextStatus === OrderStatus.CANCELADO && currentStatus !== OrderStatus.AGUARDANDO_CONFIRMACAO) {
    const { data: movements } = await supabase
      .from('inventory_movements')
      .select('lens_variant_id, quantity')
      .eq('order_id', order.id)
      .eq('lab_id', profile.lab_id)
      .eq('movement_type', 'saida');

    for (const movement of movements || []) {
      const { data: variant } = await supabase
        .from('lens_variants')
        .select('id, quantity_available')
        .eq('id', movement.lens_variant_id)
        .eq('lab_id', profile.lab_id)
        .single();

      if (!variant) continue;

      await supabase
        .from('lens_variants')
        .update({ quantity_available: Number(variant.quantity_available ?? 0) + Number(movement.quantity ?? 0) })
        .eq('id', variant.id)
        .eq('lab_id', profile.lab_id);

      await supabase.from('inventory_movements').insert({
        lab_id: profile.lab_id,
        lens_variant_id: variant.id,
        movement_type: 'cancelamento',
        quantity: Number(movement.quantity ?? 0),
        reason: 'Cancelamento de pedido',
        order_id: order.id,
        created_by_profile_id: profile.id,
      });
    }
  }

  const updatePayload: Record<string, unknown> = {
    status: nextStatus,
  };

  if (nextStatus === OrderStatus.CONFIRMADO) {
    updatePayload.confirmed_by_profile_id = profile.id;
    updatePayload.confirmed_at = new Date().toISOString();
  }

  if (parsed.data.internalNotes !== undefined) {
    updatePayload.internal_notes = parsed.data.internalNotes || null;
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', order.id)
    .eq('lab_id', profile.lab_id);

  if (updateError) return { error: 'Nao foi possivel atualizar o status do pedido.' };

  await supabase.from('order_status_history').insert({
    order_id: order.id,
    lab_id: profile.lab_id,
    old_status: currentStatus,
    new_status: nextStatus,
    changed_by_profile_id: profile.id,
    notes: parsed.data.internalNotes || null,
  });

  revalidateOrderRoutes(order.id);
  return { success: true };
}

export async function updateLabOrderNotesAction(orderId: string, internalNotes: string) {
  const context = await getProfileContext();
  if ('error' in context) return { error: context.error };

  const { supabase, profile } = context;

  if (![UserRole.LAB_ADMIN, UserRole.LAB_USER].includes(profile.role)) {
    return { error: 'Apenas usuarios do laboratorio podem alterar observacoes internas.' };
  }

  const { error } = await supabase
    .from('orders')
    .update({ internal_notes: internalNotes.trim() || null })
    .eq('id', orderId)
    .eq('lab_id', profile.lab_id);

  if (error) return { error: 'Nao foi possivel salvar a observacao interna.' };

  revalidateOrderRoutes(orderId);
  return { success: true };
}
