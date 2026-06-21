-- =============================================================================
-- Migration: 20260621000002_functions_and_triggers
-- Descrição: Funções auxiliares (RLS, numeração de pedidos) e triggers (updated_at, searchable_text, proteções).
-- =============================================================================

-- =============================================================================
-- 1. FUNÇÕES HELPER DE RLS (Sempre com SECURITY DEFINER e search_path = public)
-- =============================================================================

-- Retorna o perfil do usuário autenticado
CREATE OR REPLACE FUNCTION get_current_profile()
RETURNS TABLE (
  id uuid,
  role user_role,
  lab_id uuid,
  optical_store_id uuid,
  status entity_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.role, p.lab_id, p.optical_store_id, p.status
  FROM profiles p
  WHERE p.auth_user_id = auth.uid()
    AND p.status = 'active'
  LIMIT 1;
$$;

-- Verifica se o usuário é platform_admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
      AND role = 'platform_admin'
      AND status = 'active'
  );
$$;

-- Verifica se o lab do usuário está ativo
CREATE OR REPLACE FUNCTION is_user_lab_active()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN labs l ON l.id = p.lab_id
    WHERE p.auth_user_id = auth.uid()
      AND p.status = 'active'
      AND l.status = 'active'
  );
$$;

-- Retorna lab_id do usuário atual
CREATE OR REPLACE FUNCTION get_current_lab_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.lab_id
  FROM profiles p
  WHERE p.auth_user_id = auth.uid()
    AND p.status = 'active'
  LIMIT 1;
$$;

-- Retorna optical_store_id do usuário atual
CREATE OR REPLACE FUNCTION get_current_optical_store_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.optical_store_id
  FROM profiles p
  WHERE p.auth_user_id = auth.uid()
    AND p.status = 'active'
  LIMIT 1;
$$;

-- Retorna role do usuário atual
CREATE OR REPLACE FUNCTION get_current_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role
  FROM profiles p
  WHERE p.auth_user_id = auth.uid()
    AND p.status = 'active'
  LIMIT 1;
$$;


-- =============================================================================
-- 2. GERAÇÃO DE ORDER NUMBER (CONCURRENCY-SAFE)
-- =============================================================================

