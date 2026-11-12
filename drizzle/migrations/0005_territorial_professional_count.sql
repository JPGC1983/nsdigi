CREATE OR REPLACE FUNCTION public.count_active_professionals()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL OR NOT public.is_active_user(auth.uid()) THEN 0
    WHEN public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.user_territory_profiles t WHERE t.user_id = auth.uid() AND t.perfil_territorio = 'estado_nsdigi')
      THEN (SELECT count(*)::integer FROM public.profiles WHERE status = 'ativo')
    ELSE (
      SELECT count(*)::integer
      FROM public.profiles p
      JOIN public.municipios m ON m.id = p.municipio_id
      WHERE p.status = 'ativo'
        AND public.check_territory_access(auth.uid(), m.id, m.microregiao, m.urs)
    )
  END
$$;
REVOKE ALL ON FUNCTION public.count_active_professionals() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.count_active_professionals() FROM anon;
GRANT EXECUTE ON FUNCTION public.count_active_professionals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_active_professionals() TO service_role;