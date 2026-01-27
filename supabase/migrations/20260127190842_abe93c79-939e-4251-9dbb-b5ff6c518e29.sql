-- =============================================
-- CORREÇÃO ADICIONAL DE SEGURANÇA
-- =============================================

-- 1. Restringir acesso à tabela municipios para exigir autenticação
DROP POLICY IF EXISTS "Anyone can view municipalities" ON public.municipios;

-- Apenas usuários autenticados podem ver municípios (sem dados de coordenador)
CREATE POLICY "Authenticated users can view municipalities"
ON public.municipios FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 2. Atualizar política de user_roles para restringir visualização
DROP POLICY IF EXISTS "Anyone can view roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Corrigir política de audit_log para restringir INSERT
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_log;

-- Apenas funções de sistema (via security definer) podem inserir logs
-- A inserção será feita pelas funções RPC, não diretamente pelos usuários
CREATE POLICY "Only system functions can insert audit logs"
ON public.audit_log FOR INSERT
WITH CHECK (false);

-- 4. Criar função segura para listar municípios (sem dados sensíveis)
CREATE OR REPLACE FUNCTION public.list_municipios_safe(
  search_term TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  microregiao_filter TEXT DEFAULT NULL,
  urs_filter TEXT DEFAULT NULL,
  macrorregiao_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  municipio TEXT,
  cod_ibge TEXT,
  macrorregiao TEXT,
  cod_macro TEXT,
  microregiao TEXT,
  cod_micro TEXT,
  urs TEXT,
  grs TEXT,
  status public.municipio_status,
  populacao INT,
  profissionais INT,
  maturidade_digital INT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    (search_term IS NULL OR m.municipio ILIKE '%' || search_term || '%' OR m.cod_ibge ILIKE '%' || search_term || '%')
    AND (status_filter IS NULL OR status_filter = 'all' OR m.status::TEXT = status_filter)
    AND (microregiao_filter IS NULL OR m.microregiao = microregiao_filter)
    AND (urs_filter IS NULL OR m.urs = urs_filter)
    AND (macrorregiao_filter IS NULL OR m.macrorregiao = macrorregiao_filter)
  ORDER BY m.municipio;
END;
$$;

-- 5. Atualizar função log_audit para usar INSERT direto (bypass RLS)
CREATE OR REPLACE FUNCTION public.log_audit(
  _operation TEXT,
  _entity_type TEXT,
  _entity_id UUID,
  _old_values JSONB DEFAULT NULL,
  _new_values JSONB DEFAULT NULL,
  _municipio_id UUID DEFAULT NULL,
  _microregiao TEXT DEFAULT NULL,
  _urs TEXT DEFAULT NULL,
  _grs TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Inserção direta bypassa RLS via SECURITY DEFINER
  INSERT INTO audit_log (
    user_id, operation, entity_type, entity_id,
    old_values, new_values, municipio_id,
    microregiao, urs, grs
  ) VALUES (
    auth.uid(), _operation, _entity_type, _entity_id,
    _old_values, _new_values, _municipio_id,
    _microregiao, _urs, _grs
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;