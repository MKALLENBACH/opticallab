'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { canTransitionStatus } from '@/lib/constants/order-flow';
import { EntityStatus, LensSide, OrderPriority, OrderStatus, UserRole } from '@/lib/types/enums';
import { DEFAULT_REWORK_REASON_OPTIONS, normalizeCustomOption } from '@/lib/constants/lab-options';

const orderBuilderItemSchema = z.object({
  lens_variant_id: z.string().uuid('Lente invalida.'),
  quantity: z.number().int().min(1, 'Quantidade deve ser maior que zero.'),
  item_notes: z.string().trim().max(1000).nullable().optional(),
});

const pendingPrescriptionSchema = z.object({
  file_path: z.string().trim().min(1, 'Anexe a receita para continuar.'),
  file_name: z.string().trim().min(1, 'Arquivo invalido.'),
  file_type: z.string().trim().min(1, 'Arquivo invalido.'),
  file_size: z.number().int().min(1).max(10 * 1024 * 1024, 'Arquivo muito grande. Envie um arquivo de ate 10MB.'),
});

const storeOrderPayloadSchema = z.object({
  notes: z.string().trim().max(2000).nullable().optional(),
  priority: z.nativeEnum(OrderPriority).default(OrderPriority.NORMAL),
  desired_delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  items: z.array(orderBuilderItemSchema).min(1, 'Adicione pelo menos uma lente ao pedido.'),
  prescription: pendingPrescriptionSchema.nullable().optional(),
});

