-- =============================================================================
-- Migration: 20260621000005_seed
-- Descrição: Dados mockados para desenvolvimento local.
-- NOTA: Como usamos IDs do auth.users, precisamos de auth users reais antes de
-- poder usar esse seed por completo. Este seed cria apenas entidades base.
-- =============================================================================

-- Seed de Labs (será gerado ID UUID v4)
INSERT INTO labs (id, name, slug, email) VALUES 
('11111111-1111-1111-1111-111111111111', 'Laboratório Óptico Master', 'masterlab', 'contato@masterlab.com.br'),
('22222222-2222-2222-2222-222222222222', 'Ótica Express Lab', 'expresslab', 'contato@expresslab.com.br')
ON CONFLICT DO NOTHING;

-- lab_settings são criados automaticamente via Trigger

-- Seed de Óticas (Ligadas ao Lab 1)
INSERT INTO optical_stores (id, lab_id, name, email) VALUES 
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Ótica Visão Perfeita', 'contato@visaoperfeita.com'),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Ótica Olho Vivo', 'contato@olhovivo.com')
ON CONFLICT DO NOTHING;

-- Seed de Tipos de Lentes
INSERT INTO lens_types (id, lab_id, name, brand, category, material, treatments, allow_order_when_out_of_stock, default_delivery_time_in_stock_days, default_production_time_out_of_stock_days) VALUES
('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'Visão Simples AR', 'Zeiss', 'monofocal', 'resina', '{antirreflexo}', true, 1, 3),
('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'Multifocal Digital', 'Essilor', 'multifocal_progressiva', 'policarbonato', '{antirreflexo, blue_cut}', false, 2, 5)
ON CONFLICT DO NOTHING;

-- Seed de Estoque (Lens Variants)
INSERT INTO lens_variants (id, lab_id, lens_type_id, sku, sphere_esf, cylinder_cil, quantity_available, searchable_text) VALUES
('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', 'VS-AR-001', -2.00, 0, 50, ''),
('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', 'VS-AR-002', -2.25, -0.50, 20, ''),
('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444442', 'MF-DIG-001', 1.00, 0, 0, '')
ON CONFLICT DO NOTHING;

-- Trigger cuidará de popular o searchable_text.

-- NOTA IMPORTANTÍSSIMA:
-- Para testar orders e outras funções vinculadas a usuários,
-- primeiro será necessário criar o usuário no Supabase Auth via Dashboard,
-- depois associar o UUID gerado à tabela 'profiles'.