CREATE OR REPLACE FUNCTION get_next_order_number(p_lab_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num integer;
BEGIN
  -- Lock a linha da sequência para evitar concorrência
  UPDATE lab_order_sequences
  SET current_number = current_number + 1,
      updated_at = now()
  WHERE lab_id = p_lab_id
  RETURNING current_number INTO next_num;

  -- Se não existe sequência, criar com número 1
  IF next_num IS NULL THEN
    INSERT INTO lab_order_sequences (lab_id, current_number, updated_at)
    VALUES (p_lab_id, 1, now())
    ON CONFLICT (lab_id)
    DO UPDATE SET
      current_number = lab_order_sequences.current_number + 1,
      updated_at = now()
    RETURNING current_number INTO next_num;
  END IF;

  RETURN 'PED-' || LPAD(next_num::text, 6, '0');
END;
$$;


-- =============================================================================
-- 3. VALIDAÇÃO DE TRANSIÇÃO DE STATUS DE PEDIDOS
-- =============================================================================

CREATE OR REPLACE FUNCTION validate_order_status_transition(
  old_status order_status,
  new_status order_status,
  is_lab boolean
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- Cancelamento permitido apenas pelo laboratório
  IF new_status = 'cancelado' THEN
    RETURN is_lab;
  END IF;

  RETURN CASE
    WHEN old_status = 'aguardando_confirmacao' AND new_status = 'confirmado' THEN true
    WHEN old_status = 'confirmado' AND new_status = 'em_producao' THEN true
    WHEN old_status = 'confirmado' AND new_status = 'em_entrega' THEN true
    WHEN old_status = 'em_producao' AND new_status = 'em_entrega' THEN true
    WHEN old_status = 'em_entrega' AND new_status = 'finalizado' THEN true
    ELSE false
  END;
END;
$$;


-- =============================================================================
-- 4. FUNÇÕES DE TRIGGER
-- =============================================================================

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Cria lab_settings automaticamente ao inserir um lab
CREATE OR REPLACE FUNCTION create_lab_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO lab_settings (lab_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Atualiza searchable_text da variante da lente
CREATE OR REPLACE FUNCTION build_searchable_text()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  lt lens_types%ROWTYPE;
  parts text := '';
BEGIN
  SELECT * INTO lt FROM lens_types WHERE id = NEW.lens_type_id;

  -- Dados básicos da lente
  parts := COALESCE(lt.name, '') || ' '
    || COALESCE(lt.brand, '') || ' '
    || COALESCE(lt.model, '') || ' '
    || COALESCE(lt.category::text, '') || ' '
    || COALESCE(lt.material::text, '') || ' '
    || COALESCE(lt.refractive_index::text, '') || ' '
    || COALESCE(lt.description, '') || ' '
    || COALESCE(lt.technical_notes, '');

  -- Tratamentos múltiplos
  IF lt.treatments IS NOT NULL AND array_length(lt.treatments, 1) > 0 THEN
    parts := parts || ' ' || array_to_string(lt.treatments, ' ');
  END IF;

  -- Dados da variante
  parts := parts || ' '
    || COALESCE(NEW.sku, '') || ' '
    || COALESCE(NEW.external_code, '') || ' '
    || COALESCE(NEW.barcode, '') || ' '
    || COALESCE(NEW.color, '') || ' '
    || COALESCE(NEW.coating_details, '') || ' '
    || COALESCE(NEW.extra_info, '');

  -- Valores de grau normalizados (com ponto e vírgula)
  IF NEW.sphere_esf IS NOT NULL THEN
    parts := parts || ' esf' || NEW.sphere_esf::text
           || ' esf' || replace(NEW.sphere_esf::text, '.', ',');
  END IF;
  
  IF NEW.cylinder_cil IS NOT NULL THEN
    parts := parts || ' cil' || NEW.cylinder_cil::text
           || ' cil' || replace(NEW.cylinder_cil::text, '.', ',');
  END IF;
  
  IF NEW.axis IS NOT NULL THEN
    parts := parts || ' eixo' || NEW.axis::text || ' ' || NEW.axis::text;
  END IF;

  IF NEW.addition_add IS NOT NULL THEN
    parts := parts || ' add' || NEW.addition_add::text
           || ' add' || replace(NEW.addition_add::text, '.', ',');
  END IF;

  -- Remove acentos e converte para minúsculas
  NEW.searchable_text := lower(unaccent(regexp_replace(parts, '\s+', ' ', 'g')));

  RETURN NEW;
END;
$$;

-- Proteções (Triggers BEFORE UPDATE)
CREATE OR REPLACE FUNCTION protect_profile_auth_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Impede alteração do vínculo com auth.users
  NEW.auth_user_id = OLD.auth_user_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION protect_optical_store_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role user_role;
BEGIN
  SELECT role INTO current_role
  FROM profiles
  WHERE auth_user_id = auth.uid();

  IF current_role IN ('optical_admin', 'optical_user') THEN
    NEW.lab_id = OLD.lab_id;
    NEW.status = OLD.status;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION protect_lab_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role user_role;
BEGIN
  SELECT role INTO current_role
  FROM profiles
  WHERE auth_user_id = auth.uid();

  IF current_role IN ('lab_admin', 'lab_user') THEN
    NEW.status = OLD.status;
  END IF;

  RETURN NEW;
END;
$$;

-- =============================================================================
-- 5. ATRIBUIÇÃO DE TRIGGERS
-- =============================================================================

-- updated_at
CREATE TRIGGER trg_updated_at_labs BEFORE UPDATE ON labs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_lab_settings BEFORE UPDATE ON lab_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_optical_stores BEFORE UPDATE ON optical_stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_lens_types BEFORE UPDATE ON lens_types FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_lens_variants BEFORE UPDATE ON lens_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_order_items BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- criação automática
CREATE TRIGGER trg_create_lab_settings AFTER INSERT ON labs FOR EACH ROW EXECUTE FUNCTION create_lab_defaults();

-- searchable text
CREATE TRIGGER trg_build_searchable_text BEFORE INSERT OR UPDATE ON lens_variants FOR EACH ROW EXECUTE FUNCTION build_searchable_text();

-- proteções
CREATE TRIGGER trg_protect_profile_auth BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION protect_profile_auth_id();
CREATE TRIGGER trg_protect_optical_store BEFORE UPDATE ON optical_stores FOR EACH ROW EXECUTE FUNCTION protect_optical_store_fields();
CREATE TRIGGER trg_protect_lab_status BEFORE UPDATE ON labs FOR EACH ROW EXECUTE FUNCTION protect_lab_status();
