-- =============================================================================
-- Migration: 20260621000001_indexes
-- Descrição: Criação de índices para otimização de buscas e RLS.
-- =============================================================================

-- === Performance de RLS (crítico) ===
CREATE INDEX idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX idx_profiles_lab_id ON profiles(lab_id);
CREATE INDEX idx_profiles_optical_store_id ON profiles(optical_store_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);

-- === Tenant isolation ===
CREATE INDEX idx_lab_settings_lab_id ON lab_settings(lab_id);
CREATE INDEX idx_optical_stores_lab_id ON optical_stores(lab_id);
CREATE INDEX idx_lens_types_lab_id ON lens_types(lab_id);
CREATE INDEX idx_lens_variants_lab_id ON lens_variants(lab_id);
CREATE INDEX idx_lens_variants_lens_type_id ON lens_variants(lens_type_id);

-- === Busca de lentes (GIN para text search + array) ===
CREATE INDEX idx_lens_variants_searchable_gin
  ON lens_variants USING gin(to_tsvector('simple', searchable_text));
CREATE INDEX idx_lens_types_treatments_gin
  ON lens_types USING gin(treatments);

-- === Pedidos ===
CREATE INDEX idx_orders_lab_id ON orders(lab_id);
CREATE INDEX idx_orders_optical_store_id ON orders(optical_store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_priority ON orders(priority);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- === Itens e histórico ===
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_attachments_order_id ON order_attachments(order_id);
CREATE INDEX idx_inventory_movements_lens_variant_id ON inventory_movements(lens_variant_id);
CREATE INDEX idx_inventory_movements_lab_id ON inventory_movements(lab_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_lab_id ON audit_logs(lab_id);
