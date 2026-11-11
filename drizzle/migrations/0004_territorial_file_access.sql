DROP POLICY IF EXISTS "Active users read material files" ON storage.objects;
CREATE POLICY "Territory readers access material files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'materiais' AND public.is_active_user(auth.uid()) AND (
      public.has_role(auth.uid(), 'admin')
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (SELECT 1 FROM public.materials m WHERE m.file_path = storage.objects.name)
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view governance document files" ON storage.objects;
CREATE POLICY "Territory readers access governance files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'governance-documents' AND public.is_active_user(auth.uid()) AND (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (SELECT 1 FROM public.governance_documents g WHERE g.file_path = storage.objects.name)
    )
  );