const lensPowerSchema = z.object({
  sphere_esf: z.number({ error: 'Informe o ESF da lente.' }).min(-30, 'ESF deve estar entre -30.00 e +30.00.').max(30, 'ESF deve estar entre -30.00 e +30.00.'),
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
  prescription: pendingPrescriptionSchema.nullable().optional(),
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

const reworkItemActionSchema = z.enum(['same_lens', 'replace_sku', 'special']);

const reworkItemPayloadSchema = z.object({
  source_order_item_id: z.string().uuid('Item original invalido.'),
  action: reworkItemActionSchema,
  lens_variant_id: z.string().uuid('SKU invalido.').nullable().optional(),
  lens_type_id: z.string().uuid('Lente invalida.').nullable().optional(),
  treatments: z.array(z.string()).default([]),
  side: z.nativeEnum(LensSide, { error: 'Selecione o lado da lente.' }).nullable().optional(),
  quantity: z.number().int().min(1, 'Quantidade deve ser maior que zero.'),
  single_power: lensPowerSchema.nullable().optional(),
  force_special: z.boolean().default(false),
  item_notes: z.string().trim().max(1000).nullable().optional(),
}).superRefine((value, ctx) => {
  if (value.action === 'replace_sku' && !value.lens_variant_id) {
    ctx.addIssue({ code: 'custom', path: ['lens_variant_id'], message: 'Selecione o SKU substituto.' });
  }

  if (value.action === 'special') {
    if (!value.lens_type_id) {
      ctx.addIssue({ code: 'custom', path: ['lens_type_id'], message: 'Selecione a lente-base para o Pedido Especial.' });
    }
    if (!value.side) {
      ctx.addIssue({ code: 'custom', path: ['side'], message: 'Selecione o lado da lente.' });
    }
    if (!value.single_power) {
      ctx.addIssue({ code: 'custom', path: ['single_power'], message: 'Informe o grau do Pedido Especial.' });
    }
  }
});

const createReworkPayloadSchema = z.object({
  parent_order_id: z.string().uuid('Pedido original invalido.'),
  reason: z.string().trim().min(1, 'Selecione o motivo do retrabalho.').max(80),
  notes: z.string().trim().max(2000).nullable().optional(),
  items: z.array(reworkItemPayloadSchema).min(1, 'Selecione pelo menos um item para retrabalho.'),
  prescription: pendingPrescriptionSchema.nullable().optional(),
});

const reworkRejectPayloadSchema = z.object({
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
type CreateReworkPayload = z.infer<typeof createReworkPayloadSchema>;
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

type ReworkSourceItem = {
  id: string;
  lens_type_id: string;
  lens_variant_id: string | null;
  quantity: number;
  sphere_esf: number | null;
  cylinder_cil: number | null;
  axis: number | null;
  addition_add: number | null;
  prism: string | null;
  prism_base: string | null;
  base_curve: number | null;
  diameter: number | null;
  side: string | null;
  item_notes: string | null;
};

type ReworkBuiltItem = {
  source_order_item_id: string;
  rework_action: z.infer<typeof reworkItemActionSchema>;
  lens_type_id: string;
  lens_variant_id: string | null;
  quantity: number;
  sphere_esf: number | null;
  cylinder_cil: number | null;
  axis: number | null;
  addition_add: number | null;
  prism: string | null;
  prism_base: string | null;
  base_curve: number | null;
  diameter: number | null;
  side: string | null;
  item_notes: string | null;
};

type PendingPrescription = z.infer<typeof pendingPrescriptionSchema>;

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

function profileActor(profile: ProfileContext): 'lab' | 'optical' | null {
  if ([UserRole.LAB_ADMIN, UserRole.LAB_USER].includes(profile.role)) return 'lab';
  if ([UserRole.OPTICAL_ADMIN, UserRole.OPTICAL_USER].includes(profile.role)) return 'optical';
  return null;
}

const ALLOWED_PRESCRIPTION_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const ALLOWED_PRESCRIPTION_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

function validatePendingPrescription(profile: ProfileContext, prescription: PendingPrescription | null | undefined, required: boolean) {
  if (!prescription) {
    return required ? 'Anexe a receita para continuar.' : null;
  }

  const lowerName = prescription.file_name.toLowerCase();
  const hasAllowedExtension = ALLOWED_PRESCRIPTION_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
  if (!ALLOWED_PRESCRIPTION_TYPES.has(prescription.file_type) || !hasAllowedExtension) {
    return 'Formato invalido. Envie uma imagem ou PDF.';
  }

  if (prescription.file_size > 10 * 1024 * 1024) {
    return 'Arquivo muito grande. Envie um arquivo de ate 10MB.';
  }

  const expectedPrefix = `${profile.lab_id}/pending/${profile.id}/`;
  if (!prescription.file_path.startsWith(expectedPrefix) || prescription.file_path.includes('..')) {
    return 'Nao foi possivel anexar a receita. Tente novamente.';
  }

  return null;
}

async function attachPrescriptionToOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: ProfileContext,
  orderId: string,
  prescription: PendingPrescription | null | undefined
) {
  if (!prescription) return { success: true };

  const { error } = await supabase
    .from('order_attachments')
    .insert({
      lab_id: profile.lab_id,
      order_id: orderId,
      uploaded_by_profile_id: profile.id,
      attachment_type: 'prescription',
      file_url: prescription.file_path,
      file_path: prescription.file_path,
      file_name: prescription.file_name,
      file_type: prescription.file_type,
      file_size: prescription.file_size,
    });

  if (error) return { error: 'Nao foi possivel registrar a receita no pedido.' };
  return { success: true };
}

async function rollbackCreatedOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
  prescription?: PendingPrescription | null
) {
  await supabase.from('orders').delete().eq('id', orderId);
  if (prescription?.file_path) {
    await supabase.storage.from('order-attachments').remove([prescription.file_path]);
  }
}

async function validateReworkReason(
  supabase: Awaited<ReturnType<typeof createClient>>,
  labId: string,
  reason: string
) {
  const normalizedReason = normalizeCustomOption(reason);
  const defaultMatch = DEFAULT_REWORK_REASON_OPTIONS.some((option) => (
    normalizeCustomOption(option.value) === normalizedReason
    || normalizeCustomOption(option.label) === normalizedReason
  ));

  if (defaultMatch) return { value: reason };

  const { data, error } = await supabase
    .from('lab_custom_options')
    .select('name')
    .eq('lab_id', labId)
    .eq('option_type', 'rework_reason')
    .eq('status', EntityStatus.ACTIVE)
    .eq('normalized_name', normalizedReason)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    return { error: 'Nao foi possivel validar o motivo do retrabalho.' };
  }

  if (!data?.name) return { error: 'Selecione um motivo de retrabalho disponivel para este laboratorio.' };
  return { value: data.name };
}

async function validateStockForItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  labId: string,
  items: Array<{ lens_variant_id: string | null; quantity: number }>
) {
  const skuItems = items.filter((item) => item.lens_variant_id);
  const variantIds = [...new Set(skuItems.map((item) => item.lens_variant_id as string))];
  if (!variantIds.length) return { variants: new Map<string, { id: string; quantity_available: number; sku: string }>() };

  const { data: variants, error } = await supabase
    .from('lens_variants')
    .select('id, quantity_available, sku')
    .eq('lab_id', labId)
    .in('id', variantIds);

  if (error) return { error: 'Nao foi possivel validar o estoque dos itens.' };

  const variantMap = new Map((variants || []).map((variant) => [variant.id, variant]));
  const requestedByVariant = new Map<string, number>();

  for (const item of skuItems) {
    const variantId = item.lens_variant_id as string;
    requestedByVariant.set(variantId, (requestedByVariant.get(variantId) || 0) + Number(item.quantity ?? 0));
  }

  for (const [variantId, quantity] of requestedByVariant.entries()) {
    const variant = variantMap.get(variantId);
    if (!variant) return { error: 'Um dos SKUs selecionados nao pertence ao laboratorio.' };
    if (Number(variant.quantity_available ?? 0) < quantity) {
      return { error: `Estoque insuficiente para confirmar este pedido. Ajuste o estoque ou edite o pedido. SKU: ${variant.sku}.` };
    }
  }

  return { variants: variantMap };
}

