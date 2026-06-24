'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { canTransitionStatus } from '@/lib/constants/order-flow';
import { EntityStatus, LensSide, OrderPriority, OrderStatus, UserRole } from '@/lib/types/enums';

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

const lensPowerSchema = z.object({
  sphere_esf: z.number().min(-30, 'ESF deve estar entre -30.00 e +30.00.').max(30, 'ESF deve estar entre -30.00 e +30.00.'),
  cylinder_cil: z.number().min(-10, 'CIL deve estar entre -10.00 e +10.00.').max(10, 'CIL deve estar entre -10.00 e +10.00.').nullable().optional(),
  axis: z.number().int().min(0, 'Eixo deve estar entre 0 e 180.').max(180, 'Eixo deve estar entre 0 e 180.').nullable().optional(),
  addition_add: z.number().min(0, 'ADD deve estar entre 0.00 e +4.00.').max(4, 'ADD deve estar entre 0.00 e +4.00.').nullable().optional(),
});

const specialOrderPayloadSchema = z.object({
  lens_type_id: z.string().uuid('Selecione uma lente valida do catalogo.'),
  treatments: z.array(z.string()).default([]),
  side: z.nativeEnum(LensSide, { error: 'Selecione o lado da lente.' }),
  quantity: z.number().int().min(1, 'Quantidade deve ser maior que zero.'),
  desired_delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  optical_notes: z.string().trim().max(2000).nullable().optional(),
  right_power: lensPowerSchema.nullable().optional(),
  left_power: lensPowerSchema.nullable().optional(),
  single_power: lensPowerSchema.nullable().optional(),
  force_special: z.boolean().default(false),
}).superRefine((value, ctx) => {
  if (value.side === LensSide.PAIR) {
    if (!value.right_power) {
      ctx.addIssue({ code: 'custom', path: ['right_power'], message: 'Informe o grau do olho direito.' });
    }
    if (!value.left_power) {
      ctx.addIssue({ code: 'custom', path: ['left_power'], message: 'Informe o grau do olho esquerdo.' });
    }
    return;
  }

  if (!value.single_power) {
    ctx.addIssue({ code: 'custom', path: ['single_power'], message: 'Informe o grau solicitado.' });
  }
});

const specialAnalysisPayloadSchema = z.object({
  orderId: z.string().uuid(),
  estimated_delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data estimada.'),
  lab_estimated_delivery_notes: z.string().trim().min(1, 'Informe uma observacao de prazo.').max(2000),
  create_sku: z.boolean().default(false),
});

const specialRejectPayloadSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().trim().min(1, 'Informe o motivo da rejeicao.').max(2000),
});

const updateStatusSchema = z.object({
  orderId: z.string().uuid(),
  nextStatus: z.nativeEnum(OrderStatus),
  internalNotes: z.string().trim().max(2000).nullable().optional(),
});

type StoreOrderPayload = z.infer<typeof storeOrderPayloadSchema>;
type SpecialOrderPayload = z.infer<typeof specialOrderPayloadSchema>;
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

