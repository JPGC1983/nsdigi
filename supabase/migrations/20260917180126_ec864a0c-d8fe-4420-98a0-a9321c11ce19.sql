CREATE OR REPLACE FUNCTION public.is_mentor_of_mentee(_mentee_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM mentorship_matches mm
    JOIN mentors m ON m.id = mm.mentor_id
    WHERE mm.mentee_id = _mentee_id
      AND m.user_id = _user_id
      AND mm.status = ANY (ARRAY['pending','active','completed'])
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_mentor_of_mentee(uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_mentor_of_mentee(uuid, uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Restricted mentee visibility" ON public.mentees;
CREATE POLICY "Restricted mentee visibility"
ON public.mentees
FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR public.is_mentor_of_mentee(id, auth.uid())
);