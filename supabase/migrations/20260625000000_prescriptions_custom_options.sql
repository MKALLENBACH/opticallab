-- =============================================================================
-- Migration: 20260625000000_prescriptions_custom_options
-- Descricao: Receita obrigatoria, opcoes customizadas por laboratorio e ajustes de storage.
-- =============================================================================

-- Receita / anexos de pedidos
ALTER TABLE order_attachments
  ADD COLUMN IF NOT EXISTS attachment_type text NOT NULL DEFAULT 'prescription',
  ADD COLUMN IF NOT EXISTS file_path text;

UPDATE order_attachments
SET file_path = file_url
WHERE file_path IS NULL;

ALTER TABLE order_attachments
  ADD CONSTRAINT order_attachments_attachment_type_check
    CHECK (attachment_type IN ('prescription', 'general'));

CREATE INDEX IF NOT EXISTS idx_order_attachments_type ON order_attachments(order_id, attachment_type);
CREATE INDEX IF NOT EXISTS idx_order_attachments_file_path ON order_attachments(file_path);

-- Campos de catalogo passam a aceitar opcoes customizadas salvas como texto.
ALTER TABLE lens_types
  ALTER COLUMN category TYPE text USING category::text,
  ALTER COLUMN material TYPE text USING material::text,
  ALTER COLUMN refractive_index TYPE text USING refractive_index::text;

-- Motivo de retrabalho agora e dinamico por laboratorio.
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_rework_reason_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_rework_reason_present_for_rework
    CHECK (order_type <> 'rework' OR NULLIF(trim(COALESCE(rework_reason, '')), '') IS NOT NULL);

-- Opcoes customizadas por laboratorio.
CREATE TABLE IF NOT EXISTS lab_custom_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  option_type text NOT NULL,
  name text NOT NULL,
  normalized_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_by_profile_id uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lab_id, option_type, normalized_name),
  CHECK (status IN ('active', 'inactive')),
  CHECK (option_type IN (
    'brand',
    'lens_category',
    'lens_material',
    'refractive_index',
    'lens_treatment',
    'rework_reason'
  ))
);

ALTER TABLE lab_custom_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lab_custom_options_select ON lab_custom_options;
CREATE POLICY lab_custom_options_select ON lab_custom_options FOR SELECT
  TO authenticated USING (
    is_platform_admin()
    OR lab_id = get_current_lab_id()
  );

DROP POLICY IF EXISTS lab_custom_options_insert ON lab_custom_options;
CREATE POLICY lab_custom_options_insert ON lab_custom_options FOR INSERT
  TO authenticated WITH CHECK (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
  );

DROP POLICY IF EXISTS lab_custom_options_update ON lab_custom_options;
CREATE POLICY lab_custom_options_update ON lab_custom_options FOR UPDATE
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
  )
  WITH CHECK (
    lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
  );

CREATE INDEX IF NOT EXISTS idx_lab_custom_options_lookup
  ON lab_custom_options(lab_id, option_type, status, name);

DROP TRIGGER IF EXISTS trg_updated_at_lab_custom_options ON lab_custom_options;
CREATE TRIGGER trg_updated_at_lab_custom_options
  BEFORE UPDATE ON lab_custom_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Migra tratamentos customizados antigos, preservando compatibilidade.
INSERT INTO lab_custom_options (lab_id, option_type, name, normalized_name, status)
SELECT lab_id, 'lens_treatment', name, normalized_name, status::text
FROM lens_treatment_options
WHERE lab_id IS NOT NULL
ON CONFLICT (lab_id, option_type, normalized_name) DO NOTHING;

-- Storage privado de receitas/anexos.
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-attachments', 'order-attachments', false)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "order_attachments_read" ON storage.objects;
CREATE POLICY "order_attachments_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'order-attachments'
    AND EXISTS (
      SELECT 1
      FROM order_attachments oa
      JOIN orders o ON o.id = oa.order_id
      WHERE oa.file_path = storage.objects.name
        AND oa.lab_id = get_current_lab_id()
        AND (
          is_platform_admin()
          OR get_current_role() IN ('lab_admin', 'lab_user')
          OR (
            get_current_role() IN ('optical_admin', 'optical_user')
            AND o.optical_store_id = get_current_optical_store_id()
          )
        )
    )
  );

DROP POLICY IF EXISTS "order_attachments_pending_insert" ON storage.objects;
CREATE POLICY "order_attachments_pending_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'order-attachments'
    AND (storage.foldername(name))[1] = get_current_lab_id()::text
    AND (storage.foldername(name))[2] = 'pending'
    AND (storage.foldername(name))[3] = (SELECT id::text FROM get_current_profile())
  );

DROP POLICY IF EXISTS "order_attachments_pending_delete" ON storage.objects;
CREATE POLICY "order_attachments_pending_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'order-attachments'
    AND (
      (
        (storage.foldername(name))[1] = get_current_lab_id()::text
        AND (storage.foldername(name))[2] = 'pending'
        AND (storage.foldername(name))[3] = (SELECT id::text FROM get_current_profile())
      )
      OR EXISTS (
        SELECT 1
        FROM order_attachments oa
        JOIN orders o ON o.id = oa.order_id
        WHERE oa.file_path = storage.objects.name
          AND oa.lab_id = get_current_lab_id()
          AND (
            get_current_role() IN ('lab_admin', 'lab_user')
            OR (
              get_current_role() IN ('optical_admin', 'optical_user')
              AND o.optical_store_id = get_current_optical_store_id()
              AND o.status = 'aguardando_confirmacao'
            )
          )
      )
    )
  );

-- Rollback seguro de pedidos parciais em actions.
DROP POLICY IF EXISTS orders_delete_rollback_lab ON orders;
CREATE POLICY orders_delete_rollback_lab ON orders FOR DELETE
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND status = 'aguardando_confirmacao'
    AND get_current_role() IN ('lab_admin', 'lab_user')
  );

DROP POLICY IF EXISTS orders_delete_rollback_optical ON orders;
CREATE POLICY orders_delete_rollback_optical ON orders FOR DELETE
  TO authenticated USING (
    lab_id = get_current_lab_id()
    AND optical_store_id = get_current_optical_store_id()
    AND status = 'aguardando_confirmacao'
    AND get_current_role() IN ('optical_admin', 'optical_user')
  );
