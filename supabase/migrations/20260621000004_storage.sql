-- =============================================================================
-- Migration: 20260621000004_storage
-- Descrição: Configura buckets de storage e suas políticas de segurança (path isolation).
-- =============================================================================

-- Criação dos buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('lab-logos', 'lab-logos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('optical-logos', 'optical-logos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('order-attachments', 'order-attachments', false) ON CONFLICT DO NOTHING;

-- =============================================================================
-- 1. lab-logos (Logos de Laboratórios)
-- =============================================================================

-- Leitura pública
CREATE POLICY "lab_logos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lab-logos');

-- Upload: platform_admin pode qualquer path
CREATE POLICY "lab_logos_admin_write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'lab-logos'
    AND is_platform_admin()
  );

-- Upload: lab_admin no path do próprio lab
CREATE POLICY "lab_logos_lab_write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'lab-logos'
    AND (storage.foldername(name))[1] = get_current_lab_id()::text
    AND get_current_role() = 'lab_admin'
  );

-- Delete e Update (mesmas regras de insert)
CREATE POLICY "lab_logos_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  WITH CHECK (bucket_id = 'lab-logos' AND is_platform_admin());

CREATE POLICY "lab_logos_lab_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  WITH CHECK (
    bucket_id = 'lab-logos'
    AND (storage.foldername(name))[1] = get_current_lab_id()::text
    AND get_current_role() = 'lab_admin'
  );

CREATE POLICY "lab_logos_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'lab-logos' AND is_platform_admin());

CREATE POLICY "lab_logos_lab_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'lab-logos'
    AND (storage.foldername(name))[1] = get_current_lab_id()::text
    AND get_current_role() = 'lab_admin'
  );

-- =============================================================================
-- 2. optical-logos (Logos de Óticas)
-- =============================================================================

CREATE POLICY "optical_logos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'optical-logos');

-- Lab admin pode upload para óticas do seu lab
CREATE POLICY "optical_logos_lab_write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'optical-logos'
    AND (
      is_platform_admin()
      OR (
        get_current_role() = 'lab_admin'
        AND EXISTS (
          SELECT 1 FROM optical_stores
          WHERE id::text = (storage.foldername(name))[1]
            AND lab_id = get_current_lab_id()
        )
      )
    )
  );

-- Optical admin pode upload para própria ótica
CREATE POLICY "optical_logos_own_write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'optical-logos'
    AND (storage.foldername(name))[1] = get_current_optical_store_id()::text
    AND get_current_role() = 'optical_admin'
  );

-- Updates / Deletes seguindo a lógica do Insert
CREATE POLICY "optical_logos_lab_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  WITH CHECK (
    bucket_id = 'optical-logos'
    AND (
      is_platform_admin()
      OR (
        get_current_role() = 'lab_admin'
        AND EXISTS (
          SELECT 1 FROM optical_stores
          WHERE id::text = (storage.foldername(name))[1]
            AND lab_id = get_current_lab_id()
        )
      )
    )
  );

CREATE POLICY "optical_logos_own_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  WITH CHECK (
    bucket_id = 'optical-logos'
    AND (storage.foldername(name))[1] = get_current_optical_store_id()::text
    AND get_current_role() = 'optical_admin'
  );

CREATE POLICY "optical_logos_lab_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'optical-logos'
    AND (
      is_platform_admin()
      OR (
        get_current_role() = 'lab_admin'
        AND EXISTS (
          SELECT 1 FROM optical_stores
          WHERE id::text = (storage.foldername(name))[1]
            AND lab_id = get_current_lab_id()
        )
      )
    )
  );

CREATE POLICY "optical_logos_own_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'optical-logos'
    AND (storage.foldername(name))[1] = get_current_optical_store_id()::text
    AND get_current_role() = 'optical_admin'
  );

-- =============================================================================
-- 3. avatars (Fotos de Perfil)
-- =============================================================================

CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Cada usuário só pode upload no próprio path
CREATE POLICY "avatars_own_write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT id::text FROM get_current_profile())
  );

CREATE POLICY "avatars_own_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT id::text FROM get_current_profile())
  );

CREATE POLICY "avatars_own_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT id::text FROM get_current_profile())
  );
