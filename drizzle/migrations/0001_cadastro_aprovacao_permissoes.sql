-- 1. Perfis: novos campos de cadastro e status de aprovação
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS cbo text,
  ADD COLUMN IF NOT EXISTS cnes text,
  ADD COLUMN IF NOT EXISTS municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS aceite_termos_em timestamptz,
  ADD COLUMN IF NOT EXISTS revisado_por uuid,
  ADD COLUMN IF NOT EXISTS revisado_em timestamptz,
  ADD COLUMN IF NOT EXISTS motivo_recusa text;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check CHECK (status IN ('pendente','ativo','inativo'));

-- Usuários que já usavam a plataforma continuam ativos
UPDATE public.profiles p
   SET status = 'ativo', email = COALESCE(p.email, u.email)
  FROM auth.users u
 WHERE u.id = p.id;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_municipio ON public.profiles(municipio_id);

-- 2. Papéis com escopo territorial
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS nmsd_id uuid REFERENCES public.nucleos_microrregionais(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_nmsd ON public.user_roles(nmsd_id) WHERE nmsd_id IS NOT NULL;

COMMENT ON COLUMN public.user_roles.role IS 'membro = Profissional; moderador; ponto_focal; coordenador = Coordenador do NMSD (nmsd_id); admin = Admin URS/SES';

-- 3. Funções auxiliares
CREATE OR REPLACE FUNCTION public.is_active_user(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND status = 'ativo')
$$;

CREATE OR REPLACE FUNCTION public.coordinates_nmsd(_user_id uuid, _nmsd_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _nmsd_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_roles
     WHERE user_id = _user_id AND role = 'coordenador' AND nmsd_id = _nmsd_id
  )
$$;

-- 4. Proteção: status, e-mail e revisão só mudam pela coordenação
CREATE OR REPLACE FUNCTION public.guard_profile_sensitive_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF COALESCE(current_setting('app.registration_review', true), '') = 'on' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pendente';
    NEW.revisado_por := NULL;
    NEW.revisado_em := NULL;
    NEW.motivo_recusa := NULL;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.revisado_por IS DISTINCT FROM OLD.revisado_por
     OR NEW.revisado_em IS DISTINCT FROM OLD.revisado_em
     OR NEW.motivo_recusa IS DISTINCT FROM OLD.motivo_recusa THEN
    RAISE EXCEPTION 'Somente a coordenação pode alterar a situação do cadastro' USING ERRCODE = '42501';
  END IF;

  IF OLD.aceite_termos_em IS NOT NULL AND NEW.aceite_termos_em IS DISTINCT FROM OLD.aceite_termos_em THEN
    RAISE EXCEPTION 'O aceite dos termos não pode ser alterado' USING ERRCODE = '42501';
  END IF;

  IF OLD.status <> 'pendente' AND NEW.municipio_id IS DISTINCT FROM OLD.municipio_id THEN
    RAISE EXCEPTION 'O município só pode ser alterado pela coordenação' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_sensitive_fields ON public.profiles;
CREATE TRIGGER trg_guard_profile_sensitive_fields
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_sensitive_fields();

-- 5. Novo cadastro: grava os dados do formulário e fica pendente (papel só na aprovação)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_mun uuid;
BEGIN
  BEGIN
    v_mun := NULLIF(meta->>'municipio_id', '')::uuid;
  EXCEPTION WHEN others THEN
    v_mun := NULL;
  END;
  IF v_mun IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.municipios WHERE id = v_mun) THEN
    v_mun := NULL;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, phone, job_title, cbo, cnes, municipio_id, aceite_termos_em)
  VALUES (
    NEW.id,
    NULLIF(meta->>'full_name', ''),
    NEW.email,
    NULLIF(regexp_replace(COALESCE(meta->>'phone', ''), '\D', '', 'g'), ''),
    NULLIF(meta->>'job_title', ''),
    NULLIF(meta->>'cbo', ''),
    NULLIF(meta->>'cnes', ''),
    v_mun,
    CASE WHEN meta->>'aceite_termos' = 'true' THEN now() ELSE NULL END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 6. Lista pública de municípios para o formulário de cadastro (dados públicos do IBGE)
CREATE OR REPLACE FUNCTION public.list_municipios_cadastro()
RETURNS TABLE(id uuid, municipio text, microregiao text, urs text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.id, m.municipio, m.microregiao, m.urs FROM public.municipios m ORDER BY m.municipio
$$;

-- 7. Fila de cadastros (coordenador vê o próprio NMSD; admin URS/SES vê todos)
CREATE OR REPLACE FUNCTION public.list_registrations(_status text DEFAULT 'pendente')
RETURNS TABLE(
  id uuid, full_name text, email text, phone text, job_title text, cbo text, cnes text,
  municipio_id uuid, municipio text, microregiao text, nucleo_id uuid, urs text,
  status text, aceite_termos_em timestamptz, created_at timestamptz, motivo_recusa text, roles text[]
)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  v_is_admin boolean;
BEGIN
  IF uid IS NULL OR NOT public.is_active_user(uid) THEN
    RAISE EXCEPTION 'Você não tem permissão' USING ERRCODE = '42501';
  END IF;
  v_is_admin := public.has_role(uid, 'admin');
  IF NOT v_is_admin AND NOT public.has_role(uid, 'coordenador') THEN
    RAISE EXCEPTION 'Você não tem permissão' USING ERRCODE = '42501';
  END IF;

  PERFORM public.log_audit('consulta', 'cadastros', NULL, NULL, jsonb_build_object('status', _status));

  RETURN QUERY
  SELECT p.id, p.full_name, p.email, p.phone, p.job_title, p.cbo, p.cnes,
         p.municipio_id, m.municipio, m.microregiao, m.nucleo_id, m.urs,
         p.status, p.aceite_termos_em, p.created_at, p.motivo_recusa,
         COALESCE((SELECT array_agg(ur.role::text ORDER BY ur.role::text) FROM public.user_roles ur WHERE ur.user_id = p.id), '{}'::text[])
    FROM public.profiles p
    LEFT JOIN public.municipios m ON m.id = p.municipio_id
   WHERE (_status IS NULL OR p.status = _status)
     AND p.id <> uid
     AND (
       v_is_admin
       OR (m.nucleo_id IS NOT NULL AND public.coordinates_nmsd(uid, m.nucleo_id)
           AND NOT public.has_role(p.id, 'admin') AND NOT public.has_role(p.id, 'coordenador'))
     )
   ORDER BY p.created_at;
END;
$$;

-- 8. Aprovar, recusar ou ajustar cadastro
CREATE OR REPLACE FUNCTION public.review_registration(
  _user_id uuid,
  _decision text,
  _role public.app_role DEFAULT 'membro',
  _municipio_id uuid DEFAULT NULL,
  _nmsd_id uuid DEFAULT NULL,
  _job_title text DEFAULT NULL,
  _cbo text DEFAULT NULL,
  _cnes text DEFAULT NULL,
  _motivo text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  v_is_admin boolean;
  v_profile public.profiles%ROWTYPE;
  v_old_mun public.municipios%ROWTYPE;
  v_mun public.municipios%ROWTYPE;
  v_mun_id uuid;
  v_nmsd public.nucleos_microrregionais%ROWTYPE;
  v_nmsd_id uuid;
  v_perfil public.user_territory_profile;
BEGIN
  IF uid IS NULL OR NOT public.is_active_user(uid) THEN
    RAISE EXCEPTION 'Você não tem permissão' USING ERRCODE = '42501';
  END IF;
  IF _decision NOT IN ('aprovar', 'recusar') THEN
    RAISE EXCEPTION 'Decisão inválida';
  END IF;
  IF _user_id = uid THEN
    RAISE EXCEPTION 'Você não pode revisar o próprio cadastro' USING ERRCODE = '42501';
  END IF;

  v_is_admin := public.has_role(uid, 'admin');

  SELECT * INTO v_profile FROM public.profiles WHERE id = _user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cadastro não encontrado';
  END IF;

  v_mun_id := COALESCE(_municipio_id, v_profile.municipio_id);
  IF v_mun_id IS NOT NULL THEN
    SELECT * INTO v_mun FROM public.municipios WHERE id = v_mun_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Município não encontrado'; END IF;
  END IF;

  IF NOT v_is_admin THEN
    IF NOT public.has_role(uid, 'coordenador') THEN
      RAISE EXCEPTION 'Você não tem permissão' USING ERRCODE = '42501';
    END IF;
    IF public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'coordenador') THEN
      RAISE EXCEPTION 'Somente o Admin URS/SES revisa coordenadores' USING ERRCODE = '42501';
    END IF;
    IF v_profile.municipio_id IS NOT NULL THEN
      SELECT * INTO v_old_mun FROM public.municipios WHERE id = v_profile.municipio_id;
      IF NOT public.coordinates_nmsd(uid, v_old_mun.nucleo_id) THEN
        RAISE EXCEPTION 'Este cadastro não pertence ao seu núcleo' USING ERRCODE = '42501';
      END IF;
    END IF;
    IF v_mun_id IS NULL OR NOT public.coordinates_nmsd(uid, v_mun.nucleo_id) THEN
      RAISE EXCEPTION 'Este cadastro não pertence ao seu núcleo' USING ERRCODE = '42501';
    END IF;
    IF _decision = 'aprovar' AND _role NOT IN ('membro', 'moderador', 'ponto_focal') THEN
      RAISE EXCEPTION 'Somente o Admin URS/SES define coordenadores e administradores' USING ERRCODE = '42501';
    END IF;
  END IF;

  PERFORM set_config('app.registration_review', 'on', true);

  IF _decision = 'recusar' THEN
    UPDATE public.profiles
       SET status = 'inativo', revisado_por = uid, revisado_em = now(), motivo_recusa = NULLIF(_motivo, '')
     WHERE id = _user_id;
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    DELETE FROM public.user_territory_profiles WHERE user_id = _user_id;
  ELSE
    IF _role = 'coordenador' THEN
      v_nmsd_id := COALESCE(_nmsd_id, v_mun.nucleo_id);
      IF v_nmsd_id IS NULL THEN RAISE EXCEPTION 'Informe o núcleo (NMSD) do coordenador'; END IF;
      SELECT * INTO v_nmsd FROM public.nucleos_microrregionais WHERE id = v_nmsd_id;
      IF NOT FOUND THEN RAISE EXCEPTION 'Núcleo não encontrado'; END IF;
    ELSIF _role <> 'admin' THEN
      IF v_mun_id IS NULL THEN RAISE EXCEPTION 'Informe o município do profissional'; END IF;
      v_nmsd_id := v_mun.nucleo_id;
    END IF;

    UPDATE public.profiles
       SET status = 'ativo',
           municipio_id = v_mun_id,
           job_title = COALESCE(NULLIF(_job_title, ''), job_title),
           cbo = COALESCE(NULLIF(_cbo, ''), cbo),
           cnes = COALESCE(NULLIF(_cnes, ''), cnes),
           revisado_por = uid, revisado_em = now(), motivo_recusa = NULL
     WHERE id = _user_id;

    -- todo usuário aprovado é ao menos Profissional
    INSERT INTO public.user_roles (user_id, role, nmsd_id, municipio_id)
    VALUES (_user_id, 'membro', v_mun.nucleo_id, v_mun_id)
    ON CONFLICT (user_id, role) DO UPDATE SET nmsd_id = EXCLUDED.nmsd_id, municipio_id = EXCLUDED.municipio_id;

    IF _role <> 'membro' THEN
      INSERT INTO public.user_roles (user_id, role, nmsd_id, municipio_id)
      VALUES (_user_id, _role, v_nmsd_id, CASE WHEN _role IN ('moderador', 'ponto_focal') THEN v_mun_id ELSE NULL END)
      ON CONFLICT (user_id, role) DO UPDATE SET nmsd_id = EXCLUDED.nmsd_id, municipio_id = EXCLUDED.municipio_id;
    END IF;

    -- alinha o perfil territorial usado pelas regras de acesso (nunca rebaixa)
    v_perfil := CASE _role
      WHEN 'admin' THEN 'estado_nsdigi'::public.user_territory_profile
      WHEN 'coordenador' THEN 'nsd_microrregional'::public.user_territory_profile
      ELSE 'municipal'::public.user_territory_profile END;

    INSERT INTO public.user_territory_profiles
      (user_id, municipio_id, perfil_territorio, macrorregiao, microregiao, urs, grs, nucleo_id, created_by)
    VALUES (
      _user_id,
      CASE WHEN v_perfil = 'municipal' THEN v_mun_id ELSE NULL END,
      v_perfil,
      CASE WHEN _role = 'coordenador' THEN v_nmsd.macrorregiao ELSE v_mun.macrorregiao END,
      CASE WHEN _role = 'coordenador' THEN v_nmsd.microregiao ELSE v_mun.microregiao END,
      CASE WHEN _role = 'coordenador' THEN v_nmsd.urs ELSE v_mun.urs END,
      CASE WHEN _role = 'coordenador' THEN NULL ELSE v_mun.grs END,
      v_nmsd_id,
      uid
    )
    ON CONFLICT (user_id) DO UPDATE SET
      municipio_id = EXCLUDED.municipio_id,
      perfil_territorio = EXCLUDED.perfil_territorio,
      macrorregiao = EXCLUDED.macrorregiao,
      microregiao = EXCLUDED.microregiao,
      urs = EXCLUDED.urs,
      grs = EXCLUDED.grs,
      nucleo_id = EXCLUDED.nucleo_id,
      updated_at = now()
    WHERE (CASE user_territory_profiles.perfil_territorio
             WHEN 'estado_nsdigi' THEN 4 WHEN 'grs' THEN 3 WHEN 'nsd_microrregional' THEN 2 ELSE 1 END)
       <= (CASE EXCLUDED.perfil_territorio
             WHEN 'estado_nsdigi' THEN 4 WHEN 'grs' THEN 3 WHEN 'nsd_microrregional' THEN 2 ELSE 1 END);
  END IF;

  PERFORM set_config('app.registration_review', 'off', true);

  PERFORM public.log_audit(
    CASE WHEN _decision = 'aprovar' THEN 'aprovar_cadastro' ELSE 'recusar_cadastro' END,
    'profiles', _user_id,
    jsonb_build_object('status', v_profile.status, 'municipio_id', v_profile.municipio_id),
    jsonb_build_object('role', _role, 'municipio_id', v_mun_id, 'nmsd_id', v_nmsd_id, 'motivo', _motivo),
    v_mun_id, v_mun.microregiao, v_mun.urs, v_mun.grs
  );
END;
$$;

-- 9. Cadastros pendentes ou inativos não acessam conteúdo restrito nem publicam
CREATE OR REPLACE FUNCTION public.user_reaches_content(_escopo content_scope, _urs text, _microregiao text, _municipio_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  uid uuid := auth.uid();
  t user_territory_profiles%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RETURN FALSE; END IF;
  IF NOT is_active_user(uid) THEN RETURN FALSE; END IF;
  IF has_role(uid, 'admin'::app_role) THEN RETURN TRUE; END IF;
  IF _escopo = 'global' THEN RETURN TRUE; END IF;

  SELECT * INTO t FROM user_territory_profiles WHERE user_id = uid;
  IF NOT FOUND THEN RETURN FALSE; END IF;
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
$function$;

CREATE OR REPLACE FUNCTION public.user_can_manage_content(_escopo content_scope, _urs text, _microregiao text, _municipio_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  uid uuid := auth.uid();
  t user_territory_profiles%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RETURN FALSE; END IF;
  IF NOT is_active_user(uid) THEN RETURN FALSE; END IF;
  IF has_role(uid, 'admin'::app_role) THEN RETURN TRUE; END IF;
  IF NOT has_role(uid, 'coordenador'::app_role) THEN RETURN FALSE; END IF;

  SELECT * INTO t FROM user_territory_profiles WHERE user_id = uid;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF t.perfil_territorio = 'estado_nsdigi' THEN RETURN TRUE; END IF;

  IF t.perfil_territorio = 'grs' THEN
    RETURN _escopo <> 'global' AND t.urs IS NOT NULL AND t.urs = _urs;
  ELSIF t.perfil_territorio = 'nsd_microrregional' THEN
    RETURN _escopo IN ('microrregional','municipal') AND t.microregiao IS NOT NULL AND t.microregiao = _microregiao;
  ELSIF t.perfil_territorio = 'municipal' THEN
    RETURN _escopo = 'municipal' AND t.municipio_id IS NOT NULL AND t.municipio_id = _municipio_id;
  END IF;
  RETURN FALSE;
END;
$function$;

-- 10. Participação (fóruns, matrículas, mentorias) só para cadastros ativos
DROP POLICY IF EXISTS "Authenticated users can create replies" ON public.forum_replies;
CREATE POLICY "Authenticated users can create replies" ON public.forum_replies
  FOR INSERT WITH CHECK (auth.uid() = author_id AND public.is_active_user(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create topics" ON public.forum_topics;
CREATE POLICY "Authenticated users can create topics" ON public.forum_topics
  FOR INSERT WITH CHECK (auth.uid() = author_id AND public.is_active_user(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can link materials" ON public.forum_topic_materials;
CREATE POLICY "Authenticated users can link materials" ON public.forum_topic_materials
  FOR INSERT WITH CHECK (auth.uid() = created_by AND public.is_active_user(auth.uid()));

DROP POLICY IF EXISTS "Users can join forums" ON public.forum_members;
CREATE POLICY "Users can join forums" ON public.forum_members
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_active_user(auth.uid()));

DROP POLICY IF EXISTS "Users can enroll in courses" ON public.course_enrollments;
CREATE POLICY "Users can enroll in courses" ON public.course_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_active_user(auth.uid()));

DROP POLICY IF EXISTS "Users can enroll in trails" ON public.trail_enrollments;
CREATE POLICY "Users can enroll in trails" ON public.trail_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_active_user(auth.uid()));

DROP POLICY IF EXISTS "Users can create own mentee profile" ON public.mentees;
CREATE POLICY "Users can create own mentee profile" ON public.mentees
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_active_user(auth.uid()));

DROP POLICY IF EXISTS "Users can create own mentor profile" ON public.mentors;
CREATE POLICY "Users can create own mentor profile" ON public.mentors
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_active_user(auth.uid()));

-- 11. Permissões de execução
REVOKE ALL ON FUNCTION public.is_active_user(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.coordinates_nmsd(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_registrations(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_registration(uuid, text, public.app_role, uuid, uuid, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_municipios_cadastro() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_profile_sensitive_fields() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.is_active_user(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.coordinates_nmsd(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.list_registrations(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.review_registration(uuid, text, public.app_role, uuid, uuid, text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.list_municipios_cadastro() TO anon, authenticated, service_role;