-- Corrigir política de auditoria para ser mais restritiva
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;

CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_log FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);