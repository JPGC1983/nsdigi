
-- Corrigir view para usar security_invoker (evitar security definer)
DROP VIEW IF EXISTS nmsd_members_count;
CREATE VIEW nmsd_members_count 
WITH (security_invoker=on) AS
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
