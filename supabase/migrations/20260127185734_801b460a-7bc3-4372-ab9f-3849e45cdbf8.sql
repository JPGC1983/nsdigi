-- =============================================
-- CORREÇÃO DE SEGURANÇA: PRIVACIDADE DE DADOS PESSOAIS
-- =============================================

-- 1. Criar view pública de perfis (apenas dados não sensíveis)
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  full_name,
  municipality,
  avatar_url,
  job_title,
  created_at
FROM public.profiles;
-- Exclui: phone (dado sensível)

-- 2. Remover política antiga que expõe todos os dados
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- 3. Criar política restritiva: usuário só vê seu próprio perfil completo
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 4. Criar política para admins verem todos os perfis
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Criar política para coordenadores verem perfis da sua região
CREATE POLICY "Coordinators can view regional profiles"
ON public.profiles FOR SELECT
USING (
  has_role(auth.uid(), 'coordenador'::app_role) AND
  EXISTS (
    SELECT 1 FROM user_territory_profiles utp_viewer
    JOIN user_territory_profiles utp_target ON (
      -- Mesmo município
      (utp_viewer.municipio_id = utp_target.municipio_id) OR
      -- Mesma microrregião (para nsd_microrregional)
      (utp_viewer.perfil_territorio = 'nsd_microrregional' AND utp_viewer.microregiao = utp_target.microregiao) OR
      -- Mesma URS (para grs)
      (utp_viewer.perfil_territorio = 'grs' AND utp_viewer.urs = utp_target.urs) OR
      -- Estado pode ver todos
      (utp_viewer.perfil_territorio = 'estado_nsdigi')
    )
    WHERE utp_viewer.user_id = auth.uid() AND utp_target.user_id = profiles.id
  )
);

