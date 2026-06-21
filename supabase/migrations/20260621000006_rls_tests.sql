-- =============================================================================
-- Migration: 20260621000006_rls_tests
-- Descrição: Script de validação das políticas de RLS e triggers.
-- Para rodar, este script usa o "set_config" para simular a role (JWT uid).
-- =============================================================================

/*
-- INSTRUÇÕES DE EXECUÇÃO MANUAL EM AMBIENTE DE TESTE

-- 1. Criar um usuário Auth fake para testes (requer acesso service_role)
-- INSERT INTO auth.users (id, email) VALUES ('99999999-9999-9999-9999-999999999999', 'test@test.com');

-- 2. Criar o perfil de plataforma
-- INSERT INTO profiles (auth_user_id, full_name, email, role) VALUES ('99999999-9999-9999-9999-999999999999', 'Platform Admin', 'test@test.com', 'platform_admin');

-- 3. Iniciar transação de teste
BEGIN;

-- 4. Simular o login deste usuário
SET LOCAL request.jwt.claims = '{"sub": "99999999-9999-9999-9999-999999999999"}';
SET LOCAL role = authenticated;

-- 5. Testes de inserção (Platform Admin)
INSERT INTO labs (name, slug) VALUES ('Lab Teste RLS', 'lab-teste-rls');

-- ... (Outros testes descritos no implementation_plan.md)

ROLLBACK;
*/

-- Os testes RLS em projetos Supabase são mais efetivos quando feitos
-- programaticamente via pgTAP (extensão de testes do Postgres)
-- ou via rotinas de teste e2e com o cliente supabase-js usando JWTs reais.
-- Consulte o documento implementation_plan.md para ver os 13 testes documentados.
