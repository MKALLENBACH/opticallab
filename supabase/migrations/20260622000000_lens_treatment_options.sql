-- =============================================================================
-- Migration: 20260622000000_lens_treatment_options
-- Descricao: Opcoes reutilizaveis de tratamentos de lente por laboratorio.
-- =============================================================================

CREATE TABLE IF NOT EXISTS lens_treatment_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid REFERENCES labs(id) ON DELETE CASCADE,
  name text NOT NULL,
  normalized_name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  status entity_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lens_treatment_options_name_not_blank CHECK (length(trim(name)) >= 2),
  CONSTRAINT lens_treatment_options_scope_check CHECK (
    (is_default = true AND lab_id IS NULL)
    OR (is_default = false AND lab_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lens_treatment_options_default_unique
  ON lens_treatment_options (normalized_name)
  WHERE is_default = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_lens_treatment_options_lab_unique
  ON lens_treatment_options (lab_id, normalized_name)
  WHERE lab_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lens_treatment_options_lab_status
  ON lens_treatment_options (lab_id, status);

CREATE TRIGGER trg_updated_at_lens_treatment_options
  BEFORE UPDATE ON lens_treatment_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE lens_treatment_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY lens_treatment_options_select ON lens_treatment_options FOR SELECT
  TO authenticated USING (
    status = 'active'
    AND (
      is_default = true
      OR is_platform_admin()
      OR (lab_id = get_current_lab_id() AND is_user_lab_active())
    )
  );

CREATE POLICY lens_treatment_options_insert ON lens_treatment_options FOR INSERT
  TO authenticated WITH CHECK (
    is_default = false
    AND lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
    AND is_user_lab_active()
  );

CREATE POLICY lens_treatment_options_update ON lens_treatment_options FOR UPDATE
  TO authenticated USING (
    is_default = false
    AND lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
    AND is_user_lab_active()
  )
  WITH CHECK (
    is_default = false
    AND lab_id = get_current_lab_id()
    AND get_current_role() IN ('lab_admin', 'lab_user')
    AND is_user_lab_active()
  );

INSERT INTO lens_treatment_options (name, normalized_name, is_default, status) VALUES
  ('Antirreflexo', 'antirreflexo', true, 'active'),
  ('Blue Cut', 'blue cut', true, 'active'),
  ('Fotossensível', 'fotossensivel', true, 'active'),
  ('Polarizada', 'polarizada', true, 'active'),
  ('Proteção UV', 'protecao uv', true, 'active'),
  ('Endurecida', 'endurecida', true, 'active'),
  ('Hidrofóbica', 'hidrofobica', true, 'active'),
  ('Oleofóbica', 'oleofobica', true, 'active')
ON CONFLICT DO NOTHING;
