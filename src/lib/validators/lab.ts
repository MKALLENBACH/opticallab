import { z } from 'zod';
import { EntityStatus, UserRole } from '../types/enums';

export const labSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  legal_name: z.string().nullable().optional(),
  document: z.string().nullable().optional(),
  email: z.string().email('Email inválido').nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zip_code: z.string().nullable().optional(),
  status: z.nativeEnum(EntityStatus).default(EntityStatus.ACTIVE),
  slug: z.string().min(1, 'Slug é obrigatório').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hifens'),
  institutional_description: z.string().nullable().optional(),
});

export type LabInput = z.infer<typeof labSchema>;

export const labSettingsSchema = z.object({
  logo_url: z.string().url('URL inválida').nullable().optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um hex válido (ex: #6366F1)').nullable().optional(),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um hex válido (ex: #6366F1)').nullable().optional(),
  allow_negative_stock: z.boolean().default(false),
  allow_order_when_out_of_stock: z.boolean().default(true),
  default_delivery_message: z.string().nullable().optional(),
  default_out_of_stock_message: z.string().nullable().optional(),
});

export type LabSettingsInput = z.infer<typeof labSettingsSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().nullable().optional(),
  role: z.nativeEnum(UserRole),
  lab_id: z.string().uuid().nullable().optional(),
  optical_store_id: z.string().uuid().nullable().optional(),
  status: z.nativeEnum(EntityStatus).default(EntityStatus.ACTIVE),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const opticalStoreSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  document: z.string().nullable().optional(),
  responsible_name: z.string().nullable().optional(),
  email: z.string().email('Email inválido').nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zip_code: z.string().nullable().optional(),
  status: z.nativeEnum(EntityStatus).default(EntityStatus.ACTIVE),
  notes: z.string().nullable().optional(),
});

export type OpticalStoreInput = z.infer<typeof opticalStoreSchema>;
