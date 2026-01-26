-- =====================================================
-- MÓDULO DE MENTORIAS - SCHEMA COMPLETO
-- =====================================================

-- Enum para status da sessão de mentoria
CREATE TYPE public.mentorship_session_status AS ENUM (
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

-- Enum para tipo de sessão
CREATE TYPE public.mentorship_session_type AS ENUM (
  'diagnostic',
  'practical',
  'evaluation'
);

-- Enum para áreas de especialidade
CREATE TYPE public.mentorship_specialty AS ENUM (
  'esus_ab',
  'esus_regulacao',
  'telessaude',
  'seguranca_lgpd',
  'rnds',
  'implementacao'
);

-- =====================================================
-- TABELA: mentors (Perfis de Mentores)
-- =====================================================
CREATE TABLE public.mentors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  years_experience INTEGER DEFAULT 0,
  municipality TEXT,
  organization TEXT,
  specialties mentorship_specialty[] DEFAULT '{}',
  max_mentees INTEGER DEFAULT 3,
  current_mentees INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  total_sessions INTEGER DEFAULT 0,
  total_hours NUMERIC(10,2) DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  linkedin_url TEXT,
  availability_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_mentor_user UNIQUE (user_id)
);

-- =====================================================
-- TABELA: mentor_availability (Disponibilidade)
-- =====================================================
CREATE TABLE public.mentor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- =====================================================
-- TABELA: mentees (Perfis de Mentorados)
-- =====================================================
CREATE TABLE public.mentees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  municipality TEXT,
  organization TEXT,
  job_role TEXT,
  experience_level TEXT DEFAULT 'beginner',
  learning_goals TEXT,
  knowledge_gaps mentorship_specialty[] DEFAULT '{}',
  preferred_schedule TEXT,
  total_sessions INTEGER DEFAULT 0,
  total_hours NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_mentee_user UNIQUE (user_id)
);

-- =====================================================
-- TABELA: mentorship_matches (Pareamentos)
-- =====================================================
CREATE TABLE public.mentorship_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES public.mentees(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')),
  match_score NUMERIC(5,2),
  matched_specialties mentorship_specialty[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  goals TEXT,
  progress_notes TEXT,
  current_phase TEXT DEFAULT 'diagnostic' CHECK (current_phase IN ('diagnostic', 'practical', 'evaluation')),
  phase_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_active_match UNIQUE (mentor_id, mentee_id)
);

-- =====================================================
-- TABELA: mentorship_sessions (Sessões)
-- =====================================================
CREATE TABLE public.mentorship_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.mentorship_matches(id) ON DELETE CASCADE,
  session_type mentorship_session_type NOT NULL,
  session_number INTEGER DEFAULT 1,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status mentorship_session_status NOT NULL DEFAULT 'pending',
  meeting_link TEXT,
  agenda TEXT,
  notes TEXT,
  mentor_feedback TEXT,
  mentee_feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  skills_practiced mentorship_specialty[] DEFAULT '{}',
  resources_shared TEXT[],
  action_items TEXT[],
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- TABELA: mentorship_goals (Metas da Jornada)
-- =====================================================
CREATE TABLE public.mentorship_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.mentorship_matches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  specialty mentorship_specialty,
  target_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- TABELA: mentorship_certificates (Certificados)
-- =====================================================
CREATE TABLE public.mentorship_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.mentorship_matches(id) ON DELETE SET NULL,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('mentor', 'mentee', 'specialty', 'achievement')),
  title TEXT NOT NULL,
  description TEXT,
  specialty mentorship_specialty,
  hours_completed NUMERIC(10,2),
  sessions_completed INTEGER,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  issued_by UUID,
  certificate_code TEXT UNIQUE,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- TABELA: mentorship_badges (Gamificação)
-- =====================================================
CREATE TABLE public.mentorship_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  specialty mentorship_specialty,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_badges ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: mentors
-- =====================================================
CREATE POLICY "Anyone can view active mentors"
  ON public.mentors FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create own mentor profile"
  ON public.mentors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mentor profile"
  ON public.mentors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all mentors"
  ON public.mentors FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordenador'::app_role));

-- =====================================================
-- RLS POLICIES: mentor_availability
-- =====================================================
CREATE POLICY "Anyone can view mentor availability"
  ON public.mentor_availability FOR SELECT
  USING (true);

CREATE POLICY "Mentors can manage own availability"
  ON public.mentor_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mentors 
      WHERE mentors.id = mentor_availability.mentor_id 
      AND mentors.user_id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES: mentees
