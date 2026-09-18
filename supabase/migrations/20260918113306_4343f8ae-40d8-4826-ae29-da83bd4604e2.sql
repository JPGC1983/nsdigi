-- =========================================================
-- 1. SEGURANÇA: fechar leituras públicas
-- =========================================================
DROP POLICY IF EXISTS "Anyone can view active nucleos" ON public.nucleos_microrregionais;
CREATE POLICY "Authenticated users can view active nucleos"
  ON public.nucleos_microrregionais FOR SELECT TO authenticated
  USING (is_active = true);

REVOKE SELECT ON public.nucleos_microrregionais FROM anon;
REVOKE SELECT ON public.courses FROM anon;
REVOKE SELECT ON public.trails FROM anon;
REVOKE SELECT ON public.cib_meetings FROM anon;

-- audit_log: sem forja de registros
DROP POLICY IF EXISTS "Allow audit log inserts from functions" ON public.audit_log;
CREATE POLICY "Users can only log their own actions"
  ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
GRANT ALL ON public.audit_log TO service_role;

-- storage: documentos de governança deixam de ser públicos
DROP POLICY IF EXISTS "Anyone can view governance documents files" ON storage.objects;
CREATE POLICY "Authenticated users can view governance document files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'governance-documents');

-- funções internas não executáveis por visitantes
REVOKE EXECUTE ON FUNCTION public.can_view_private_profile(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_territory_access(uuid, uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_municipio_full(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_municipios_filter_options() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_profile_public(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_profile_safe(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_nmsd(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_mentor_of_mentee(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_municipios_safe(text, text, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_nmsd_members(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_profiles_public(text, integer, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_audit(text, text, uuid, jsonb, jsonb, uuid, text, text, text) FROM anon;

-- =========================================================
-- 2. ESCOPO DE CONTEÚDO
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.content_scope AS ENUM ('global','regional','microrregional','municipal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS escopo public.content_scope NOT NULL DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS urs text,
  ADD COLUMN IF NOT EXISTS microregiao text,
  ADD COLUMN IF NOT EXISTS municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS expira_em timestamptz;

ALTER TABLE public.trails
  ADD COLUMN IF NOT EXISTS escopo public.content_scope NOT NULL DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS urs text,
  ADD COLUMN IF NOT EXISTS microregiao text,
  ADD COLUMN IF NOT EXISTS municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS expira_em timestamptz;

ALTER TABLE public.cib_meetings
  ADD COLUMN IF NOT EXISTS escopo public.content_scope NOT NULL DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS urs text,
  ADD COLUMN IF NOT EXISTS microregiao text,
  ADD COLUMN IF NOT EXISTS municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS expira_em timestamptz;

ALTER TABLE public.governance_documents
  ADD COLUMN IF NOT EXISTS escopo public.content_scope NOT NULL DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS urs text,
  ADD COLUMN IF NOT EXISTS microregiao text,
  ADD COLUMN IF NOT EXISTS municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS expira_em timestamptz;

-- coerência escopo x território (trigger, não CHECK)
CREATE OR REPLACE FUNCTION public.validate_content_scope()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.escopo = 'global' THEN
    NEW.urs := NULL; NEW.microregiao := NULL; NEW.municipio_id := NULL;
  ELSIF NEW.escopo = 'regional' THEN
    IF NEW.urs IS NULL THEN RAISE EXCEPTION 'Alcance regional exige URS'; END IF;
    NEW.microregiao := NULL; NEW.municipio_id := NULL;
  ELSIF NEW.escopo = 'microrregional' THEN
    IF NEW.microregiao IS NULL THEN RAISE EXCEPTION 'Alcance microrregional exige microrregião'; END IF;
    SELECT n.urs INTO NEW.urs FROM nucleos_microrregionais n WHERE n.microregiao = NEW.microregiao LIMIT 1;
    NEW.municipio_id := NULL;
  ELSIF NEW.escopo = 'municipal' THEN
    IF NEW.municipio_id IS NULL THEN RAISE EXCEPTION 'Alcance municipal exige município'; END IF;
    SELECT m.microregiao, m.urs INTO NEW.microregiao, NEW.urs FROM municipios m WHERE m.id = NEW.municipio_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_scope_courses ON public.courses;
CREATE TRIGGER validate_scope_courses BEFORE INSERT OR UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.validate_content_scope();
DROP TRIGGER IF EXISTS validate_scope_trails ON public.trails;
CREATE TRIGGER validate_scope_trails BEFORE INSERT OR UPDATE ON public.trails
  FOR EACH ROW EXECUTE FUNCTION public.validate_content_scope();
DROP TRIGGER IF EXISTS validate_scope_cib ON public.cib_meetings;
CREATE TRIGGER validate_scope_cib BEFORE INSERT OR UPDATE ON public.cib_meetings
  FOR EACH ROW EXECUTE FUNCTION public.validate_content_scope();
DROP TRIGGER IF EXISTS validate_scope_docs ON public.governance_documents;
CREATE TRIGGER validate_scope_docs BEFORE INSERT OR UPDATE ON public.governance_documents
  FOR EACH ROW EXECUTE FUNCTION public.validate_content_scope();

-- =========================================================
-- 3. REGRA ÚNICA DE ALCANCE (visibilidade)
-- =========================================================
CREATE OR REPLACE FUNCTION public.user_reaches_content(
  _escopo public.content_scope,
  _urs text,
  _microregiao text,
  _municipio_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  t user_territory_profiles%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RETURN FALSE; END IF;
  IF has_role(uid, 'admin'::app_role) THEN RETURN TRUE; END IF;
  IF _escopo = 'global' THEN RETURN TRUE; END IF;

  SELECT * INTO t FROM user_territory_profiles WHERE user_id = uid;
  IF NOT FOUND THEN RETURN FALSE; END IF;               -- nega por padrão
  IF t.perfil_territorio = 'estado_nsdigi' THEN RETURN TRUE; END IF;

  IF _escopo = 'regional' THEN
    RETURN t.urs IS NOT NULL AND t.urs = _urs;
  ELSIF _escopo = 'microrregional' THEN
    RETURN (t.microregiao IS NOT NULL AND t.microregiao = _microregiao)
        OR (t.perfil_territorio = 'grs' AND t.urs IS NOT NULL AND t.urs = _urs);
  ELSIF _escopo = 'municipal' THEN
    RETURN (t.municipio_id IS NOT NULL AND t.municipio_id = _municipio_id)
        OR (t.perfil_territorio IN ('nsd_microrregional') AND t.microregiao = _microregiao)
        OR (t.perfil_territorio = 'grs' AND t.urs = _urs);
  END IF;
  RETURN FALSE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.user_reaches_content(public.content_scope, text, text, uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_reaches_content(public.content_scope, text, text, uuid) TO authenticated, service_role;

-- =========================================================
-- 4. REGRA DE AÇÃO (criar / editar / arquivar), separada da visibilidade
-- =========================================================
CREATE OR REPLACE FUNCTION public.user_can_manage_content(
  _escopo public.content_scope,
  _urs text,
  _microregiao text,
  _municipio_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  t user_territory_profiles%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RETURN FALSE; END IF;
  IF has_role(uid, 'admin'::app_role) THEN RETURN TRUE; END IF;
  IF NOT has_role(uid, 'coordenador'::app_role) THEN RETURN FALSE; END IF;

  SELECT * INTO t FROM user_territory_profiles WHERE user_id = uid;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF t.perfil_territorio = 'estado_nsdigi' THEN RETURN TRUE; END IF;

  -- coordenação só publica dentro do próprio território ou abaixo dele
  IF t.perfil_territorio = 'grs' THEN
    RETURN _escopo <> 'global' AND t.urs IS NOT NULL AND t.urs = _urs;
  ELSIF t.perfil_territorio = 'nsd_microrregional' THEN
    RETURN _escopo IN ('microrregional','municipal') AND t.microregiao IS NOT NULL AND t.microregiao = _microregiao;
  ELSIF t.perfil_territorio = 'municipal' THEN
    RETURN _escopo = 'municipal' AND t.municipio_id IS NOT NULL AND t.municipio_id = _municipio_id;
  END IF;
  RETURN FALSE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.user_can_manage_content(public.content_scope, text, text, uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_can_manage_content(public.content_scope, text, text, uuid) TO authenticated, service_role;

-- =========================================================
-- 5. POLÍTICAS POR ESCOPO
-- =========================================================
-- courses
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Admins and coordinators can create courses" ON public.courses;
DROP POLICY IF EXISTS "Admins and coordinators can update courses" ON public.courses;
CREATE POLICY "Courses visible within territory" ON public.courses FOR SELECT TO authenticated
  USING (public.user_reaches_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Coordinators create courses in their territory" ON public.courses FOR INSERT TO authenticated
  WITH CHECK (public.user_can_manage_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Coordinators update courses in their territory" ON public.courses FOR UPDATE TO authenticated
  USING (public.user_can_manage_content(escopo, urs, microregiao, municipio_id))
  WITH CHECK (public.user_can_manage_content(escopo, urs, microregiao, municipio_id));

-- trails
DROP POLICY IF EXISTS "Anyone can view trails" ON public.trails;
DROP POLICY IF EXISTS "Admins and coordinators can create trails" ON public.trails;
DROP POLICY IF EXISTS "Admins and coordinators can update trails" ON public.trails;
CREATE POLICY "Trails visible within territory" ON public.trails FOR SELECT TO authenticated
  USING (public.user_reaches_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Coordinators create trails in their territory" ON public.trails FOR INSERT TO authenticated
  WITH CHECK (public.user_can_manage_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Coordinators update trails in their territory" ON public.trails FOR UPDATE TO authenticated
  USING (public.user_can_manage_content(escopo, urs, microregiao, municipio_id))
  WITH CHECK (public.user_can_manage_content(escopo, urs, microregiao, municipio_id));

-- cib_meetings
DROP POLICY IF EXISTS "Anyone can view CIB meetings" ON public.cib_meetings;
DROP POLICY IF EXISTS "Admins and coordinators can insert CIB meetings" ON public.cib_meetings;
DROP POLICY IF EXISTS "Admins and coordinators can update CIB meetings" ON public.cib_meetings;
CREATE POLICY "CIB meetings visible within territory" ON public.cib_meetings FOR SELECT TO authenticated
  USING (public.user_reaches_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Coordinators create CIB meetings in their territory" ON public.cib_meetings FOR INSERT TO authenticated
  WITH CHECK (public.user_can_manage_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Coordinators update CIB meetings in their territory" ON public.cib_meetings FOR UPDATE TO authenticated
  USING (public.user_can_manage_content(escopo, urs, microregiao, municipio_id))
  WITH CHECK (public.user_can_manage_content(escopo, urs, microregiao, municipio_id));

-- governance_documents
DROP POLICY IF EXISTS "Authenticated users can view governance documents" ON public.governance_documents;
DROP POLICY IF EXISTS "Admin and coordenador can insert governance documents" ON public.governance_documents;
CREATE POLICY "Documents visible within territory" ON public.governance_documents FOR SELECT TO authenticated
  USING (public.user_reaches_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Coordinators upload documents in their territory" ON public.governance_documents FOR INSERT TO authenticated
  WITH CHECK (public.user_can_manage_content(escopo, urs, microregiao, municipio_id));

-- índices de apoio
CREATE INDEX IF NOT EXISTS idx_courses_escopo ON public.courses(escopo, urs, microregiao, municipio_id);
CREATE INDEX IF NOT EXISTS idx_trails_escopo ON public.trails(escopo, urs, microregiao, municipio_id);
CREATE INDEX IF NOT EXISTS idx_cib_escopo ON public.cib_meetings(escopo, urs, microregiao, municipio_id);
CREATE INDEX IF NOT EXISTS idx_docs_escopo ON public.governance_documents(escopo, urs, microregiao, municipio_id);