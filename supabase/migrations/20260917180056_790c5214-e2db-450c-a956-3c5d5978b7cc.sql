GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.check_territory_access(uuid, uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.can_view_private_profile(uuid, uuid) TO anon;