-- 6. Função para obter perfil público (sem dados sensíveis)
CREATE OR REPLACE FUNCTION public.get_profile_public(profile_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  municipality TEXT,
  avatar_url TEXT,
  job_title TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.municipality,
    p.avatar_url,
    p.job_title
  FROM profiles p
  WHERE p.id = profile_id;
$$;

-- 7. Função para verificar se pode ver dados privados
CREATE OR REPLACE FUNCTION public.can_view_private_profile(viewer_id UUID, target_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  viewer_territory user_territory_profiles%ROWTYPE;
  target_territory user_territory_profiles%ROWTYPE;
BEGIN
  -- Próprio usuário sempre pode ver
  IF viewer_id = target_id THEN
    RETURN TRUE;
  END IF;

  -- Admin pode ver todos
  IF has_role(viewer_id, 'admin'::app_role) THEN
    -- Registrar na auditoria
    INSERT INTO audit_log (user_id, operation, entity_type, entity_id)
    VALUES (viewer_id, 'view_private_profile', 'profile', target_id);
    RETURN TRUE;
  END IF;

  -- Buscar perfis territoriais
  SELECT * INTO viewer_territory FROM user_territory_profiles WHERE user_id = viewer_id;
  SELECT * INTO target_territory FROM user_territory_profiles WHERE user_id = target_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Verificar por perfil territorial
  CASE viewer_territory.perfil_territorio
    WHEN 'estado_nsdigi' THEN
      -- Registrar na auditoria
      INSERT INTO audit_log (user_id, operation, entity_type, entity_id, microregiao, urs, grs)
      VALUES (viewer_id, 'view_private_profile', 'profile', target_id, 
              target_territory.microregiao, target_territory.urs, target_territory.grs);
      RETURN TRUE;
    WHEN 'grs' THEN
      IF viewer_territory.urs = target_territory.urs THEN
        INSERT INTO audit_log (user_id, operation, entity_type, entity_id, urs)
        VALUES (viewer_id, 'view_private_profile', 'profile', target_id, target_territory.urs);
        RETURN TRUE;
      END IF;
    WHEN 'nsd_microrregional' THEN
      IF viewer_territory.microregiao = target_territory.microregiao THEN
        INSERT INTO audit_log (user_id, operation, entity_type, entity_id, microregiao)
        VALUES (viewer_id, 'view_private_profile', 'profile', target_id, target_territory.microregiao);
        RETURN TRUE;
      END IF;
    WHEN 'municipal' THEN
      -- Municipal só vê dados públicos de outros
      RETURN FALSE;
    ELSE
      RETURN FALSE;
  END CASE;

  RETURN FALSE;
END;
$$;

-- 8. Função segura para buscar perfil (retorna dados conforme permissão)
CREATE OR REPLACE FUNCTION public.get_profile_safe(target_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  viewer_id UUID;
BEGIN
  viewer_id := auth.uid();
  
  IF can_view_private_profile(viewer_id, target_id) THEN
    -- Retorna perfil completo (privado)
    SELECT json_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'municipality', p.municipality,
      'avatar_url', p.avatar_url,
      'job_title', p.job_title,
      'phone', p.phone,
      'created_at', p.created_at,
      'updated_at', p.updated_at,
      '_access_level', 'private'
    ) INTO result
    FROM profiles p
    WHERE p.id = target_id;
  ELSE
    -- Retorna apenas dados públicos
    SELECT json_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'municipality', p.municipality,
      'avatar_url', p.avatar_url,
      'job_title', p.job_title,
      '_access_level', 'public'
    ) INTO result
    FROM profiles p
    WHERE p.id = target_id;
  END IF;

  RETURN result;
END;
$$;

-- 9. Função para listar perfis de forma segura (apenas dados públicos em listagens)
CREATE OR REPLACE FUNCTION public.list_profiles_public(
  search_term TEXT DEFAULT NULL,
  limit_count INT DEFAULT 50,
  offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  municipality TEXT,
  avatar_url TEXT,
  job_title TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.municipality,
    p.avatar_url,
    p.job_title
  FROM profiles p
  WHERE 
    search_term IS NULL OR 
    p.full_name ILIKE '%' || search_term || '%' OR
    p.municipality ILIKE '%' || search_term || '%'
  ORDER BY p.full_name
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- 10. Atualizar políticas de municipios para ocultar dados de coordenador
-- Criar view pública para municípios (sem dados de contato do coordenador)
CREATE VIEW public.municipios_public
WITH (security_invoker = on) AS
SELECT 
  id,
  municipio,
  cod_ibge,
  macrorregiao,
  cod_macro,
  microregiao,
  cod_micro,
  urs,
  grs,
  status,
  populacao,
  profissionais,
  maturidade_digital,
  created_at,
  updated_at
  -- Exclui: coordenador_nome, coordenador_email, coordenador_telefone
FROM public.municipios;

-- 11. Criar função para buscar município com dados de coordenador (apenas para autorizados)
CREATE OR REPLACE FUNCTION public.get_municipio_full(municipio_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  viewer_id UUID;
  can_see_coordinator BOOLEAN := FALSE;
BEGIN
  viewer_id := auth.uid();
  
  -- Admin e coordenador podem ver dados do coordenador
  IF has_role(viewer_id, 'admin'::app_role) OR has_role(viewer_id, 'coordenador'::app_role) THEN
    can_see_coordinator := TRUE;
  END IF;

  IF can_see_coordinator THEN
    SELECT json_build_object(
      'id', m.id,
      'municipio', m.municipio,
      'cod_ibge', m.cod_ibge,
      'macrorregiao', m.macrorregiao,
      'cod_macro', m.cod_macro,
      'microregiao', m.microregiao,
      'cod_micro', m.cod_micro,
      'urs', m.urs,
      'grs', m.grs,
      'status', m.status,
      'coordenador_nome', m.coordenador_nome,
      'coordenador_email', m.coordenador_email,
      'coordenador_telefone', m.coordenador_telefone,
      'populacao', m.populacao,
      'profissionais', m.profissionais,
      'maturidade_digital', m.maturidade_digital
    ) INTO result
    FROM municipios m
    WHERE m.id = municipio_id;
  ELSE
    SELECT json_build_object(
      'id', m.id,
      'municipio', m.municipio,
      'cod_ibge', m.cod_ibge,
      'macrorregiao', m.macrorregiao,
      'cod_macro', m.cod_macro,
      'microregiao', m.microregiao,
      'cod_micro', m.cod_micro,
      'urs', m.urs,
      'grs', m.grs,
      'status', m.status,
      'populacao', m.populacao,
      'profissionais', m.profissionais,
      'maturidade_digital', m.maturidade_digital
    ) INTO result
    FROM municipios m
    WHERE m.id = municipio_id;
  END IF;

  RETURN result;
END;
$$;