async function deductStockForOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  labId: string,
  profileId: string,
  orderId: string,
  reason = 'Confirmacao de pedido'
) {
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id, lens_variant_id, quantity')
    .eq('order_id', orderId)
    .eq('lab_id', labId);

  if (itemsError) return { error: 'Nao foi possivel validar o estoque dos itens.' };

  const stockResult = await validateStockForItems(supabase, labId, (items || []).map((item) => ({
    lens_variant_id: item.lens_variant_id,
    quantity: Number(item.quantity ?? 0),
  })));

  if (stockResult.error) return { error: stockResult.error };
  if (!stockResult.variants) return { error: 'Nao foi possivel validar o estoque dos itens.' };

  for (const item of items || []) {
    if (!item.lens_variant_id) continue;

    const variant = stockResult.variants.get(item.lens_variant_id);
    if (!variant) continue;

    const newQuantity = Number(variant.quantity_available ?? 0) - Number(item.quantity ?? 0);
    const { error: stockError } = await supabase
      .from('lens_variants')
      .update({ quantity_available: newQuantity })
      .eq('id', variant.id)
      .eq('lab_id', labId);

    if (stockError) return { error: `Nao foi possivel baixar o estoque do SKU ${variant.sku}.` };

    await supabase.from('inventory_movements').insert({
      lab_id: labId,
      lens_variant_id: variant.id,
      movement_type: 'saida',
      quantity: Number(item.quantity ?? 0),
      reason,
      order_id: orderId,
      created_by_profile_id: profileId,
    });
  }

  return { success: true };
}

