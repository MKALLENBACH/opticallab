-- =============================================================================
-- Migration: 20260624000000_special_orders
-- Descricao: Metadados para pedidos especiais sem alterar o fluxo normal por SKU.
-- =============================================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_type text NOT NULL DEFAULT 'normal'
    CHECK (order_type IN ('normal', 'special')),
  ADD COLUMN IF NOT EXISTS special_status text
    CHECK (
      special_status IS NULL OR special_status IN (
        'aguardando_analise',
        'aprovado',
        'rejeitado',
        'em_producao',
        'em_entrega',
        'finalizado',
        'cancelado'
      )
    ),
  ADD COLUMN IF NOT EXISTS estimated_delivery_date date,
  ADD COLUMN IF NOT EXISTS lab_estimated_delivery_notes text,
  ADD COLUMN IF NOT EXISTS special_rejection_reason text,
  ADD COLUMN IF NOT EXISTS matched_lens_variant_id uuid REFERENCES lens_variants(id),
  ADD COLUMN IF NOT EXISTS created_lens_variant_id uuid REFERENCES lens_variants(id);

ALTER TABLE lens_variants
  ADD COLUMN IF NOT EXISTS source_special_order_id uuid REFERENCES orders(id);

CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_special_status ON orders(special_status);
CREATE INDEX IF NOT EXISTS idx_lens_variants_source_special_order_id ON lens_variants(source_special_order_id);
