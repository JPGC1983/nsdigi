-- Função para obter opções de filtro de municípios (sem expor dados sensíveis)
CREATE OR REPLACE FUNCTION public.get_municipios_filter_options()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'microrregioes', (SELECT COALESCE(json_agg(DISTINCT microregiao ORDER BY microregiao), '[]'::json) FROM municipios),
    'ursList', (SELECT COALESCE(json_agg(DISTINCT urs ORDER BY urs), '[]'::json) FROM municipios),
    'macrorregioes', (SELECT COALESCE(json_agg(DISTINCT macrorregiao ORDER BY macrorregiao), '[]'::json) FROM municipios)
  );
$$;