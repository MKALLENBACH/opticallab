import { z } from 'zod';
import { EntityStatus, LensSide } from '../types/enums';

export const lensTypeSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  refractive_index: z.string().nullable().optional(),
  treatments: z.array(z.string()).default([]),
  allow_order_when_out_of_stock: z.boolean().nullable().optional(),
  default_delivery_time_in_stock_days: z.number().int().min(0).nullable().optional(),
  default_production_time_out_of_stock_days: z.number().int().min(0).nullable().optional(),
  description: z.string().nullable().optional(),
  technical_notes: z.string().nullable().optional(),
  status: z.nativeEnum(EntityStatus).default(EntityStatus.ACTIVE),
});

export type LensTypeInput = z.infer<typeof lensTypeSchema>;

export const lensVariantSchema = z.object({
  lens_type_id: z.string().uuid('ID do tipo de lente inválido'),
  sku: z.string().min(1, 'SKU é obrigatório'),
  barcode: z.string().nullable().optional(),
  external_code: z.string().nullable().optional(),
  sphere_esf: z.number().nullable().optional(),
  cylinder_cil: z.number().nullable().optional(),
  axis: z.number().int().min(0).max(180).nullable().optional(),
  addition_add: z.number().min(0).nullable().optional(),
  prism: z.string().nullable().optional(),
  prism_base: z.string().nullable().optional(),
  base_curve: z.number().nullable().optional(),
  diameter: z.number().nullable().optional(),
  side: z.nativeEnum(LensSide).default(LensSide.NOT_APPLICABLE),
  color: z.string().nullable().optional(),
  coating_details: z.string().nullable().optional(),
  extra_info: z.string().nullable().optional(),
  quantity_available: z.number().int().min(0).default(0),
  minimum_stock: z.number().int().min(0).nullable().optional(),
  location: z.string().nullable().optional(),
  delivery_time_in_stock_days: z.number().int().min(0).nullable().optional(),
  production_time_out_of_stock_days: z.number().int().min(0).nullable().optional(),
  status: z.nativeEnum(EntityStatus).default(EntityStatus.ACTIVE),
});

export type LensVariantInput = z.infer<typeof lensVariantSchema>;
