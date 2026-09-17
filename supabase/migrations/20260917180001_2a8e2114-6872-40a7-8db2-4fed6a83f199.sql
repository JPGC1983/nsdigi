-- 1. Reapontar os vínculos de mentors/mentees para profiles (necessário para os joins da API)
ALTER TABLE public.mentors DROP CONSTRAINT IF EXISTS mentors_user_id_fkey;
ALTER TABLE public.mentors
  ADD CONSTRAINT mentors_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.mentees DROP CONSTRAINT IF EXISTS mentees_user_id_fkey;
ALTER TABLE public.mentees
  ADD CONSTRAINT mentees_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Fechar execução pública das funções SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.can_view_private_profile(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.check_territory_access(uuid, uuid, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_municipio_full(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_municipios_filter_options() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_profile_public(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_profile_safe(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_nmsd(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.list_municipios_safe(text, text, text, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.list_nmsd_members(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.list_profiles_public(text, integer, integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.log_audit(text, text, uuid, jsonb, jsonb, uuid, text, text, text) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.can_view_private_profile(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_territory_access(uuid, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_municipio_full(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_municipios_filter_options() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_public(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_safe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_nmsd(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_municipios_safe(text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_nmsd_members(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_profiles_public(text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit(text, text, uuid, jsonb, jsonb, uuid, text, text, text) TO authenticated;

-- 3. Funções internas de trigger: ninguém no cliente precisa chamá-las
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_nucleos_updated_at() FROM anon, authenticated, public;