async function restoreStockForCanceledOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  labId: string,
  profileId: string,
  orderId: string
) {
  const { data: movements } = await supabase
    .from('inventory_movements')
    .select('lens_variant_id, quantity')
    .eq('order_id', orderId)
    .eq('lab_id', labId)
    .eq('movement_type', 'saida');

  for (const movement of movements || []) {
    const { data: variant } = await supabase
      .from('lens_variants')
      .select('id, quantity_available')
      .eq('id', movement.lens_variant_id)
      .eq('lab_id', labId)
      .single();

    if (!variant) continue;

    await supabase
      .from('lens_variants')
      .update({ quantity_available: Number(variant.quantity_available ?? 0) + Number(movement.quantity ?? 0) })
      .eq('id', variant.id)
      .eq('lab_id', labId);

    await supabase.from('inventory_movements').insert({
      lab_id: labId,
      lens_variant_id: variant.id,
      movement_type: 'cancelamento',
      quantity: Number(movement.quantity ?? 0),
      reason: 'Cancelamento de pedido',
      order_id: orderId,
      created_by_profile_id: profileId,
    });
  }

  return { success: true };
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

  const prescriptionError = validatePendingPrescription(profile, parsed.data.prescription, true);
  if (prescriptionError) return { error: prescriptionError };

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
    await rollbackCreatedOrder(supabase, order.id, parsed.data.prescription);
    return { error: 'Pedido criado, mas houve erro ao vincular os itens. Contate o laboratorio.' };
  }

  const attachmentResult = await attachPrescriptionToOrder(supabase, profile, order.id, parsed.data.prescription);
  if (attachmentResult.error) {
    await rollbackCreatedOrder(supabase, order.id, parsed.data.prescription);
    return { error: attachmentResult.error };
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

  const prescriptionError = validatePendingPrescription(profile, parsed.data.prescription, true);
  if (prescriptionError) return { error: prescriptionError };

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
    await rollbackCreatedOrder(supabase, order.id, parsed.data.prescription);
    return { error: 'Pedido especial criado, mas houve erro ao vincular os dados da lente. Contate o laboratorio.' };
  }

  const attachmentResult = await attachPrescriptionToOrder(supabase, profile, order.id, parsed.data.prescription);
  if (attachmentResult.error) {
    await rollbackCreatedOrder(supabase, order.id, parsed.data.prescription);
    return { error: attachmentResult.error };
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

export async function createReworkOrderAction(payload: CreateReworkPayload) {
  const parsed = createReworkPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Revise os dados do retrabalho.' };
  }

  const context = await getProfileContext();
  if ('error' in context) return { error: context.error };

  const { supabase, profile } = context;
  const actor = profileActor(profile);

  if (!actor) return { error: 'Usuario sem permissao para abrir retrabalho.' };
  if (actor === 'optical' && !profile.optical_store_id) return { error: 'Otica vinculada nao encontrada.' };
  if (actor === 'optical' && !parsed.data.notes?.trim()) {
    return { error: 'Explique o que precisa ser refeito ou ajustado.' };
  }

  const prescriptionError = validatePendingPrescription(profile, parsed.data.prescription, actor === 'optical');
  if (prescriptionError) return { error: prescriptionError };

  const reasonResult = await validateReworkReason(supabase, profile.lab_id, parsed.data.reason);
  if (reasonResult.error || !reasonResult.value) return { error: reasonResult.error || 'Selecione o motivo do retrabalho.' };

  let parentQuery = supabase
    .from('orders')
    .select('id, lab_id, optical_store_id, order_number, status, priority, order_type')
    .eq('id', parsed.data.parent_order_id)
    .eq('lab_id', profile.lab_id);

  if (actor === 'optical') {
    parentQuery = parentQuery.eq('optical_store_id', profile.optical_store_id as string);
  }

  const { data: parentOrder, error: parentError } = await parentQuery.single();

  if (parentError || !parentOrder) return { error: 'Pedido original nao encontrado.' };
  if (parentOrder.status !== OrderStatus.FINALIZADO) {
    return { error: 'Retrabalho so pode ser aberto para pedidos finalizados.' };
  }
  if (parentOrder.order_type === 'rework') {
    return { error: 'Abra o retrabalho a partir do pedido original finalizado.' };
  }

  const recentIso = new Date(Date.now() - 15_000).toISOString();
  let duplicateQuery = supabase
    .from('orders')
    .select('id')
    .eq('parent_order_id', parentOrder.id)
    .eq('order_type', 'rework')
    .eq('rework_opened_by_profile_id', profile.id)
    .eq('rework_reason', reasonResult.value)
    .gte('created_at', recentIso)
    .limit(1);

  if (parsed.data.notes?.trim()) {
    duplicateQuery = duplicateQuery.eq('notes', parsed.data.notes.trim());
  } else {
    duplicateQuery = duplicateQuery.is('notes', null);
  }

  const { data: duplicate } = await duplicateQuery.maybeSingle();
  if (duplicate?.id) return { success: true, orderId: duplicate.id, duplicate: true };

  const sourceItemIds = parsed.data.items.map((item) => item.source_order_item_id);
  if (new Set(sourceItemIds).size !== sourceItemIds.length) {
    return { error: 'Ha itens duplicados no retrabalho.' };
  }

  const { data: sourceItems, error: sourceItemsError } = await supabase
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
      prism,
      prism_base,
      base_curve,
      diameter,
      side,
      item_notes
    `)
    .eq('order_id', parentOrder.id)
    .eq('lab_id', profile.lab_id)
    .in('id', sourceItemIds);

  if (sourceItemsError) return { error: 'Nao foi possivel validar os itens do pedido original.' };
  if ((sourceItems || []).length !== sourceItemIds.length) {
    return { error: 'Um dos itens selecionados nao pertence ao pedido original.' };
  }

  const sourceMap = new Map((sourceItems || []).map((item) => [item.id, item as ReworkSourceItem]));
  const replacementIds = parsed.data.items
    .filter((item) => item.action === 'replace_sku' && item.lens_variant_id)
    .map((item) => item.lens_variant_id as string);

  const { data: replacements, error: replacementError } = replacementIds.length
    ? await supabase
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
        status
      `)
      .eq('lab_id', profile.lab_id)
      .in('id', replacementIds)
    : { data: [], error: null };

  if (replacementError) return { error: 'Nao foi possivel validar o SKU substituto.' };

  const replacementMap = new Map((replacements || []).map((variant) => [variant.id, variant]));
  const builtItems: ReworkBuiltItem[] = [];

  for (const item of parsed.data.items) {
    const sourceItem = sourceMap.get(item.source_order_item_id);
    if (!sourceItem) return { error: 'Item original invalido.' };
    if (item.quantity > Number(sourceItem.quantity ?? 0)) {
      return { error: 'A quantidade do retrabalho nao pode ser maior que a quantidade do item original.' };
    }

    if (item.action === 'same_lens') {
      builtItems.push({
        source_order_item_id: sourceItem.id,
        rework_action: item.action,
        lens_type_id: sourceItem.lens_type_id,
        lens_variant_id: sourceItem.lens_variant_id,
        quantity: item.quantity,
        sphere_esf: sourceItem.sphere_esf,
        cylinder_cil: sourceItem.cylinder_cil,
        axis: sourceItem.axis,
        addition_add: sourceItem.addition_add,
        prism: sourceItem.prism,
        prism_base: sourceItem.prism_base,
        base_curve: sourceItem.base_curve,
        diameter: sourceItem.diameter,
        side: sourceItem.side,
        item_notes: item.item_notes || parsed.data.notes || sourceItem.item_notes,
      });
      continue;
    }

    if (item.action === 'replace_sku') {
      const replacement = replacementMap.get(item.lens_variant_id as string);
      if (!replacement || replacement.status !== EntityStatus.ACTIVE) {
        return { error: 'O SKU substituto precisa estar ativo e pertencer ao laboratorio.' };
      }

      builtItems.push({
        source_order_item_id: sourceItem.id,
        rework_action: item.action,
        lens_type_id: replacement.lens_type_id,
        lens_variant_id: replacement.id,
        quantity: item.quantity,
        sphere_esf: replacement.sphere_esf === null ? null : Number(replacement.sphere_esf),
        cylinder_cil: replacement.cylinder_cil === null ? null : Number(replacement.cylinder_cil),
        axis: replacement.axis === null ? null : Number(replacement.axis),
        addition_add: replacement.addition_add === null ? null : Number(replacement.addition_add),
        prism: replacement.prism,
        prism_base: replacement.prism_base,
        base_curve: replacement.base_curve === null ? null : Number(replacement.base_curve),
        diameter: replacement.diameter === null ? null : Number(replacement.diameter),
        side: replacement.side,
        item_notes: item.item_notes || parsed.data.notes || null,
      });
      continue;
    }

    const specialPayload: SpecialOrderPayload = {
      lens_type_id: item.lens_type_id as string,
      treatments: item.treatments,
      side: item.side as LensSide,
      quantity: item.quantity,
      desired_delivery_date: null,
      optical_notes: item.item_notes || parsed.data.notes || null,
      single_power: item.single_power,
      right_power: null,
      left_power: null,
      force_special: item.force_special,
    };

    const lensTypeResult = await validateSpecialLensType(supabase, profile.lab_id, specialPayload);
    if ('error' in lensTypeResult) return { error: lensTypeResult.error };

    const compatibleVariants = await findCompatibleSpecialVariants(
      supabase,
      profile.lab_id,
      specialPayload.lens_type_id,
      specialItemsFromPayload(specialPayload)
    );

    if (compatibleVariants.length && !item.force_special) {
      return {
        requiresConfirmation: true,
        source_order_item_id: item.source_order_item_id,
        matches: compatibleVariants,
      };
    }

    builtItems.push({
      source_order_item_id: sourceItem.id,
      rework_action: item.action,
      lens_type_id: specialPayload.lens_type_id,
      lens_variant_id: null,
      quantity: item.quantity,
      sphere_esf: item.single_power?.sphere_esf ?? null,
      cylinder_cil: item.single_power?.cylinder_cil ?? null,
      axis: item.single_power?.axis ?? null,
      addition_add: item.single_power?.addition_add ?? null,
      prism: null,
      prism_base: null,
      base_curve: null,
      diameter: null,
      side: specialPayload.side,
      item_notes: item.item_notes || parsed.data.notes || null,
    });
  }

  if (actor === 'lab') {
    const stockResult = await validateStockForItems(supabase, profile.lab_id, builtItems);
    if (stockResult.error) return { error: stockResult.error };
  }

  const { data: orderNumber, error: numberError } = await supabase.rpc('get_next_order_number', {
    p_lab_id: profile.lab_id,
  });

  if (numberError || !orderNumber) return { error: 'Nao foi possivel gerar o numero do retrabalho.' };

  const startsAccepted = actor === 'lab';
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      lab_id: profile.lab_id,
      optical_store_id: parentOrder.optical_store_id,
      order_number: orderNumber,
      status: startsAccepted ? OrderStatus.CONFIRMADO : OrderStatus.AGUARDANDO_CONFIRMACAO,
      order_type: 'rework',
      parent_order_id: parentOrder.id,
      rework_reason: reasonResult.value,
      rework_status: startsAccepted ? 'aceito' : 'aguardando_aceite',
      rework_opened_by_profile_id: profile.id,
      rework_opened_by_role: actor,
      rework_accepted_at: startsAccepted ? new Date().toISOString() : null,
      rework_accepted_by_profile_id: startsAccepted ? profile.id : null,
      priority: parentOrder.priority || OrderPriority.NORMAL,
      requested_by_profile_id: profile.id,
      confirmed_by_profile_id: startsAccepted ? profile.id : null,
      confirmed_at: startsAccepted ? new Date().toISOString() : null,
      notes: parsed.data.notes?.trim() || null,
    })
    .select('id')
    .single();

  if (orderError || !order) return { error: 'Nao foi possivel criar o retrabalho.' };

  const { error: itemsError } = await supabase.from('order_items').insert(
    builtItems.map((item) => ({
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
      item_notes: item.item_notes,
      source_order_item_id: item.source_order_item_id,
      rework_action: item.rework_action,
    }))
  );

  if (itemsError) {
    await rollbackCreatedOrder(supabase, order.id, parsed.data.prescription);
    return { error: 'Retrabalho criado, mas houve erro ao vincular os itens. Contate o laboratorio.' };
  }

  const attachmentResult = await attachPrescriptionToOrder(supabase, profile, order.id, parsed.data.prescription);
  if (attachmentResult.error) {
    await rollbackCreatedOrder(supabase, order.id, parsed.data.prescription);
    return { error: attachmentResult.error };
  }

  if (startsAccepted) {
    const stockResult = await deductStockForOrder(supabase, profile.lab_id, profile.id, order.id, 'Retrabalho aberto pelo laboratorio');
    if (stockResult.error) {
      await rollbackCreatedOrder(supabase, order.id, parsed.data.prescription);
      return { error: stockResult.error };
    }
  }

  await supabase.from('order_status_history').insert({
    order_id: order.id,
    lab_id: profile.lab_id,
    old_status: null,
    new_status: startsAccepted ? OrderStatus.CONFIRMADO : OrderStatus.AGUARDANDO_CONFIRMACAO,
    changed_by_profile_id: profile.id,
    notes: startsAccepted
      ? `Retrabalho criado e aceito pelo laboratorio a partir do pedido ${parentOrder.order_number}.`
      : `Solicitacao de retrabalho criada pela otica a partir do pedido ${parentOrder.order_number}.`,
  });

  revalidateOrderRoutes(order.id);
  revalidateOrderRoutes(parentOrder.id);
  revalidatePath('/lab/stock');
  return { success: true, orderId: order.id };
}

