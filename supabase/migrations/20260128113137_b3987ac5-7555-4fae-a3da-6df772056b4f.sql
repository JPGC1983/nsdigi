-- =====================================================
-- CRIAR ESTRUTURA DE NÚCLEOS MICRORREGIONAIS (NMSD)
-- =====================================================

-- 1. Criar tabela de Núcleos Microrregionais de Saúde Digital
CREATE TABLE IF NOT EXISTS public.nucleos_microrregionais (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  microregiao text NOT NULL UNIQUE,
  cod_micro text NOT NULL UNIQUE,
  macrorregiao text NOT NULL,
  cod_macro text NOT NULL,
  urs text NOT NULL,
  
  -- Dados de gestão do NMSD
  nome_nucleo text GENERATED ALWAYS AS ('NMSD ' || microregiao) STORED,
  coordenador_nome text,
  coordenador_email text,
  coordenador_telefone text,
  
  -- Metadados
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_nucleos_micro_macrorregiao ON public.nucleos_microrregionais (macrorregiao);
CREATE INDEX IF NOT EXISTS idx_nucleos_micro_urs ON public.nucleos_microrregionais (urs);
CREATE INDEX IF NOT EXISTS idx_nucleos_micro_cod_macro ON public.nucleos_microrregionais (cod_macro);

-- 3. Adicionar FK na tabela municipios para vincular ao núcleo
ALTER TABLE public.municipios
ADD COLUMN IF NOT EXISTS nucleo_id uuid REFERENCES public.nucleos_microrregionais(id);

CREATE INDEX IF NOT EXISTS idx_municipios_nucleo_id ON public.municipios (nucleo_id);

-- 4. Habilitar RLS na tabela nucleos_microrregionais
ALTER TABLE public.nucleos_microrregionais ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para nucleos_microrregionais

-- Todos podem visualizar núcleos ativos
CREATE POLICY "Anyone can view active nucleos" 
ON public.nucleos_microrregionais 
FOR SELECT 
USING (is_active = true);

-- Admins podem gerenciar todos os núcleos
CREATE POLICY "Admins can manage all nucleos" 
ON public.nucleos_microrregionais 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Coordenadores podem gerenciar núcleos do seu território
CREATE POLICY "Coordinators can update their territory nucleos" 
ON public.nucleos_microrregionais 
FOR UPDATE
USING (
  has_role(auth.uid(), 'coordenador') AND
  EXISTS (
    SELECT 1 FROM user_territory_profiles utp
    WHERE utp.user_id = auth.uid()
    AND (
      utp.perfil_territorio = 'estado_nsdigi'
      OR (utp.perfil_territorio = 'grs' AND utp.urs = nucleos_microrregionais.urs)
      OR (utp.perfil_territorio = 'nsd_microrregional' AND utp.microregiao = nucleos_microrregionais.microregiao)
    )
  )
);

-- 6. Adicionar referência ao núcleo na tabela user_territory_profiles
ALTER TABLE public.user_territory_profiles
ADD COLUMN IF NOT EXISTS nucleo_id uuid REFERENCES public.nucleos_microrregionais(id);

-- 7. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_nucleos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_nucleos_microrregionais_updated_at ON public.nucleos_microrregionais;
CREATE TRIGGER update_nucleos_microrregionais_updated_at
BEFORE UPDATE ON public.nucleos_microrregionais
FOR EACH ROW EXECUTE FUNCTION update_nucleos_updated_at();

-- 8. Função para obter o NMSD de um usuário
CREATE OR REPLACE FUNCTION public.get_user_nmsd(user_uuid uuid)
RETURNS TABLE (
  nucleo_id uuid,
  nome_nucleo text,
  microregiao text,
  macrorregiao text,
  urs text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    nm.id as nucleo_id,
    nm.nome_nucleo,
    nm.microregiao,
    nm.macrorregiao,
    nm.urs
  FROM user_territory_profiles utp
  JOIN nucleos_microrregionais nm ON nm.microregiao = utp.microregiao
  WHERE utp.user_id = user_uuid
  LIMIT 1;
$$;

-- 9. Função para listar membros do NMSD (municípios)
CREATE OR REPLACE FUNCTION public.list_nmsd_members(nmsd_microregiao text)
RETURNS TABLE (
  municipio_id uuid,
  municipio text,
  cod_ibge text,
  status municipio_status,
  populacao integer,
  profissionais integer,
  maturidade_digital integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.id as municipio_id,
    m.municipio,
    m.cod_ibge,
    m.status,
    m.populacao,
    m.profissionais,
    m.maturidade_digital
  FROM municipios m
  WHERE m.microregiao = nmsd_microregiao
  ORDER BY m.municipio;
$$;