-- =====================================================
CREATE POLICY "Mentors and admins can view mentees"
  ON public.mentees FOR SELECT
  USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM public.mentors WHERE user_id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can create own mentee profile"
  ON public.mentees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mentee profile"
  ON public.mentees FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: mentorship_matches
-- =====================================================
CREATE POLICY "Participants can view own matches"
  ON public.mentorship_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentors WHERE mentors.id = mentorship_matches.mentor_id AND mentors.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.mentees WHERE mentees.id = mentorship_matches.mentee_id AND mentees.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordenador'::app_role)
  );

CREATE POLICY "Mentees can request matches"
  ON public.mentorship_matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mentees WHERE mentees.id = mentorship_matches.mentee_id AND mentees.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update own matches"
  ON public.mentorship_matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.mentors WHERE mentors.id = mentorship_matches.mentor_id AND mentors.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.mentees WHERE mentees.id = mentorship_matches.mentee_id AND mentees.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- =====================================================
-- RLS POLICIES: mentorship_sessions
-- =====================================================
CREATE POLICY "Participants can view own sessions"
  ON public.mentorship_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentorship_matches m
      JOIN public.mentors mt ON mt.id = m.mentor_id
      WHERE m.id = mentorship_sessions.match_id AND mt.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.mentorship_matches m
      JOIN public.mentees me ON me.id = m.mentee_id
      WHERE m.id = mentorship_sessions.match_id AND me.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Participants can manage own sessions"
  ON public.mentorship_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mentorship_matches m
      JOIN public.mentors mt ON mt.id = m.mentor_id
      WHERE m.id = mentorship_sessions.match_id AND mt.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.mentorship_matches m
      JOIN public.mentees me ON me.id = m.mentee_id
      WHERE m.id = mentorship_sessions.match_id AND me.user_id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES: mentorship_goals
-- =====================================================
CREATE POLICY "Participants can view own goals"
  ON public.mentorship_goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentorship_matches m
      JOIN public.mentors mt ON mt.id = m.mentor_id
      WHERE m.id = mentorship_goals.match_id AND mt.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.mentorship_matches m
      JOIN public.mentees me ON me.id = m.mentee_id
      WHERE m.id = mentorship_goals.match_id AND me.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Participants can manage own goals"
  ON public.mentorship_goals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mentorship_matches m
      JOIN public.mentors mt ON mt.id = m.mentor_id
      WHERE m.id = mentorship_goals.match_id AND mt.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.mentorship_matches m
      JOIN public.mentees me ON me.id = m.mentee_id
      WHERE m.id = mentorship_goals.match_id AND me.user_id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES: mentorship_certificates
-- =====================================================
CREATE POLICY "Anyone can view public certificates"
  ON public.mentorship_certificates FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Admins can issue certificates"
  ON public.mentorship_certificates FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'coordenador'::app_role)
  );

-- =====================================================
-- RLS POLICIES: mentorship_badges
-- =====================================================
CREATE POLICY "Anyone can view badges"
  ON public.mentorship_badges FOR SELECT
  USING (true);

CREATE POLICY "System can award badges"
  ON public.mentorship_badges FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- =====================================================
-- TRIGGERS: Update timestamps
-- =====================================================
CREATE TRIGGER update_mentors_updated_at
  BEFORE UPDATE ON public.mentors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentees_updated_at
  BEFORE UPDATE ON public.mentees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.mentorship_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.mentorship_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.mentorship_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX idx_mentors_user_id ON public.mentors(user_id);
CREATE INDEX idx_mentors_specialties ON public.mentors USING GIN(specialties);
CREATE INDEX idx_mentors_municipality ON public.mentors(municipality);
CREATE INDEX idx_mentees_user_id ON public.mentees(user_id);
CREATE INDEX idx_mentees_knowledge_gaps ON public.mentees USING GIN(knowledge_gaps);
CREATE INDEX idx_matches_mentor_id ON public.mentorship_matches(mentor_id);
CREATE INDEX idx_matches_mentee_id ON public.mentorship_matches(mentee_id);
CREATE INDEX idx_matches_status ON public.mentorship_matches(status);
CREATE INDEX idx_sessions_match_id ON public.mentorship_sessions(match_id);
CREATE INDEX idx_sessions_scheduled_at ON public.mentorship_sessions(scheduled_at);
CREATE INDEX idx_goals_match_id ON public.mentorship_goals(match_id);
CREATE INDEX idx_certificates_user_id ON public.mentorship_certificates(user_id);
CREATE INDEX idx_badges_user_id ON public.mentorship_badges(user_id);