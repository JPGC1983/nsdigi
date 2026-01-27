-- =============================================
-- ESTRUTURA COMPLETA DE REGIONALIZAÇÃO MG
-- =============================================

-- 1. Criar enum para perfis de usuário territoriais
CREATE TYPE public.user_territory_profile AS ENUM (
  'municipal',
  'nsd_microrregional',
  'grs',
  'estado_nsdigi'
);

-- 2. Criar enum para status de município
CREATE TYPE public.municipio_status AS ENUM (
  'ativo',
  'pendente',
  'inativo',
  'em_implantacao'
);

-- 3. Criar tabela de municípios com estrutura de regionalização
CREATE TABLE public.municipios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio TEXT NOT NULL,
  cod_ibge TEXT NOT NULL,
  macrorregiao TEXT NOT NULL,
  cod_macro TEXT NOT NULL,
  microregiao TEXT NOT NULL,
  cod_micro TEXT NOT NULL,
  urs TEXT NOT NULL,
  grs TEXT,
  status public.municipio_status NOT NULL DEFAULT 'pendente',
  coordenador_nome TEXT,
  coordenador_email TEXT,
  coordenador_telefone TEXT,
  populacao INTEGER DEFAULT 0,
  profissionais INTEGER DEFAULT 0,
  maturidade_digital INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unq_cod_ibge UNIQUE (cod_ibge)
);

-- 4. Criar índices para otimização
CREATE INDEX idx_municipios_microregiao ON public.municipios (microregiao);
CREATE INDEX idx_municipios_urs ON public.municipios (urs);
CREATE INDEX idx_municipios_grs ON public.municipios (grs);
CREATE INDEX idx_municipios_macrorregiao ON public.municipios (macrorregiao);
CREATE INDEX idx_municipios_status ON public.municipios (status);

-- 5. Habilitar RLS
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para municípios
CREATE POLICY "Anyone can view municipalities"
ON public.municipios FOR SELECT
USING (true);

CREATE POLICY "Admins and coordinators can insert municipalities"
ON public.municipios FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'coordenador'::app_role)
);

CREATE POLICY "Admins and coordinators can update municipalities"
ON public.municipios FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'coordenador'::app_role)
);

CREATE POLICY "Only admins can delete municipalities"
ON public.municipios FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Criar tabela de perfis territoriais de usuários
CREATE TABLE public.user_territory_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  municipio_id UUID REFERENCES public.municipios(id) ON DELETE SET NULL,
  perfil_territorio public.user_territory_profile NOT NULL DEFAULT 'municipal',
  macrorregiao TEXT,
  microregiao TEXT,
  urs TEXT,
  grs TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  CONSTRAINT unique_user_territory UNIQUE (user_id)
);

-- 8. Índices para perfis territoriais
CREATE INDEX idx_user_territory_municipio ON public.user_territory_profiles (municipio_id);
CREATE INDEX idx_user_territory_perfil ON public.user_territory_profiles (perfil_territorio);
CREATE INDEX idx_user_territory_microregiao ON public.user_territory_profiles (microregiao);
CREATE INDEX idx_user_territory_urs ON public.user_territory_profiles (urs);

-- 9. Habilitar RLS para perfis territoriais
ALTER TABLE public.user_territory_profiles ENABLE ROW LEVEL SECURITY;

-- 10. Políticas RLS para perfis territoriais
CREATE POLICY "Users can view own territory profile"
ON public.user_territory_profiles FOR SELECT
USING (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'coordenador'::app_role)
);

CREATE POLICY "Admins can manage territory profiles"
ON public.user_territory_profiles FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'coordenador'::app_role)
);

-- 11. Criar tabela de auditoria
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  operation TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  municipio_id UUID,
  microregiao TEXT,
  urs TEXT,
  grs TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 12. Índices para auditoria
CREATE INDEX idx_audit_user ON public.audit_log (user_id);
CREATE INDEX idx_audit_entity ON public.audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_created ON public.audit_log (created_at DESC);
CREATE INDEX idx_audit_operation ON public.audit_log (operation);

-- 13. Habilitar RLS para auditoria
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 14. Políticas RLS para auditoria (apenas admins podem ver)
CREATE POLICY "Only admins can view audit logs"
ON public.audit_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs"
ON public.audit_log FOR INSERT
WITH CHECK (true);

-- 15. Adicionar campo microregiao à tabela forums para fóruns microrregionais
ALTER TABLE public.forums 
ADD COLUMN IF NOT EXISTS microregiao TEXT,
ADD COLUMN IF NOT EXISTS tipo_forum TEXT DEFAULT 'tematico';

-- 16. Criar trigger para atualizar updated_at em municipios
CREATE TRIGGER update_municipios_updated_at
BEFORE UPDATE ON public.municipios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 17. Criar trigger para atualizar updated_at em user_territory_profiles
CREATE TRIGGER update_user_territory_profiles_updated_at
BEFORE UPDATE ON public.user_territory_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 18. Função para verificar permissão territorial
CREATE OR REPLACE FUNCTION public.check_territory_access(
  _user_id UUID,
  _target_municipio_id UUID DEFAULT NULL,
  _target_microregiao TEXT DEFAULT NULL,
  _target_urs TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile user_territory_profiles%ROWTYPE;
BEGIN
  -- Estado pode acessar tudo
  IF has_role(_user_id, 'admin'::app_role) THEN
    RETURN TRUE;
  END IF;

  -- Buscar perfil territorial do usuário
  SELECT * INTO user_profile
  FROM user_territory_profiles
  WHERE user_id = _user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Verificar por perfil
  CASE user_profile.perfil_territorio
    WHEN 'estado_nsdigi' THEN
      RETURN TRUE;
    WHEN 'grs' THEN
      IF _target_urs IS NOT NULL THEN
        RETURN user_profile.urs = _target_urs;
      END IF;
      RETURN TRUE;
    WHEN 'nsd_microrregional' THEN
      IF _target_microregiao IS NOT NULL THEN
        RETURN user_profile.microregiao = _target_microregiao;
      END IF;
      RETURN TRUE;
    WHEN 'municipal' THEN
      IF _target_municipio_id IS NOT NULL THEN
        RETURN user_profile.municipio_id = _target_municipio_id;
      END IF;
      IF _target_microregiao IS NOT NULL THEN
        RETURN user_profile.microregiao = _target_microregiao;
      END IF;
      RETURN TRUE;
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;

-- 19. Função para registrar auditoria
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