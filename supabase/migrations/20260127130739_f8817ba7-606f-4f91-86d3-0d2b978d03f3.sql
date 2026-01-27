-- Criar tabela de cursos
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  category TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'basico',
  format TEXT NOT NULL DEFAULT 'online',
  url TEXT,
  enrolled INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de trilhas formativas
CREATE TABLE public.trails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  total_hours INTEGER NOT NULL DEFAULT 0,
  courses_count INTEGER NOT NULL DEFAULT 0,
  enrolled INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de inscrições em cursos (para tracking de progresso)
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Criar tabela de inscrições em trilhas
CREATE TABLE public.trail_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  trail_id UUID NOT NULL REFERENCES public.trails(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, trail_id)
);

-- Habilitar RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trail_enrollments ENABLE ROW LEVEL SECURITY;

-- Políticas para CURSOS
-- Todos podem ver cursos
CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  USING (true);

-- Admins e coordenadores podem criar cursos
CREATE POLICY "Admins and coordinators can create courses"
  ON public.courses FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordenador'::app_role));

-- Admins e coordenadores podem atualizar cursos
CREATE POLICY "Admins and coordinators can update courses"
  ON public.courses FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordenador'::app_role));

-- Apenas admins podem deletar cursos
CREATE POLICY "Only admins can delete courses"
  ON public.courses FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas para TRILHAS
-- Todos podem ver trilhas
CREATE POLICY "Anyone can view trails"
  ON public.trails FOR SELECT
  USING (true);

-- Admins e coordenadores podem criar trilhas
CREATE POLICY "Admins and coordinators can create trails"
  ON public.trails FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordenador'::app_role));

-- Admins e coordenadores podem atualizar trilhas
CREATE POLICY "Admins and coordinators can update trails"
  ON public.trails FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordenador'::app_role));

-- Apenas admins podem deletar trilhas
CREATE POLICY "Only admins can delete trails"
  ON public.trails FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas para INSCRIÇÕES EM CURSOS
-- Usuários podem ver suas próprias inscrições
CREATE POLICY "Users can view own course enrollments"
  ON public.course_enrollments FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Usuários podem se inscrever em cursos
CREATE POLICY "Users can enroll in courses"
  ON public.course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias inscrições
CREATE POLICY "Users can update own course enrollments"
  ON public.course_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para INSCRIÇÕES EM TRILHAS
-- Usuários podem ver suas próprias inscrições
CREATE POLICY "Users can view own trail enrollments"
  ON public.trail_enrollments FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Usuários podem se inscrever em trilhas
CREATE POLICY "Users can enroll in trails"
  ON public.trail_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias inscrições
CREATE POLICY "Users can update own trail enrollments"
  ON public.trail_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trails_updated_at
  BEFORE UPDATE ON public.trails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();