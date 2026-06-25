// ============================================================
// Entity Types — interfaces para todas as tabelas do banco
// ============================================================

import {
  UserRole,
  EntityStatus,
  LensSide,
  OrderStatus,
  OrderPriority,
  MovementType,
  AuditAction,
} from './enums';

// ---- Labs ----
export interface Lab {
  id: string;
  name: string;
  legal_name: string | null;
  document: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  status: EntityStatus;
  slug: string;
  institutional_description: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Lab Settings ----
export interface LabSettings {
  id: string;
  lab_id: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  allow_negative_stock: boolean;
  allow_order_when_out_of_stock: boolean;
  default_delivery_message: string | null;
  default_out_of_stock_message: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Profiles ----
export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  lab_id: string | null;
  optical_store_id: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

// ---- Optical Stores ----
export interface OpticalStore {
  id: string;
  lab_id: string;
  name: string;
  document: string | null;
  responsible_name: string | null;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  status: EntityStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Lens Types ----
export interface LensType {
  id: string;
  lab_id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  material: string | null;
  refractive_index: string | null;
  treatments: string[];
  allow_order_when_out_of_stock: boolean | null;
  default_delivery_time_in_stock_days: number | null;
  default_production_time_out_of_stock_days: number | null;
  description: string | null;
  technical_notes: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

// ---- Lens Variants (Stock Items) ----
export interface LensVariant {
  id: string;
  lab_id: string;
  lens_type_id: string;
  sku: string;
  barcode: string | null;
  external_code: string | null;
  sphere_esf: number | null;
  cylinder_cil: number | null;
  axis: number | null;
  addition_add: number | null;
  prism: string | null;
  prism_base: string | null;
  base_curve: number | null;
  diameter: number | null;
  side: LensSide;
  color: string | null;
  coating_details: string | null;
  extra_info: string | null;
  quantity_available: number;
  minimum_stock: number | null;
  location: string | null;
  delivery_time_in_stock_days: number | null;
  production_time_out_of_stock_days: number | null;
  status: EntityStatus;
  searchable_text: string;
  created_at: string;
  updated_at: string;
}

// Variante com dados do tipo de lente já inclusos (para resultados de busca)
export interface LensVariantWithType extends LensVariant {
  lens_type: LensType;
}

// ---- Orders ----
export interface Order {
  id: string;
  lab_id: string;
  optical_store_id: string;
  order_number: string;
  status: OrderStatus;
  priority: OrderPriority;
  desired_delivery_date: string | null;
  requested_by_profile_id: string;
  confirmed_by_profile_id: string | null;
  confirmed_at: string | null;
  notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Pedido com dados da ótica e do solicitante
export interface OrderWithDetails extends Order {
  optical_store: OpticalStore;
  requested_by: Profile;
  confirmed_by: Profile | null;
  items: OrderItem[];
  status_history: OrderStatusHistory[];
}

// ---- Order Items ----
export interface OrderItem {
  id: string;
  order_id: string;
  lab_id: string;
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
  side: LensSide | null;
  item_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemWithLens extends OrderItem {
  lens_type: LensType;
  lens_variant: LensVariant | null;
}

// ---- Order Status History ----
export interface OrderStatusHistory {
  id: string;
  order_id: string;
  lab_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by_profile_id: string;
  notes: string | null;
  created_at: string;
}

// ---- Order Attachments ----
export interface OrderAttachment {
  id: string;
  lab_id: string;
  order_id: string;
  uploaded_by_profile_id: string;
  attachment_type: string;
  file_url: string;
  file_path: string | null;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

// ---- Inventory Movements ----
export interface InventoryMovement {
  id: string;
  lab_id: string;
  lens_variant_id: string;
  movement_type: MovementType;
  quantity: number;
  reason: string | null;
  order_id: string | null;
  created_by_profile_id: string;
  created_at: string;
}

// ---- Audit Logs ----
export interface AuditLog {
  id: string;
  lab_id: string | null;
  optical_store_id: string | null;
  profile_id: string;
  entity_type: string;
  entity_id: string;
  action: AuditAction;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

// ---- Lab Order Sequences ----
export interface LabOrderSequence {
  lab_id: string;
  current_number: number;
  updated_at: string;
}
