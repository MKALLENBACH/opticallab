-- =============================================================================
-- Migration: 20260624000001_rework_orders
-- Descricao: Metadados para fluxo de retrabalho vinculado a pedidos finalizados.
-- =============================================================================

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_order_type_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_order_type_check
    CHECK (order_type IN ('normal', 'special', 'rework'));

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS parent_order_id uuid REFERENCES orders(id),
  ADD COLUMN IF NOT EXISTS rework_reason text
    CHECK (rework_reason IS NULL OR rework_reason IN ('erro_de_medico')),
  ADD COLUMN IF NOT EXISTS rework_status text
    CHECK (
      rework_status IS NULL OR rework_status IN (
        'aguardando_aceite',
        'aceito',
        'rejeitado'
      )
    ),
  ADD COLUMN IF NOT EXISTS rework_opened_by_profile_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS rework_opened_by_role text
    CHECK (rework_opened_by_role IS NULL OR rework_opened_by_role IN ('lab', 'optical')),
  ADD COLUMN IF NOT EXISTS rework_rejected_reason text,
  ADD COLUMN IF NOT EXISTS rework_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS rework_accepted_by_profile_id uuid REFERENCES profiles(id);

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS source_order_item_id uuid REFERENCES order_items(id),
  ADD COLUMN IF NOT EXISTS rework_action text
    CHECK (
      rework_action IS NULL OR rework_action IN (
        'same_lens',
        'replace_sku',
        'special'
      )
    );

CREATE INDEX IF NOT EXISTS idx_orders_parent_order_id ON orders(parent_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_rework_status ON orders(rework_status);
CREATE INDEX IF NOT EXISTS idx_order_items_source_order_item_id ON order_items(source_order_item_id);
