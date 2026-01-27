-- =============================================
-- LIMPEZA FINAL DE POLÍTICAS DUPLICADAS
-- =============================================

-- 1. Remover políticas duplicadas de profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
-- Manter apenas "Restricted profile access via functions only"

-- 2. Habilitar RLS nas views e adicionar políticas
-- Nota: Views com security_invoker herdam RLS da tabela base
-- Mas precisamos garantir que usuários autenticados possam acessar

-- Para a view profiles_public, usuários autenticados podem ver
-- (a view já exclui dados sensíveis como telefone)
-- Views não suportam ALTER diretamente, então vamos recriar

DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  full_name,
  municipality,
  avatar_url,
  job_title,
  created_at
FROM public.profiles;

-- 3. Recriar view de municipios sem dados sensíveis
DROP VIEW IF EXISTS public.municipios_public;

CREATE VIEW public.municipios_public
WITH (security_invoker = on) AS
SELECT 
  id,
  municipio,
  cod_ibge,
  macrorregiao,
  cod_macro,
  microregiao,
  cod_micro,
  urs,
  grs,
  status,
  populacao,
  profissionais,
  maturidade_digital,
  created_at,
  updated_at
FROM public.municipios;

-- 4. Atualizar política de profiles para ser mais clara
DROP POLICY IF EXISTS "Restricted profile access via functions only" ON public.profiles;

CREATE POLICY "Profile owner and admin access only"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id OR 
  has_role(auth.uid(), 'admin'::app_role)
);