-- =============================================
-- CORREÇÃO FINAL DE SEGURANÇA - CAMADA ADICIONAL
-- =============================================

-- 1. Remover qualquer política antiga de profiles que possa estar expondo dados
DROP POLICY IF EXISTS "Coordinators can view regional profiles" ON public.profiles;

-- 2. Criar política mais restritiva: usuários só veem próprio perfil completo
-- Para ver outros perfis, devem usar a função segura get_profile_safe
CREATE POLICY "Restricted profile access via functions only"
ON public.profiles FOR SELECT
USING (
  -- Próprio usuário sempre pode ver seu perfil
  auth.uid() = id
  -- Admin pode ver todos
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Para municipios, criar política que esconde dados de coordenador
-- A abordagem aqui será restringir o SELECT apenas para users autenticados
-- E exigir uso da função list_municipios_safe para listagens públicas

-- Remover política antiga
DROP POLICY IF EXISTS "Authenticated users can view municipalities" ON public.municipios;

-- Criar política que bloqueia SELECT direto (força uso de RPC)
-- Exceto para admins e coordenadores que podem ver dados completos
CREATE POLICY "Only admins see full municipality data"
ON public.municipios FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'coordenador'::app_role)
);

-- 4. Garantir que funções RPC seguras funcionem como esperado
-- Recriar a função com SECURITY DEFINER para bypassar RLS
CREATE OR REPLACE FUNCTION public.list_municipios_safe(
  search_term TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  microregiao_filter TEXT DEFAULT NULL,
  urs_filter TEXT DEFAULT NULL,
  macrorregiao_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  municipio TEXT,
  cod_ibge TEXT,
  macrorregiao TEXT,
  cod_macro TEXT,
  microregiao TEXT,
  cod_micro TEXT,
  urs TEXT,
  grs TEXT,
  status public.municipio_status,
  populacao INT,
  profissionais INT,
  maturidade_digital INT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER -- Bypassa RLS
SET search_path = public
AS $$
BEGIN
  -- Verifica se usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT 
    m.id,
    m.municipio,
    m.cod_ibge,
    m.macrorregiao,
    m.cod_macro,
    m.microregiao,
    m.cod_micro,
    m.urs,
    m.grs,
    m.status,
    m.populacao,
    m.profissionais,
    m.maturidade_digital,
    m.created_at,
    m.updated_at
    -- NUNCA retorna: coordenador_nome, coordenador_email, coordenador_telefone
  FROM municipios m
  WHERE 
    (search_term IS NULL OR m.municipio ILIKE '%' || search_term || '%' OR m.cod_ibge ILIKE '%' || search_term || '%')
    AND (status_filter IS NULL OR status_filter = 'all' OR m.status::TEXT = status_filter)
    AND (microregiao_filter IS NULL OR m.microregiao = microregiao_filter)
    AND (urs_filter IS NULL OR m.urs = urs_filter)
    AND (macrorregiao_filter IS NULL OR m.macrorregiao = macrorregiao_filter)
  ORDER BY m.municipio;
END;
$$;

-- 5. Atualizar função get_profile_safe para ser mais segura
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
  can_view_private BOOLEAN := FALSE;
  viewer_territory user_territory_profiles%ROWTYPE;
  target_territory user_territory_profiles%ROWTYPE;
BEGIN
  viewer_id := auth.uid();
  
  IF viewer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Próprio usuário sempre pode ver tudo
  IF viewer_id = target_id THEN
    can_view_private := TRUE;
  -- Admin pode ver todos
  ELSIF has_role(viewer_id, 'admin'::app_role) THEN
    can_view_private := TRUE;
    -- Registrar na auditoria
    INSERT INTO audit_log (user_id, operation, entity_type, entity_id)
    VALUES (viewer_id, 'view_private_profile', 'profile', target_id);
  ELSE
    -- Verificar perfil territorial
    SELECT * INTO viewer_territory FROM user_territory_profiles WHERE user_id = viewer_id;
    SELECT * INTO target_territory FROM user_territory_profiles WHERE user_id = target_id;
    
    IF viewer_territory.perfil_territorio = 'estado_nsdigi' THEN
      can_view_private := TRUE;
      INSERT INTO audit_log (user_id, operation, entity_type, entity_id, microregiao, urs, grs)
      VALUES (viewer_id, 'view_private_profile', 'profile', target_id, 
              target_territory.microregiao, target_territory.urs, target_territory.grs);
    ELSIF viewer_territory.perfil_territorio = 'grs' AND viewer_territory.urs = target_territory.urs THEN
      can_view_private := TRUE;
      INSERT INTO audit_log (user_id, operation, entity_type, entity_id, urs)
      VALUES (viewer_id, 'view_private_profile', 'profile', target_id, target_territory.urs);
    ELSIF viewer_territory.perfil_territorio = 'nsd_microrregional' AND viewer_territory.microregiao = target_territory.microregiao THEN
      can_view_private := TRUE;
      INSERT INTO audit_log (user_id, operation, entity_type, entity_id, microregiao)
      VALUES (viewer_id, 'view_private_profile', 'profile', target_id, target_territory.microregiao);
    END IF;
  END IF;

  IF can_view_private THEN
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
    -- Retorna apenas dados públicos (sem telefone)
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

-- 6. Criar função segura para listar perfis (apenas dados públicos)
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
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.municipality,
    p.avatar_url,
    p.job_title
    -- NUNCA retorna: phone
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