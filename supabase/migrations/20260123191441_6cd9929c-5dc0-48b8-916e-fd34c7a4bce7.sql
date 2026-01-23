-- Create table for CIB meeting documentation
CREATE TABLE public.cib_documentation (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.cib_documentation ENABLE ROW LEVEL SECURITY;

-- Everyone can view the CIB documentation
CREATE POLICY "Anyone can view CIB documentation"
ON public.cib_documentation
FOR SELECT
USING (true);

-- Only admins and coordinators can insert
CREATE POLICY "Admins and coordinators can insert CIB documentation"
ON public.cib_documentation
FOR INSERT
WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'coordenador'::app_role)
);

-- Only admins and coordinators can update
CREATE POLICY "Admins and coordinators can update CIB documentation"
ON public.cib_documentation
FOR UPDATE
USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'coordenador'::app_role)
);

-- Only admins can delete
CREATE POLICY "Only admins can delete CIB documentation"
ON public.cib_documentation
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cib_documentation_updated_at
BEFORE UPDATE ON public.cib_documentation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();