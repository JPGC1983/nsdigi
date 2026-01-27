
-- =============================================
-- CORREÇÃO COMPLETA DE SEGURANÇA E RLS
-- Auditoria de 27/01/2026
-- =============================================

-- =============================================
-- 1. HABILITAR RLS NAS VIEWS PÚBLICAS
-- =============================================

-- As views com security_invoker=on herdam RLS das tabelas base
-- Mas precisamos garantir que existam políticas adequadas

-- Recriar view profiles_public com estrutura correta
DROP VIEW IF EXISTS public.profiles_public;

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
-- Esta view NUNCA inclui: phone, updated_at

COMMENT ON VIEW public.profiles_public IS 'View pública de perfis - exclui dados sensíveis como telefone';

-- Recriar view municipios_public com estrutura correta
DROP VIEW IF EXISTS public.municipios_public;

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
FROM public.municipios;
-- Esta view NUNCA inclui: coordenador_nome, coordenador_email, coordenador_telefone

COMMENT ON VIEW public.municipios_public IS 'View pública de municípios - exclui dados de coordenador';

-- =============================================
-- 2. CORRIGIR POLÍTICAS DE MUNICIPIOS
-- Coordenadores só devem ver municípios de sua região
-- =============================================

DROP POLICY IF EXISTS "Only admins see full municipality data" ON public.municipios;
DROP POLICY IF EXISTS "Admins and coordinators can update municipalities" ON public.municipios;

-- SELECT: Admin vê tudo, Coordenador vê apenas sua região territorial
CREATE POLICY "Territory-based municipality access"
ON public.municipios FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'coordenador'::app_role)
    AND check_territory_access(auth.uid(), id, microregiao, urs)
  )
);

-- UPDATE: Admin pode atualizar tudo, Coordenador apenas sua região
CREATE POLICY "Territory-based municipality update"
ON public.municipios FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'coordenador'::app_role)
    AND check_territory_access(auth.uid(), id, microregiao, urs)
  )
);

-- =============================================
-- 3. FUNÇÃO MELHORADA get_municipio_full COM AUDITORIA
-- =============================================

CREATE OR REPLACE FUNCTION public.get_municipio_full(municipio_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result JSON;
  viewer_id UUID;
  can_see_coordinator BOOLEAN := FALSE;
  viewer_territory user_territory_profiles%ROWTYPE;
  mun_record municipios%ROWTYPE;
BEGIN
  viewer_id := auth.uid();
  
  IF viewer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Buscar dados do município
  SELECT * INTO mun_record FROM municipios WHERE id = municipio_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Admin sempre vê tudo
  IF has_role(viewer_id, 'admin'::app_role) THEN
    can_see_coordinator := TRUE;
    -- Registrar na auditoria
    INSERT INTO audit_log (user_id, operation, entity_type, entity_id, municipio_id, microregiao, urs, grs)
    VALUES (viewer_id, 'view_municipio_full', 'municipio', municipio_id, municipio_id, 
            mun_record.microregiao, mun_record.urs, mun_record.grs);
  ELSIF has_role(viewer_id, 'coordenador'::app_role) THEN
    -- Coordenador só vê se tiver acesso territorial
    SELECT * INTO viewer_territory FROM user_territory_profiles WHERE user_id = viewer_id;
    
    IF viewer_territory.perfil_territorio = 'estado_nsdigi' THEN
      can_see_coordinator := TRUE;
      INSERT INTO audit_log (user_id, operation, entity_type, entity_id, municipio_id, microregiao, urs, grs)
      VALUES (viewer_id, 'view_municipio_full', 'municipio', municipio_id, municipio_id, 
              mun_record.microregiao, mun_record.urs, mun_record.grs);
    ELSIF viewer_territory.perfil_territorio = 'grs' AND viewer_territory.urs = mun_record.urs THEN
      can_see_coordinator := TRUE;
      INSERT INTO audit_log (user_id, operation, entity_type, entity_id, municipio_id, urs)
      VALUES (viewer_id, 'view_municipio_full', 'municipio', municipio_id, municipio_id, mun_record.urs);
    ELSIF viewer_territory.perfil_territorio = 'nsd_microrregional' AND viewer_territory.microregiao = mun_record.microregiao THEN
      can_see_coordinator := TRUE;
      INSERT INTO audit_log (user_id, operation, entity_type, entity_id, municipio_id, microregiao)
      VALUES (viewer_id, 'view_municipio_full', 'municipio', municipio_id, municipio_id, mun_record.microregiao);
    END IF;
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
      'maturidade_digital', m.maturidade_digital,
      '_access_level', 'full'
    ) INTO result
    FROM municipios m
    WHERE m.id = municipio_id;
  ELSE
    -- Retorna apenas dados públicos
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
      'maturidade_digital', m.maturidade_digital,
      '_access_level', 'public'
    ) INTO result
    FROM municipios m
    WHERE m.id = municipio_id;
  END IF;

  RETURN result;
END;
$function$;

-- =============================================
-- 4. FUNÇÃO list_municipios_safe COM ACESSO TERRITORIAL
-- =============================================

