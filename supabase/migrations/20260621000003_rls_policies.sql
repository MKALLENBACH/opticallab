-- =============================================================================
-- Migration: 20260621000003_rls_policies
-- Descrição: Habilita e configura as políticas de segurança em nível de linha (RLS) para todas as tabelas.
-- =============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_order_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE optical_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lens_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE lens_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 1. labs
-- =============================================================================
CREATE POLICY labs_select_admin ON labs FOR SELECT
  TO authenticated USING (is_platform_admin());

CREATE POLICY labs_select_member ON labs FOR SELECT
  TO authenticated USING (id = get_current_lab_id() AND is_user_lab_active());

CREATE POLICY labs_insert ON labs FOR INSERT
  TO authenticated WITH CHECK (is_platform_admin());

CREATE POLICY labs_update_admin ON labs FOR UPDATE
  TO authenticated USING (is_platform_admin());

CREATE POLICY labs_update_own ON labs FOR UPDATE
  TO authenticated USING (
    id = get_current_lab_id()
    AND get_current_role() = 'lab_admin'
    AND is_user_lab_active()
  );

CREATE POLICY labs_delete ON labs FOR DELETE
  TO authenticated USING (is_platform_admin());


-- =============================================================================
-- 2. lab_settings
-- =============================================================================
CREATE POLICY lab_settings_select_admin ON lab_settings FOR SELECT
  TO authenticated USING (is_platform_admin());

CREATE POLICY lab_settings_select_member ON lab_settings FOR SELECT
  TO authenticated USING (lab_id = get_current_lab_id() AND is_user_lab_active());

CREATE POLICY lab_settings_update_admin ON lab_settings FOR UPDATE
  TO authenticated USING (is_platform_admin());

CREATE POLICY lab_settings_update_own ON lab_settings FOR UPDATE
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND get_current_role() = 'lab_admin'
    AND is_user_lab_active()
  );

CREATE POLICY lab_settings_insert ON lab_settings FOR INSERT
  TO authenticated WITH CHECK (is_platform_admin());


-- =============================================================================
-- 3. profiles
-- =============================================================================
CREATE POLICY profiles_select_admin ON profiles FOR SELECT
  TO authenticated USING (is_platform_admin());

CREATE POLICY profiles_select_lab ON profiles FOR SELECT
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
  );

CREATE POLICY profiles_select_optical ON profiles FOR SELECT
  TO authenticated USING (
    (id = (SELECT id FROM get_current_profile()))
    OR (
      optical_store_id = get_current_optical_store_id()
      AND get_current_role() IN ('optical_admin', 'optical_user')
    )
  );

-- UPDATE próprio perfil
CREATE POLICY profiles_update_own ON profiles FOR UPDATE
  TO authenticated USING (auth_user_id = auth.uid());

CREATE POLICY profiles_update_lab ON profiles FOR UPDATE
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND get_current_role() = 'lab_admin'
  );

CREATE POLICY profiles_update_admin ON profiles FOR UPDATE
  TO authenticated USING (is_platform_admin());


-- =============================================================================
-- 4. optical_stores
-- =============================================================================
CREATE POLICY optical_stores_select_admin ON optical_stores FOR SELECT
  TO authenticated USING (is_platform_admin());

CREATE POLICY optical_stores_select_lab ON optical_stores FOR SELECT
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
  );

CREATE POLICY optical_stores_select_own ON optical_stores FOR SELECT
  TO authenticated USING (
    id = get_current_optical_store_id()
    AND get_current_role() IN ('optical_admin', 'optical_user')
  );

CREATE POLICY optical_stores_insert ON optical_stores FOR INSERT
  TO authenticated WITH CHECK (
    is_platform_admin() OR
    (lab_id = get_current_lab_id() AND get_current_role() = 'lab_admin')
  );

CREATE POLICY optical_stores_update_lab ON optical_stores FOR UPDATE
  TO authenticated USING (
    is_platform_admin() OR
    (lab_id = get_current_lab_id() AND get_current_role() = 'lab_admin')
  );

CREATE POLICY optical_stores_update_own ON optical_stores FOR UPDATE
  TO authenticated USING (
    id = get_current_optical_store_id()
    AND get_current_role() = 'optical_admin'
  );


-- =============================================================================
-- 5. lens_types
-- =============================================================================
CREATE POLICY lens_types_select ON lens_types FOR SELECT
  TO authenticated USING (
    is_platform_admin()
    OR (lab_id = get_current_lab_id() AND is_user_lab_active())
  );

CREATE POLICY lens_types_insert ON lens_types FOR INSERT
  TO authenticated WITH CHECK (
    is_platform_admin()
    OR (lab_id = get_current_lab_id() AND get_current_role() IN ('lab_admin', 'lab_user') AND is_user_lab_active())
  );

CREATE POLICY lens_types_update ON lens_types FOR UPDATE
  TO authenticated USING (
    is_platform_admin()
    OR (lab_id = get_current_lab_id() AND get_current_role() IN ('lab_admin', 'lab_user') AND is_user_lab_active())
  );

CREATE POLICY lens_types_delete ON lens_types FOR DELETE
  TO authenticated USING (
    is_platform_admin()
    OR (lab_id = get_current_lab_id() AND get_current_role() = 'lab_admin' AND is_user_lab_active())
  );


-- =============================================================================
-- 6. lens_variants
-- =============================================================================
CREATE POLICY lens_variants_select ON lens_variants FOR SELECT
  TO authenticated USING (
    is_platform_admin()
    OR (lab_id = get_current_lab_id() AND is_user_lab_active())
  );

