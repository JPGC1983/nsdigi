CREATE OR REPLACE FUNCTION public.count_active_professionals()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN 0
    ELSE (SELECT count(*)::integer FROM public.profiles WHERE status = 'ativo')
  END
$$;

REVOKE ALL ON FUNCTION public.count_active_professionals() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.count_active_professionals() FROM anon;
GRANT EXECUTE ON FUNCTION public.count_active_professionals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_active_professionals() TO service_role;