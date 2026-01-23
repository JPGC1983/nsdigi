-- Create table for individual CIB meetings
CREATE TABLE public.cib_meetings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_date DATE NOT NULL,
    themes TEXT NOT NULL,
    deliberations TEXT,
    territory_impacts TEXT,
    participation_type TEXT NOT NULL DEFAULT 'presencial',
    participants TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.cib_meetings ENABLE ROW LEVEL SECURITY;

-- Everyone can view CIB meetings
CREATE POLICY "Anyone can view CIB meetings"
ON public.cib_meetings
FOR SELECT
USING (true);

-- Only admins and coordinators can insert
CREATE POLICY "Admins and coordinators can insert CIB meetings"
ON public.cib_meetings
FOR INSERT
WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'coordenador'::app_role)
);

-- Only admins and coordinators can update
CREATE POLICY "Admins and coordinators can update CIB meetings"
ON public.cib_meetings
FOR UPDATE
USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'coordenador'::app_role)
);

-- Only admins can delete
CREATE POLICY "Only admins can delete CIB meetings"
ON public.cib_meetings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cib_meetings_updated_at
BEFORE UPDATE ON public.cib_meetings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();