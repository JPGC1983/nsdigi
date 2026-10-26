-- Repositório de materiais
CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  material_type text NOT NULL DEFAULT 'manual' CHECK (material_type IN ('video','manual','faq','template','legislacao')),
  category text,
  author text,
  url text,
  file_path text,
  file_name text,
  file_size bigint,
  file_type text,
  downloads integer NOT NULL DEFAULT 0,
  escopo public.content_scope NOT NULL DEFAULT 'global',
  urs text,
  microregiao text,
  municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT materials_has_source CHECK (url IS NOT NULL OR file_path IS NOT NULL)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materials TO authenticated;
GRANT ALL ON public.materials TO service_role;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Materials visible within territory" ON public.materials
  FOR SELECT TO authenticated
  USING (public.user_reaches_content(escopo, urs, microregiao, municipio_id));

CREATE POLICY "Managers and moderators publish materials" ON public.materials
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND (
      public.user_can_manage_content(escopo, urs, microregiao, municipio_id)
      OR (public.has_role(auth.uid(), 'moderador') AND public.is_active_user(auth.uid())
          AND escopo <> 'global' AND public.user_reaches_content(escopo, urs, microregiao, municipio_id))
    )
  );

CREATE POLICY "Managers update materials" ON public.materials
  FOR UPDATE TO authenticated
  USING (public.user_can_manage_content(escopo, urs, microregiao, municipio_id) OR created_by = auth.uid())
  WITH CHECK (public.user_can_manage_content(escopo, urs, microregiao, municipio_id) OR created_by = auth.uid());

CREATE POLICY "Managers delete materials" ON public.materials
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());

CREATE INDEX materials_created_at_idx ON public.materials (created_at DESC);

-- Contagem de downloads sem dar permissão de edição a quem só lê
CREATE OR REPLACE FUNCTION public.register_material_download(_material_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.materials m SET downloads = downloads + 1
  WHERE m.id = _material_id
    AND public.user_reaches_content(m.escopo, m.urs, m.microregiao, m.municipio_id);
$$;
REVOKE EXECUTE ON FUNCTION public.register_material_download(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_material_download(uuid) TO authenticated;

-- Membros do colegiado (contatos protegidos por permissão de coluna)
CREATE TABLE public.colegiado_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  funcao text NOT NULL,
  municipio text,
  categoria text NOT NULL DEFAULT 'obrigatorio' CHECK (categoria IN ('obrigatorio','recomendado')),
  email text,
  telefone text,
  escopo public.content_scope NOT NULL DEFAULT 'global',
  urs text,
  microregiao text,
  municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT (id, nome, funcao, municipio, categoria, escopo, urs, microregiao, municipio_id, created_by, created_at, updated_at) ON public.colegiado_members TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.colegiado_members TO authenticated;
GRANT ALL ON public.colegiado_members TO service_role;
ALTER TABLE public.colegiado_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Colegiado members visible within territory" ON public.colegiado_members
  FOR SELECT TO authenticated
  USING (public.user_reaches_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Managers add colegiado members" ON public.colegiado_members
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND public.user_can_manage_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Managers update colegiado members" ON public.colegiado_members
  FOR UPDATE TO authenticated
  USING (public.user_can_manage_content(escopo, urs, microregiao, municipio_id))
  WITH CHECK (public.user_can_manage_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Managers remove colegiado members" ON public.colegiado_members
  FOR DELETE TO authenticated
  USING (public.user_can_manage_content(escopo, urs, microregiao, municipio_id));

-- Contatos só para quem administra o território do membro
CREATE OR REPLACE FUNCTION public.list_colegiado_contacts()
RETURNS TABLE (id uuid, email text, telefone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.email, c.telefone
  FROM public.colegiado_members c
  WHERE public.user_can_manage_content(c.escopo, c.urs, c.microregiao, c.municipio_id);
$$;
REVOKE EXECUTE ON FUNCTION public.list_colegiado_contacts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_colegiado_contacts() TO authenticated;

-- Reuniões do colegiado
CREATE TABLE public.colegiado_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  data_reuniao date NOT NULL,
  horario text,
  formato text NOT NULL DEFAULT 'presencial' CHECK (formato IN ('presencial','virtual','hibrida')),
  local text,
  descricao text,
  escopo public.content_scope NOT NULL DEFAULT 'global',
  urs text,
  microregiao text,
  municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.colegiado_meetings TO authenticated;
GRANT ALL ON public.colegiado_meetings TO service_role;
ALTER TABLE public.colegiado_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Colegiado meetings visible within territory" ON public.colegiado_meetings
  FOR SELECT TO authenticated
  USING (public.user_reaches_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Managers schedule colegiado meetings" ON public.colegiado_meetings
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND public.user_can_manage_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Managers update colegiado meetings" ON public.colegiado_meetings
  FOR UPDATE TO authenticated
  USING (public.user_can_manage_content(escopo, urs, microregiao, municipio_id))
  WITH CHECK (public.user_can_manage_content(escopo, urs, microregiao, municipio_id));
CREATE POLICY "Managers cancel colegiado meetings" ON public.colegiado_meetings
  FOR DELETE TO authenticated
  USING (public.user_can_manage_content(escopo, urs, microregiao, municipio_id));

CREATE INDEX colegiado_meetings_data_idx ON public.colegiado_meetings (data_reuniao);

-- Arquivos do repositório: privados, lidos por quem está logado e ativo
CREATE POLICY "Active users read material files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'materiais' AND public.is_active_user(auth.uid()));
CREATE POLICY "Publishers upload material files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'materiais' AND public.is_active_user(auth.uid()) AND (
      public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordenador') OR public.has_role(auth.uid(), 'moderador')
    )
  );
CREATE POLICY "Admins delete material files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'materiais' AND public.has_role(auth.uid(), 'admin'));
