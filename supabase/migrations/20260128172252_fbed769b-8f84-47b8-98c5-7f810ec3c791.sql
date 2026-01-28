
-- =====================================================
-- MIGRAÇÃO: Reconstruir NMSDs com chave composta
-- (ajustado para não inserir em coluna gerada nome_nucleo)
-- =====================================================

-- 1. Limpar tabela de NMSDs existentes
TRUNCATE nucleos_microrregionais CASCADE;

-- 2. Adicionar constraint UNIQUE para chave composta
ALTER TABLE nucleos_microrregionais DROP CONSTRAINT IF EXISTS nucleos_microrregionais_micro_macro_unique;
ALTER TABLE nucleos_microrregionais ADD CONSTRAINT nucleos_microrregionais_micro_macro_unique 
  UNIQUE (microregiao, macrorregiao);

-- 3. Repovoar tabela de NMSDs com as combinações únicas corretas
-- SEM inserir na coluna nome_nucleo (que é gerada automaticamente)
INSERT INTO nucleos_microrregionais (
  microregiao, 
  cod_micro, 
  macrorregiao, 
  cod_macro, 
  urs,
  is_active
)
SELECT DISTINCT ON (m.microregiao, m.macrorregiao)
  m.microregiao,
  m.cod_micro,
  m.macrorregiao,
  m.cod_macro,
  m.urs,
  true as is_active
FROM municipios m
ORDER BY m.microregiao, m.macrorregiao, m.cod_micro;

-- 4. Atualizar nucleo_id nos municípios para vincular corretamente
UPDATE municipios m
SET nucleo_id = nm.id
FROM nucleos_microrregionais nm
WHERE m.microregiao = nm.microregiao 
  AND m.macrorregiao = nm.macrorregiao;

-- 5. Criar índice para performance nas buscas por chave composta
DROP INDEX IF EXISTS idx_municipios_micro_macro;
CREATE INDEX idx_municipios_micro_macro ON municipios(microregiao, macrorregiao);

-- 6. Criar view para facilitar consultas de membros do NMSD
DROP VIEW IF EXISTS nmsd_members_count;
CREATE VIEW nmsd_members_count AS
SELECT 
  nm.id as nucleo_id,
  nm.microregiao,
  nm.macrorregiao,
  nm.urs,
  nm.nome_nucleo,
  COUNT(m.id) as qtd_municipios,
  COALESCE(SUM(m.populacao), 0) as populacao_total,
  COALESCE(SUM(m.profissionais), 0) as profissionais_total,
  COALESCE(ROUND(AVG(m.maturidade_digital)), 0) as maturidade_media
FROM nucleos_microrregionais nm
LEFT JOIN municipios m ON m.nucleo_id = nm.id
WHERE nm.is_active = true
GROUP BY nm.id, nm.microregiao, nm.macrorregiao, nm.urs, nm.nome_nucleo
ORDER BY nm.macrorregiao, nm.microregiao;
