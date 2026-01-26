-- Create table for governance documents
CREATE TABLE public.governance_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    category TEXT NOT NULL DEFAULT 'outros',
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.governance_documents ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view documents
CREATE POLICY "Authenticated users can view governance documents"
ON public.governance_documents
FOR SELECT
TO authenticated
USING (true);

-- Only admin or coordenador can insert documents
CREATE POLICY "Admin and coordenador can insert governance documents"
ON public.governance_documents
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'coordenador')
);

-- Only admin can delete documents
CREATE POLICY "Admin can delete governance documents"
ON public.governance_documents
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_governance_documents_updated_at
    BEFORE UPDATE ON public.governance_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for governance documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('governance-documents', 'governance-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for governance documents bucket
CREATE POLICY "Anyone can view governance documents files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'governance-documents');

CREATE POLICY "Admin and coordenador can upload governance documents"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'governance-documents' AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordenador'))
);

CREATE POLICY "Admin can delete governance document files"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'governance-documents' AND
    public.has_role(auth.uid(), 'admin')
);