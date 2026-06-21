import { z } from 'zod';
import { OrderPriority, LensSide } from '../types/enums';

export const orderItemSchema = z.object({
  lens_type_id: z.string().uuid('Tipo de lente é obrigatório'),
  lens_variant_id: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1, 'Quantidade deve ser maior que zero').default(1),
  sphere_esf: z.number().nullable().optional(),
  cylinder_cil: z.number().nullable().optional(),
  axis: z.number().int().min(0).max(180).nullable().optional(),
  addition_add: z.number().min(0).nullable().optional(),
  prism: z.string().nullable().optional(),
  prism_base: z.string().nullable().optional(),
  base_curve: z.number().nullable().optional(),
  diameter: z.number().nullable().optional(),
  side: z.nativeEnum(LensSide).nullable().optional(),
  item_notes: z.string().nullable().optional(),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  optical_store_id: z.string().uuid('Ótica é obrigatória'),
  priority: z.nativeEnum(OrderPriority).default(OrderPriority.NORMAL),
  desired_delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato deve ser YYYY-MM-DD').nullable().optional(),
  notes: z.string().nullable().optional(),
  internal_notes: z.string().nullable().optional(), // Apenas para lab
  items: z.array(orderItemSchema).min(1, 'O pedido deve ter pelo menos um item'),
});

export type OrderInput = z.infer<typeof orderSchema>;