CREATE OR REPLACE FUNCTION public.list_municipios_safe(
  search_term text DEFAULT NULL,
  status_filter text DEFAULT NULL,
  microregiao_filter text DEFAULT NULL,
  urs_filter text DEFAULT NULL,
  macrorregiao_filter text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  municipio text,
  cod_ibge text,
  macrorregiao text,
  cod_macro text,
  microregiao text,
  cod_micro text,
  urs text,
  grs text,
  status municipio_status,
  populacao integer,
  profissionais integer,
  maturidade_digital integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  viewer_id UUID;
  viewer_territory user_territory_profiles%ROWTYPE;
BEGIN
  viewer_id := auth.uid();
  
  IF viewer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Buscar perfil territorial do viewer
  SELECT * INTO viewer_territory FROM user_territory_profiles WHERE user_id = viewer_id;

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
  FROM municipios m
  WHERE 
    -- Filtros de busca
    (search_term IS NULL OR m.municipio ILIKE '%' || search_term || '%' OR m.cod_ibge ILIKE '%' || search_term || '%')
    AND (status_filter IS NULL OR status_filter = 'all' OR m.status::TEXT = status_filter)
    AND (microregiao_filter IS NULL OR m.microregiao = microregiao_filter)
    AND (urs_filter IS NULL OR m.urs = urs_filter)
    AND (macrorregiao_filter IS NULL OR m.macrorregiao = macrorregiao_filter)
    -- Restrição territorial (se não for admin/estado)
    AND (
      has_role(viewer_id, 'admin'::app_role)
      OR viewer_territory.perfil_territorio = 'estado_nsdigi'
      OR viewer_territory.perfil_territorio IS NULL -- Usuário sem perfil vê todos (sem dados sensíveis)
      OR (viewer_territory.perfil_territorio = 'grs' AND m.urs = viewer_territory.urs)
      OR (viewer_territory.perfil_territorio = 'nsd_microrregional' AND m.microregiao = viewer_territory.microregiao)
      OR (viewer_territory.perfil_territorio = 'municipal' AND m.id = viewer_territory.municipio_id)
    )
  ORDER BY m.municipio;
END;
$function$;

-- =============================================
-- 5. FUNÇÃO list_profiles_public COM DADOS MÍNIMOS
-- =============================================

CREATE OR REPLACE FUNCTION public.list_profiles_public(
  search_term text DEFAULT NULL,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  full_name text,
  municipality text,
  avatar_url text,
  job_title text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
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
    -- NUNCA retorna: phone, created_at, updated_at
  FROM profiles p
  WHERE 
    search_term IS NULL 
    OR p.full_name ILIKE '%' || search_term || '%'
    OR p.municipality ILIKE '%' || search_term || '%'
  ORDER BY p.full_name
  LIMIT limit_count
  OFFSET offset_count;
END;
$function$;

-- =============================================
-- 6. CORRIGIR can_view_private_profile
-- =============================================

CREATE OR REPLACE FUNCTION public.can_view_private_profile(viewer_id uuid, target_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  viewer_territory user_territory_profiles%ROWTYPE;
  target_territory user_territory_profiles%ROWTYPE;
BEGIN
  -- Próprio usuário
  IF viewer_id = target_id THEN
    RETURN TRUE;
  END IF;
  
  -- Admin
  IF has_role(viewer_id, 'admin'::app_role) THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar perfis territoriais
  SELECT * INTO viewer_territory FROM user_territory_profiles WHERE user_id = viewer_id;
  SELECT * INTO target_territory FROM user_territory_profiles WHERE user_id = target_id;
  
  -- Sem perfil territorial, não pode ver dados privados de outros
  IF NOT FOUND OR viewer_territory IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Estado vê todos
  IF viewer_territory.perfil_territorio = 'estado_nsdigi' THEN
    RETURN TRUE;
  END IF;
  
  -- GRS vê sua URS
  IF viewer_territory.perfil_territorio = 'grs' AND viewer_territory.urs = target_territory.urs THEN
    RETURN TRUE;
  END IF;
  
  -- NSD Microrregional vê sua microrregião
  IF viewer_territory.perfil_territorio = 'nsd_microrregional' AND viewer_territory.microregiao = target_territory.microregiao THEN
    RETURN TRUE;
  END IF;
  
  -- Municipal só vê próprio município
  IF viewer_territory.perfil_territorio = 'municipal' AND viewer_territory.municipio_id = target_territory.municipio_id THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;

-- =============================================
-- 7. ÍNDICES PARA PERFORMANCE DE CONSULTAS TERRITORIAIS
-- =============================================

CREATE INDEX IF NOT EXISTS idx_municipios_microregiao ON public.municipios(microregiao);
CREATE INDEX IF NOT EXISTS idx_municipios_urs ON public.municipios(urs);
CREATE INDEX IF NOT EXISTS idx_municipios_grs ON public.municipios(grs);
CREATE INDEX IF NOT EXISTS idx_municipios_status ON public.municipios(status);
CREATE INDEX IF NOT EXISTS idx_user_territory_profiles_user_id ON public.user_territory_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_territory_profiles_microregiao ON public.user_territory_profiles(microregiao);
CREATE INDEX IF NOT EXISTS idx_user_territory_profiles_urs ON public.user_territory_profiles(urs);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_type_id ON public.audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- =============================================
-- 8. GARANTIR UNIQUE EM cod_ibge
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'municipios_cod_ibge_key'
  ) THEN
    ALTER TABLE public.municipios ADD CONSTRAINT municipios_cod_ibge_key UNIQUE (cod_ibge);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
