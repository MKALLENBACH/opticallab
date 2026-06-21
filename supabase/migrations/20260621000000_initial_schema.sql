-- =============================================================================
-- Migration: 20260621000000_initial_schema
-- Descrição: Criação dos enums, tabelas e da extensão unaccent.
-- =============================================================================

-- Habilita a extensão unaccent para buscas ignorando acentuação
CREATE EXTENSION IF NOT EXISTS unaccent;

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Roles do sistema
CREATE TYPE user_role AS ENUM (
  'platform_admin',
  'lab_admin',
  'lab_user',
  'optical_admin',
  'optical_user'
);

-- Status de entidades
CREATE TYPE entity_status AS ENUM ('active', 'inactive', 'suspended');

-- Categorias de lente
CREATE TYPE lens_category AS ENUM (
  'monofocal', 'bifocal', 'multifocal_progressiva',
  'ocupacional', 'solar_grau', 'tratamento_especial', 'outro'
);

-- Material da lente
CREATE TYPE lens_material AS ENUM (
  'cr39', 'policarbonato', 'trivex', 'resina',
  'alto_indice', 'mineral', 'outro'
);

-- Índice de refração
CREATE TYPE refractive_index AS ENUM (
  '1.49', '1.56', '1.59', '1.60', '1.67', '1.74', 'outro'
);

-- Lado da lente
CREATE TYPE lens_side AS ENUM ('right', 'left', 'pair', 'not_applicable');

-- Status do pedido
CREATE TYPE order_status AS ENUM (
  'aguardando_confirmacao', 'confirmado', 'em_producao',
  'em_entrega', 'finalizado', 'cancelado'
);

-- Prioridade do pedido
CREATE TYPE order_priority AS ENUM ('normal', 'urgente');

-- Tipo de movimentação de estoque
CREATE TYPE movement_type AS ENUM (
  'entrada', 'saida', 'ajuste', 'reserva', 'cancelamento'
);

-- Ação de auditoria
CREATE TYPE audit_action AS ENUM (
  'create', 'update', 'delete', 'status_change',
  'login', 'stock_movement'
);

-- =============================================================================
-- TABELAS
-- =============================================================================

-- 1. labs (Laboratórios)
CREATE TABLE labs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  legal_name text,
  document text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  status entity_status NOT NULL DEFAULT 'active',
  slug text UNIQUE NOT NULL,
  institutional_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. lab_settings (Configurações White-label)
CREATE TABLE lab_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid UNIQUE NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  logo_url text,
  primary_color text DEFAULT '#6366F1',
  secondary_color text DEFAULT '#8B5CF6',
  allow_negative_stock boolean NOT NULL DEFAULT false,
  allow_order_when_out_of_stock boolean NOT NULL DEFAULT true,
  default_delivery_message text DEFAULT 'Entrega estimada conforme prazo do produto.',
  default_out_of_stock_message text DEFAULT 'Sem pronta entrega. Entre em contato com o laboratório para mais informações.',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. lab_order_sequences (Sequência Concurrency-Safe de Pedidos)
CREATE TABLE lab_order_sequences (
  lab_id uuid PRIMARY KEY REFERENCES labs(id) ON DELETE CASCADE,
  current_number integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. optical_stores (Óticas)
CREATE TABLE optical_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  name text NOT NULL,
  document text,
  responsible_name text,
  email text,
  phone text,
  logo_url text,
  address text,
  city text,
  state text,
  zip_code text,
  status entity_status NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. profiles (Perfis de Usuários)
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text,
  avatar_url text,
  role user_role NOT NULL,
  lab_id uuid REFERENCES labs(id) ON DELETE SET NULL,
  optical_store_id uuid REFERENCES optical_stores(id) ON DELETE SET NULL,
  status entity_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. lens_types (Tipos de Lente / Catálogo)
CREATE TABLE lens_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text,
  model text,
  category lens_category,
  material lens_material,
  refractive_index refractive_index,
  treatments text[] NOT NULL DEFAULT '{}',
  allow_order_when_out_of_stock boolean DEFAULT NULL,
  default_delivery_time_in_stock_days integer,
  default_production_time_out_of_stock_days integer,
  description text,
  technical_notes text,
  status entity_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. lens_variants (Estoque / SKU)
CREATE TABLE lens_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  lens_type_id uuid NOT NULL REFERENCES lens_types(id) ON DELETE CASCADE,
  sku text NOT NULL,
  barcode text,
  external_code text,
  sphere_esf numeric(6,2),
  cylinder_cil numeric(6,2),
  axis integer CHECK (axis IS NULL OR (axis >= 0 AND axis <= 180)),
  addition_add numeric(6,2),
  prism text,
  prism_base text,
  base_curve numeric(5,2),
  diameter numeric(5,2),
  side lens_side DEFAULT 'not_applicable',
  color text,
  coating_details text,
  extra_info text,
  quantity_available integer NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  minimum_stock integer DEFAULT 0,
  location text,
  delivery_time_in_stock_days integer,
  production_time_out_of_stock_days integer,
  status entity_status NOT NULL DEFAULT 'active',
  searchable_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lab_id, sku)
);

-- 8. orders (Pedidos)
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  optical_store_id uuid NOT NULL REFERENCES optical_stores(id),
  order_number text NOT NULL,
  status order_status NOT NULL DEFAULT 'aguardando_confirmacao',
  priority order_priority NOT NULL DEFAULT 'normal',
  desired_delivery_date date,
  requested_by_profile_id uuid NOT NULL REFERENCES profiles(id),
  confirmed_by_profile_id uuid REFERENCES profiles(id),
  confirmed_at timestamptz,
  notes text,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lab_id, order_number)
);

-- 9. order_items (Itens do Pedido)
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  lab_id uuid NOT NULL REFERENCES labs(id),
  lens_type_id uuid NOT NULL REFERENCES lens_types(id),
  lens_variant_id uuid REFERENCES lens_variants(id),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sphere_esf numeric(6,2),
  cylinder_cil numeric(6,2),
  axis integer CHECK (axis IS NULL OR (axis >= 0 AND axis <= 180)),
  addition_add numeric(6,2),
  prism text,
  prism_base text,
  base_curve numeric(5,2),
  diameter numeric(5,2),
  side lens_side,
  item_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10. order_status_history (Histórico de Status)
CREATE TABLE order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  lab_id uuid NOT NULL REFERENCES labs(id),
  old_status order_status,
  new_status order_status NOT NULL,
  changed_by_profile_id uuid NOT NULL REFERENCES profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 11. order_attachments (Anexos de Pedidos - Preparação)
CREATE TABLE order_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  uploaded_by_profile_id uuid NOT NULL REFERENCES profiles(id),
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_size integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. inventory_movements (Movimentações de Estoque)
CREATE TABLE inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  lens_variant_id uuid NOT NULL REFERENCES lens_variants(id),
  movement_type movement_type NOT NULL,
  quantity integer NOT NULL,
  reason text,
  order_id uuid REFERENCES orders(id),
  created_by_profile_id uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 13. audit_logs (Logs de Auditoria)
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid REFERENCES labs(id),
  optical_store_id uuid REFERENCES optical_stores(id),
  profile_id uuid NOT NULL REFERENCES profiles(id),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action audit_action NOT NULL,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
