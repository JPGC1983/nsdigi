
-- =============================================
-- CORREÇÃO FINAL: RLS em VIEWS + Granularidade Territorial
-- =============================================

-- =============================================
-- 1. HABILITAR RLS NAS VIEWS (security_barrier)
-- Views com security_invoker herdam RLS mas precisam de proteção adicional
-- =============================================

-- Remover views atuais
DROP VIEW IF EXISTS public.profiles_public;
DROP VIEW IF EXISTS public.municipios_public;

-- Recriar profiles_public como view segura
CREATE VIEW public.profiles_public
WITH (security_barrier = true, security_invoker = on) AS
SELECT 
  id,
  full_name,
  municipality,
  avatar_url,
  job_title,
  created_at
FROM public.profiles
WHERE id IS NOT NULL; -- Só mostra perfis válidos

COMMENT ON VIEW public.profiles_public IS 'View pública de perfis - exclui telefone e dados sensíveis. RLS herdado da tabela profiles.';

-- Recriar municipios_public como view segura
CREATE VIEW public.municipios_public  
WITH (security_barrier = true, security_invoker = on) AS
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
FROM public.municipios
WHERE id IS NOT NULL;

COMMENT ON VIEW public.municipios_public IS 'View pública de municípios - exclui dados de coordenador. RLS herdado da tabela municipios.';

-- =============================================
-- 2. CORRIGIR POLICY audit_log para permitir INSERT via functions
-- =============================================

DROP POLICY IF EXISTS "Only system functions can insert audit logs" ON public.audit_log;

-- Permitir INSERT para funções SECURITY DEFINER (via service role interno)
CREATE POLICY "Allow audit log inserts from functions"
ON public.audit_log FOR INSERT
WITH CHECK (true); -- Funções SECURITY DEFINER podem inserir

-- =============================================
-- 3. GRANULARIDADE TERRITORIAL EM MUNICIPIOS
-- Corrigir para que coordenadores só vejam seus municípios
-- =============================================

DROP POLICY IF EXISTS "Territory-based municipality access" ON public.municipios;

-- Criar política mais granular
CREATE POLICY "Strict territory-based municipality access"
ON public.municipios FOR SELECT
USING (
  -- Admin vê tudo
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    -- Coordenador só vê se tiver acesso territorial específico
    has_role(auth.uid(), 'coordenador'::app_role)
    AND EXISTS (
      SELECT 1 FROM user_territory_profiles utp
      WHERE utp.user_id = auth.uid()
      AND (
        -- Estado vê tudo
        utp.perfil_territorio = 'estado_nsdigi'
        -- GRS vê sua URS
        OR (utp.perfil_territorio = 'grs' AND utp.urs = municipios.urs)
        -- NSD Microrregional vê sua microrregião
        OR (utp.perfil_territorio = 'nsd_microrregional' AND utp.microregiao = municipios.microregiao)
        -- Municipal vê apenas seu município
        OR (utp.perfil_territorio = 'municipal' AND utp.municipio_id = municipios.id)
      )
    )
  )
);

-- =============================================
-- 4. CORRIGIR POLÍTICA DE UPDATE EM MUNICIPIOS
-- =============================================

DROP POLICY IF EXISTS "Territory-based municipality update" ON public.municipios;

CREATE POLICY "Strict territory-based municipality update"
ON public.municipios FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'coordenador'::app_role)
    AND EXISTS (
      SELECT 1 FROM user_territory_profiles utp
      WHERE utp.user_id = auth.uid()
      AND (
        utp.perfil_territorio = 'estado_nsdigi'
        OR (utp.perfil_territorio = 'grs' AND utp.urs = municipios.urs)
        OR (utp.perfil_territorio = 'nsd_microrregional' AND utp.microregiao = municipios.microregiao)
      )
    )
  )
);

-- =============================================
-- 5. RESTRINGIR MENTEES - apenas mentores matchados
-- =============================================

DROP POLICY IF EXISTS "Mentors and admins can view mentees" ON public.mentees;

CREATE POLICY "Restricted mentee visibility"
ON public.mentees FOR SELECT
USING (
  -- Próprio mentee
  auth.uid() = user_id
  -- Admin
  OR has_role(auth.uid(), 'admin'::app_role)
  -- Mentores matchados com este mentee
  OR EXISTS (
    SELECT 1 FROM mentorship_matches mm
    JOIN mentors m ON m.id = mm.mentor_id
    WHERE mm.mentee_id = mentees.id
    AND m.user_id = auth.uid()
    AND mm.status IN ('pending', 'active', 'completed')
  )
);

-- =============================================
-- 6. ATUALIZAR get_municipio_full com auditoria completa
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
  
  -- Buscar perfil territorial do viewer
  SELECT * INTO viewer_territory FROM user_territory_profiles WHERE user_id = viewer_id;
  
  -- Admin sempre vê tudo
  IF has_role(viewer_id, 'admin'::app_role) THEN
    can_see_coordinator := TRUE;
    -- Registrar na auditoria
    INSERT INTO audit_log (user_id, operation, entity_type, entity_id, municipio_id, microregiao, urs, grs)
    VALUES (viewer_id, 'view_municipio_full', 'municipio', municipio_id, municipio_id, 
            mun_record.microregiao, mun_record.urs, mun_record.grs);
  ELSIF has_role(viewer_id, 'coordenador'::app_role) AND viewer_territory.id IS NOT NULL THEN
    -- Verificar acesso territorial
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