CREATE POLICY lens_variants_insert ON lens_variants FOR INSERT
  TO authenticated WITH CHECK (
    is_platform_admin()
    OR (lab_id = get_current_lab_id() AND get_current_role() IN ('lab_admin', 'lab_user') AND is_user_lab_active())
  );

CREATE POLICY lens_variants_update ON lens_variants FOR UPDATE
  TO authenticated USING (
    is_platform_admin()
    OR (lab_id = get_current_lab_id() AND get_current_role() IN ('lab_admin', 'lab_user') AND is_user_lab_active())
  );

CREATE POLICY lens_variants_delete ON lens_variants FOR DELETE
  TO authenticated USING (
    is_platform_admin()
    OR (lab_id = get_current_lab_id() AND get_current_role() = 'lab_admin' AND is_user_lab_active())
  );


-- =============================================================================
-- 7. orders
-- =============================================================================
CREATE POLICY orders_select_admin ON orders FOR SELECT
  TO authenticated USING (is_platform_admin());

CREATE POLICY orders_select_lab ON orders FOR SELECT
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
  );

CREATE POLICY orders_select_optical ON orders FOR SELECT
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND optical_store_id = get_current_optical_store_id()
    AND get_current_role() IN ('optical_admin', 'optical_user')
  );

CREATE POLICY orders_insert_optical ON orders FOR INSERT
  TO authenticated WITH CHECK (
    lab_id = get_current_lab_id()
    AND optical_store_id = get_current_optical_store_id()
    AND get_current_role() IN ('optical_admin', 'optical_user')
  );

CREATE POLICY orders_insert_lab ON orders FOR INSERT
  TO authenticated WITH CHECK (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
  );

CREATE POLICY orders_update_lab ON orders FOR UPDATE
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
  );

CREATE POLICY orders_update_optical ON orders FOR UPDATE
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND optical_store_id = get_current_optical_store_id()
    AND status = 'aguardando_confirmacao'
    AND get_current_role() IN ('optical_admin', 'optical_user')
  );


-- =============================================================================
-- 8. order_items
-- =============================================================================
CREATE POLICY order_items_select ON order_items FOR SELECT
  TO authenticated USING (
    is_platform_admin()
    OR lab_id = get_current_lab_id()
  );

-- Lab: insere itens em pedidos do próprio lab
CREATE POLICY order_items_insert_lab ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
  );

-- Optical: insere apenas se pedido estiver em aguardando_confirmacao e for da própria ótica
CREATE POLICY order_items_insert_optical ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('optical_admin', 'optical_user')
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
        AND orders.status = 'aguardando_confirmacao'
        AND orders.optical_store_id = get_current_optical_store_id()
    )
  );

CREATE POLICY order_items_update_lab ON order_items FOR UPDATE
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
  );

-- Optical: update apenas se pedido estiver em aguardando_confirmacao
CREATE POLICY order_items_update_optical ON order_items FOR UPDATE
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('optical_admin', 'optical_user')
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.status = 'aguardando_confirmacao'
        AND orders.optical_store_id = get_current_optical_store_id()
    )
  );

-- Lab: deleta itens de pedidos do próprio lab
CREATE POLICY order_items_delete_lab ON order_items FOR DELETE
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
  );

-- Optical: deleta itens apenas se pedido estiver em aguardando_confirmacao
CREATE POLICY order_items_delete_optical ON order_items FOR DELETE
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('optical_admin', 'optical_user')
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.status = 'aguardando_confirmacao'
        AND orders.optical_store_id = get_current_optical_store_id()
    )
  );


-- =============================================================================
-- 9. order_status_history, inventory_movements, audit_logs
-- =============================================================================
CREATE POLICY osh_select ON order_status_history FOR SELECT
  TO authenticated USING (
    is_platform_admin() OR lab_id = get_current_lab_id()
  );

CREATE POLICY osh_insert ON order_status_history FOR INSERT
  TO authenticated WITH CHECK (
    lab_id = get_current_lab_id()
  );

CREATE POLICY inv_select ON inventory_movements FOR SELECT
  TO authenticated USING (
    is_platform_admin()
    OR (lab_id = get_current_lab_id() AND get_current_role() IN ('lab_admin', 'lab_user'))
  );

CREATE POLICY inv_insert ON inventory_movements FOR INSERT
  TO authenticated WITH CHECK (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
  );

CREATE POLICY al_select ON audit_logs FOR SELECT
  TO authenticated USING (
    is_platform_admin()
    OR lab_id = get_current_lab_id()
  );

CREATE POLICY al_insert ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (
    is_platform_admin()
    OR lab_id = get_current_lab_id()
  );


-- =============================================================================
-- 10. order_attachments
-- =============================================================================
CREATE POLICY oa_select_lab ON order_attachments FOR SELECT
  TO authenticated USING (
    is_platform_admin()
    OR (lab_id = get_current_lab_id() AND get_current_role() IN ('lab_admin', 'lab_user'))
  );

CREATE POLICY oa_select_optical ON order_attachments FOR SELECT
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('optical_admin', 'optical_user')
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_attachments.order_id
        AND orders.optical_store_id = get_current_optical_store_id()
    )
  );

CREATE POLICY oa_insert ON order_attachments FOR INSERT
  TO authenticated WITH CHECK (
    lab_id = get_current_lab_id()
  );