export async function acceptReworkOrderAction(orderId: string) {
  const context = await getProfileContext();
  if ('error' in context) return { error: context.error };

  const { supabase, profile } = context;
  if (![UserRole.LAB_ADMIN, UserRole.LAB_USER].includes(profile.role)) {
    return { error: 'Apenas usuarios do laboratorio podem aceitar retrabalhos.' };
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status, parent_order_id, rework_status')
    .eq('id', orderId)
    .eq('lab_id', profile.lab_id)
    .eq('order_type', 'rework')
    .single();

  if (orderError || !order) return { error: 'Retrabalho nao encontrado.' };
  if (order.rework_status !== 'aguardando_aceite') return { error: 'Este retrabalho nao esta aguardando aceite.' };

  const stockResult = await deductStockForOrder(supabase, profile.lab_id, profile.id, order.id, 'Aceite de retrabalho');
  if (stockResult.error) return { error: stockResult.error };

  const acceptedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: OrderStatus.CONFIRMADO,
      rework_status: 'aceito',
      rework_accepted_at: acceptedAt,
      rework_accepted_by_profile_id: profile.id,
      confirmed_by_profile_id: profile.id,
      confirmed_at: acceptedAt,
    })
    .eq('id', order.id)
    .eq('lab_id', profile.lab_id);

  if (updateError) return { error: 'Nao foi possivel aceitar o retrabalho.' };

  await supabase.from('order_status_history').insert({
    order_id: order.id,
    lab_id: profile.lab_id,
    old_status: order.status,
    new_status: OrderStatus.CONFIRMADO,
    changed_by_profile_id: profile.id,
    notes: 'Retrabalho aceito pelo laboratorio.',
  });

  revalidateOrderRoutes(order.id);
  if (order.parent_order_id) revalidateOrderRoutes(order.parent_order_id);
  revalidatePath('/lab/stock');
  return { success: true };
}