type SpecialOrderItemInput = {
  side: LensSide;
  power: z.infer<typeof lensPowerSchema>;
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

function specialItemsFromPayload(payload: SpecialOrderPayload): SpecialOrderItemInput[] {
  if (payload.side === LensSide.PAIR) {
    return [
      { side: LensSide.RIGHT, power: payload.right_power! },
      { side: LensSide.LEFT, power: payload.left_power! },
    ];
  }

  return [{ side: payload.side, power: payload.single_power! }];
}

function sameTreatmentSet(a: string[] = [], b: string[] = []) {
  const normalize = (value: string) => value.trim().toLowerCase();
  const left = [...new Set(a.map(normalize).filter(Boolean))].sort();
  const right = [...new Set(b.map(normalize).filter(Boolean))].sort();
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

async function validateSpecialLensType(
  supabase: Awaited<ReturnType<typeof createClient>>,
  labId: string,
  payload: SpecialOrderPayload
) {
  const { data: lensType, error } = await supabase
    .from('lens_types')
    .select('id, lab_id, name, brand, category, material, refractive_index, treatments, status, default_production_time_out_of_stock_days')
    .eq('id', payload.lens_type_id)
    .eq('lab_id', labId)
    .eq('status', EntityStatus.ACTIVE)
    .single();

  if (error || !lensType) {
    return { error: 'Selecione uma lente ativa do catalogo do laboratorio.' as const };
  }

  if (!sameTreatmentSet((lensType.treatments || []).map(String), payload.treatments)) {
    return { error: 'Os tratamentos precisam vir da lente selecionada no catalogo.' as const };
  }

  return { lensType };
}

async function findCompatibleSpecialVariants(
  supabase: Awaited<ReturnType<typeof createClient>>,
  labId: string,
  lensTypeId: string,
  items: SpecialOrderItemInput[]
) {
  const matches = [];

  for (const item of items) {
    let request = supabase
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
        delivery_time_in_stock_days,
        production_time_out_of_stock_days,
        lens_type:lens_types!inner(
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
      .eq('lab_id', labId)
      .eq('lens_type_id', lensTypeId)
      .eq('status', EntityStatus.ACTIVE)
      .eq('lens_type.status', EntityStatus.ACTIVE)
      .eq('side', item.side)
      .eq('sphere_esf', item.power.sphere_esf);

    if (item.power.cylinder_cil === null || item.power.cylinder_cil === undefined) {
      request = request.is('cylinder_cil', null);
    } else {
      request = request.eq('cylinder_cil', item.power.cylinder_cil);
    }

    if (item.power.axis === null || item.power.axis === undefined) {
      request = request.is('axis', null);
    } else {
      request = request.eq('axis', item.power.axis);
    }

    if (item.power.addition_add === null || item.power.addition_add === undefined) {
      request = request.is('addition_add', null);
    } else {
      request = request.eq('addition_add', item.power.addition_add);
    }

    const { data, error } = await request.limit(3);
    if (error) continue;
    matches.push(...(data || []));
  }

  return matches;
}

function buildSpecialSku(orderNumber: string, side: LensSide, index: number) {
  const sideToken = side === LensSide.RIGHT ? 'OD' : side === LensSide.LEFT ? 'OE' : 'NA';
  return `ESP-${orderNumber.replace(/[^A-Z0-9]/gi, '')}-${sideToken}-${index + 1}`;
}

function daysUntil(dateValue: string) {
  const today = new Date();
  const target = new Date(`${dateValue}T00:00:00`);
  today.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
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

export async function createSpecialOrderAction(payload: SpecialOrderPayload) {
  const parsed = specialOrderPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Revise os dados do pedido especial.' };
  }

  const context = await getProfileContext();
  if ('error' in context) return { error: context.error };

  const { supabase, profile } = context;

  if (!profile.optical_store_id || ![UserRole.OPTICAL_ADMIN, UserRole.OPTICAL_USER].includes(profile.role)) {
    return { error: 'Apenas usuarios de otica podem criar pedidos especiais.' };
  }

  const specialItems = specialItemsFromPayload(parsed.data);
  const lensTypeResult = await validateSpecialLensType(supabase, profile.lab_id, parsed.data);
  if ('error' in lensTypeResult) return { error: lensTypeResult.error };

  const compatibleVariants = await findCompatibleSpecialVariants(
    supabase,
    profile.lab_id,
    parsed.data.lens_type_id,
    specialItems
  );

  if (compatibleVariants.length && !parsed.data.force_special) {
    return {
      requiresConfirmation: true,
      matches: compatibleVariants,
    };
  }

  const { data: orderNumber, error: numberError } = await supabase.rpc('get_next_order_number', {
    p_lab_id: profile.lab_id,
  });

  if (numberError || !orderNumber) {
    return { error: 'Nao foi possivel gerar o numero do pedido especial.' };
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      lab_id: profile.lab_id,
      optical_store_id: profile.optical_store_id,
      order_number: orderNumber,
      status: OrderStatus.AGUARDANDO_CONFIRMACAO,
      order_type: 'special',
      special_status: 'aguardando_analise',
      priority: OrderPriority.NORMAL,
      desired_delivery_date: parsed.data.desired_delivery_date || null,
      requested_by_profile_id: profile.id,
      notes: parsed.data.optical_notes || null,
      matched_lens_variant_id: compatibleVariants[0]?.id || null,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    return { error: 'Nao foi possivel criar o pedido especial.' };
  }

  const { error: itemsError } = await supabase.from('order_items').insert(
    specialItems.map((item) => ({
      order_id: order.id,
      lab_id: profile.lab_id,
      lens_type_id: parsed.data.lens_type_id,
      lens_variant_id: null,
      quantity: parsed.data.quantity,
      sphere_esf: item.power.sphere_esf,
      cylinder_cil: item.power.cylinder_cil ?? null,
      axis: item.power.axis ?? null,
      addition_add: item.power.addition_add ?? null,
      side: item.side,
      item_notes: parsed.data.optical_notes || null,
    }))
  );

  if (itemsError) {
    return { error: 'Pedido especial criado, mas houve erro ao vincular os dados da lente. Contate o laboratorio.' };
  }

  await supabase.from('order_status_history').insert({
    order_id: order.id,
    lab_id: profile.lab_id,
    old_status: null,
    new_status: OrderStatus.AGUARDANDO_CONFIRMACAO,
    changed_by_profile_id: profile.id,
    notes: 'Pedido especial criado pela otica. Aguardando analise do laboratorio.',
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

export async function approveSpecialOrderAction(input: z.infer<typeof specialAnalysisPayloadSchema>) {
  const parsed = specialAnalysisPayloadSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Revise a analise do pedido especial.' };

  const context = await getProfileContext();
  if ('error' in context) return { error: context.error };

  const { supabase, profile } = context;

  if (![UserRole.LAB_ADMIN, UserRole.LAB_USER].includes(profile.role)) {
    return { error: 'Apenas usuarios do laboratorio podem analisar pedidos especiais.' };
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, lab_id, order_number, order_type, special_status')
    .eq('id', parsed.data.orderId)
    .eq('lab_id', profile.lab_id)
    .eq('order_type', 'special')
    .single();

  if (orderError || !order) return { error: 'Pedido especial nao encontrado.' };

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id, lens_type_id, quantity, sphere_esf, cylinder_cil, axis, addition_add, side')
    .eq('order_id', order.id)
    .eq('lab_id', profile.lab_id)
    .order('created_at', { ascending: true });

  if (itemsError || !items?.length) return { error: 'Dados da lente do pedido especial nao encontrados.' };

  const createdVariantIds: string[] = [];

  if (parsed.data.create_sku) {
    for (const [index, item] of items.entries()) {
      const { data: variant, error: variantError } = await supabase
        .from('lens_variants')
        .insert({
          lab_id: profile.lab_id,
          lens_type_id: item.lens_type_id,
          sku: buildSpecialSku(order.order_number, item.side as LensSide, index),
          sphere_esf: item.sphere_esf,
          cylinder_cil: item.cylinder_cil,
          axis: item.axis,
          addition_add: item.addition_add,
          side: item.side || LensSide.NOT_APPLICABLE,
          quantity_available: 0,
          production_time_out_of_stock_days: daysUntil(parsed.data.estimated_delivery_date),
          status: EntityStatus.ACTIVE,
          source_special_order_id: order.id,
        })
        .select('id')
        .single();

      if (variantError || !variant) {
        return { error: 'Nao foi possivel criar o SKU a partir do pedido especial.' };
      }

      createdVariantIds.push(variant.id);

      await supabase
        .from('order_items')
        .update({ lens_variant_id: variant.id })
        .eq('id', item.id)
        .eq('lab_id', profile.lab_id);
    }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: OrderStatus.CONFIRMADO,
      special_status: 'aprovado',
      estimated_delivery_date: parsed.data.estimated_delivery_date,
      lab_estimated_delivery_notes: parsed.data.lab_estimated_delivery_notes,
      confirmed_by_profile_id: profile.id,
      confirmed_at: new Date().toISOString(),
      created_lens_variant_id: createdVariantIds[0] || null,
    })
    .eq('id', order.id)
    .eq('lab_id', profile.lab_id);

  if (updateError) return { error: 'Nao foi possivel aprovar o pedido especial.' };

  await supabase.from('order_status_history').insert({
    order_id: order.id,
    lab_id: profile.lab_id,
    old_status: OrderStatus.AGUARDANDO_CONFIRMACAO,
    new_status: OrderStatus.CONFIRMADO,
    changed_by_profile_id: profile.id,
    notes: parsed.data.create_sku
      ? 'Pedido especial aprovado e SKU criado pelo laboratorio.'
      : 'Pedido especial aprovado sem criar SKU.',
  });

  revalidateOrderRoutes(order.id);
  revalidatePath('/lab/stock');
  revalidatePath('/store/search');
  revalidatePath('/store/orders/new');
  return { success: true };
}

export async function rejectSpecialOrderAction(input: z.infer<typeof specialRejectPayloadSchema>) {
  const parsed = specialRejectPayloadSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Informe o motivo da rejeicao.' };

  const context = await getProfileContext();
  if ('error' in context) return { error: context.error };

  const { supabase, profile } = context;

  if (![UserRole.LAB_ADMIN, UserRole.LAB_USER].includes(profile.role)) {
    return { error: 'Apenas usuarios do laboratorio podem rejeitar pedidos especiais.' };
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', parsed.data.orderId)
    .eq('lab_id', profile.lab_id)
    .eq('order_type', 'special')
    .single();

  if (orderError || !order) return { error: 'Pedido especial nao encontrado.' };

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: OrderStatus.CANCELADO,
      special_status: 'rejeitado',
      special_rejection_reason: parsed.data.reason,
      internal_notes: parsed.data.reason,
    })
    .eq('id', order.id)
    .eq('lab_id', profile.lab_id);

  if (updateError) return { error: 'Nao foi possivel rejeitar o pedido especial.' };

  await supabase.from('order_status_history').insert({
    order_id: order.id,
    lab_id: profile.lab_id,
    old_status: order.status,
    new_status: OrderStatus.CANCELADO,
    changed_by_profile_id: profile.id,
    notes: parsed.data.reason,
  });

  revalidateOrderRoutes(order.id);
  return { success: true };
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