export async function rejectReworkOrderAction(input: z.infer<typeof reworkRejectPayloadSchema>) {
  const parsed = reworkRejectPayloadSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Informe o motivo da rejeicao.' };

  const context = await getProfileContext();
  if ('error' in context) return { error: context.error };

  const { supabase, profile } = context;
  if (![UserRole.LAB_ADMIN, UserRole.LAB_USER].includes(profile.role)) {
    return { error: 'Apenas usuarios do laboratorio podem rejeitar retrabalhos.' };
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status, parent_order_id, rework_status')
    .eq('id', parsed.data.orderId)
    .eq('lab_id', profile.lab_id)
    .eq('order_type', 'rework')
    .single();

  if (orderError || !order) return { error: 'Retrabalho nao encontrado.' };
  if (order.rework_status !== 'aguardando_aceite') return { error: 'Este retrabalho nao esta aguardando aceite.' };

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: OrderStatus.CANCELADO,
      rework_status: 'rejeitado',
      rework_rejected_reason: parsed.data.reason,
      internal_notes: parsed.data.reason,
    })
    .eq('id', order.id)
    .eq('lab_id', profile.lab_id);

  if (updateError) return { error: 'Nao foi possivel rejeitar o retrabalho.' };

  await supabase.from('order_status_history').insert({
    order_id: order.id,
    lab_id: profile.lab_id,
    old_status: order.status,
    new_status: OrderStatus.CANCELADO,
    changed_by_profile_id: profile.id,
    notes: parsed.data.reason,
  });

  revalidateOrderRoutes(order.id);
  if (order.parent_order_id) revalidateOrderRoutes(order.parent_order_id);
  return { success: true };
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
    .select('id, status, lab_id, internal_notes, order_type, rework_status')
    .eq('id', parsed.data.orderId)
    .eq('lab_id', profile.lab_id)
    .single();

  if (orderError || !order) return { error: 'Pedido nao encontrado.' };

  const currentStatus = order.status as OrderStatus;
  const nextStatus = parsed.data.nextStatus;

  if (order.order_type === 'rework' && order.rework_status === 'aguardando_aceite') {
    return { error: 'Aceite o retrabalho antes de avancar o fluxo operacional.' };
  }

  if (!canTransitionStatus(currentStatus, nextStatus, true)) {
    return { error: 'Esta transicao de status nao e permitida.' };
  }

  if (nextStatus === OrderStatus.CONFIRMADO) {
    const stockResult = await deductStockForOrder(supabase, profile.lab_id, profile.id, order.id);
    if (stockResult.error) return { error: stockResult.error };
  }

  if (nextStatus === OrderStatus.CANCELADO && currentStatus !== OrderStatus.AGUARDANDO_CONFIRMACAO) {
    await restoreStockForCanceledOrder(supabase, profile.lab_id, profile.id, order.id);
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
