// =====================================================
// TIPOS DO MÓDULO DE MENTORIAS
// =====================================================

export type MentorshipSessionStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export type MentorshipSessionType = 'diagnostic' | 'practical' | 'evaluation';

export type MentorshipSpecialty = 
  | 'esus_ab' 
  | 'esus_regulacao' 
  | 'telessaude' 
  | 'seguranca_lgpd' 
  | 'rnds' 
  | 'implementacao'
  | 'outros';

export type MatchStatus = 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';

export type JourneyPhase = 'diagnostic' | 'practical' | 'evaluation';

// =====================================================
// CONFIGURAÇÃO DE ESPECIALIDADES
// =====================================================
export const SPECIALTY_CONFIG: Record<MentorshipSpecialty, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  esus_ab: {
    label: 'e-SUS Atenção Básica',
    icon: '🏥',
    color: '#2196F3',
    bgColor: '#E3F2FD',
    description: 'Implementação e uso do e-SUS AB',
  },
  esus_regulacao: {
    label: 'e-SUS Regulação',
    icon: '📋',
    color: '#FF9500',
    bgColor: '#FFF3E0',
    description: 'Regulação de consultas e agendamentos',
  },
  telessaude: {
    label: 'Telessaúde',
    icon: '🖥️',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    description: 'Teleconsultoria e telemedicina',
  },
  seguranca_lgpd: {
    label: 'Segurança & LGPD',
    icon: '🔒',
    color: '#F44336',
    bgColor: '#FFEBEE',
    description: 'Proteção de dados e conformidade',
  },
  rnds: {
    label: 'RNDS & Interoperabilidade',
    icon: '🔗',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
    description: 'Rede Nacional de Dados em Saúde',
  },
  implementacao: {
    label: 'Implementação',
    icon: '📈',
    color: '#00BCD4',
    bgColor: '#E0F7FA',
    description: 'Gestão de mudança e capacitação',
  },
  outros: {
    label: 'Outros',
    icon: '📌',
    color: '#607D8B',
    bgColor: '#ECEFF1',
    description: 'Outras especialidades e assuntos diversos',
  },
};

// =====================================================
// CONFIGURAÇÃO DE FASES DA JORNADA
// =====================================================
export const JOURNEY_PHASE_CONFIG: Record<JourneyPhase, {
  label: string;
  icon: string;
  color: string;
  description: string;
  duration: string;
}> = {
  diagnostic: {
    label: 'Diagnóstico',
    icon: '🔍',
    color: '#2196F3',
    description: 'Identificação de lacunas e definição de metas',
    duration: '1-2 sessões',
  },
  practical: {
    label: 'Capacitação Prática',
    icon: '💪',
    color: '#FF9500',
    description: 'Hands-on nos sistemas e-SUS',
    duration: '4-8 sessões',
  },
  evaluation: {
    label: 'Avaliação Final',
    icon: '🎯',
    color: '#4CAF50',
    description: 'Medição do progresso e feedback',
    duration: '1-2 sessões',
  },
};

// =====================================================
// INTERFACES PRINCIPAIS
// =====================================================
export interface Mentor {
  id: string;
  user_id: string;
  bio: string | null;
  years_experience: number;
  municipality: string | null;
  organization: string | null;
  specialties: MentorshipSpecialty[];
  max_mentees: number;
  current_mentees: number;
  is_active: boolean;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  total_sessions: number;
  total_hours: number;
  avg_rating: number;
  rating_count: number;
  linkedin_url: string | null;
  availability_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    job_title: string | null;
  };
  availability?: MentorAvailability[];
}

export interface MentorAvailability {
  id: string;
  mentor_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface Mentee {
  id: string;
  user_id: string;
  municipality: string | null;
  organization: string | null;
  job_role: string | null;
  experience_level: string;
  learning_goals: string | null;
  knowledge_gaps: MentorshipSpecialty[];
  preferred_schedule: string | null;
  total_sessions: number;
  total_hours: number;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    job_title: string | null;
  };
}

export interface MentorshipMatch {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: MatchStatus;
  match_score: number | null;
  matched_specialties: MentorshipSpecialty[];
  start_date: string | null;
  end_date: string | null;
  goals: string | null;
  progress_notes: string | null;
  current_phase: JourneyPhase;
  phase_progress: number;
  created_at: string;
  updated_at: string;
  // Joined data
  mentor?: Mentor;
  mentee?: Mentee;
  sessions?: MentorshipSession[];
  goals_list?: MentorshipGoal[];
}

export interface MentorshipSession {
  id: string;
  match_id: string;
  session_type: MentorshipSessionType;
  session_number: number;
  scheduled_at: string;
  duration_minutes: number;
  status: MentorshipSessionStatus;
  meeting_link: string | null;
  agenda: string | null;
  notes: string | null;
  mentor_feedback: string | null;
  mentee_feedback: string | null;
  rating: number | null;
  skills_practiced: MentorshipSpecialty[];
  resources_shared: string[];
  action_items: string[];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorshipGoal {
  id: string;
  match_id: string;
  title: string;
  description: string | null;
  specialty: MentorshipSpecialty | null;
  target_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress_percentage: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorshipCertificate {
  id: string;
  user_id: string;
  match_id: string | null;
  certificate_type: 'mentor' | 'mentee' | 'specialty' | 'achievement';
  title: string;
  description: string | null;
  specialty: MentorshipSpecialty | null;
  hours_completed: number | null;
  sessions_completed: number | null;
  issued_at: string;
  issued_by: string | null;
  certificate_code: string | null;
  is_public: boolean;
  created_at: string;
}

export interface MentorshipBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string | null;
  badge_icon: string | null;
  earned_at: string;
  specialty: MentorshipSpecialty | null;
  created_at: string;
}

// =====================================================
// BADGES PRÉ-DEFINIDOS
// =====================================================
export const BADGE_CONFIG: Record<string, {
  name: string;
  icon: string;
  description: string;
  requirement: string;
}> = {
  first_session: {
    name: 'Primeira Sessão',
    icon: '🎉',
    description: 'Completou sua primeira sessão de mentoria',
    requirement: '1 sessão completada',
  },
  five_sessions: {
    name: 'Dedicado',
    icon: '⭐',
    description: 'Completou 5 sessões de mentoria',
    requirement: '5 sessões completadas',
  },
  ten_sessions: {
    name: 'Experiente',
    icon: '🌟',
    description: 'Completou 10 sessões de mentoria',
    requirement: '10 sessões completadas',
  },
  first_goal: {
    name: 'Objetivo Alcançado',
    icon: '🎯',
    description: 'Completou sua primeira meta de aprendizado',
    requirement: '1 meta completada',
  },
  high_rating: {
    name: 'Excelência',
    icon: '💎',
    description: 'Recebeu avaliação 5 estrelas',
    requirement: 'Avaliação 5.0',
  },
  journey_complete: {
    name: 'Jornada Completa',
    icon: '🏆',
    description: 'Completou toda a jornada de mentoria',
    requirement: 'Todas as 3 fases concluídas',
  },
  mentor_verified: {
    name: 'Mentor Verificado',
    icon: '✅',
    description: 'Mentor verificado pela coordenação',
    requirement: 'Verificação institucional',
  },
  specialty_master: {
    name: 'Especialista',
    icon: '🎓',
    description: 'Dominou uma especialidade',
    requirement: 'Fase de avaliação aprovada',
  },
};

// =====================================================
// HELPERS
// =====================================================
export const DAY_OF_WEEK_LABELS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export const SESSION_STATUS_CONFIG: Record<MentorshipSessionStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  pending: { label: 'Pendente', color: '#FF9500', bgColor: '#FFF3E0' },
  confirmed: { label: 'Confirmada', color: '#2196F3', bgColor: '#E3F2FD' },
  in_progress: { label: 'Em Andamento', color: '#9C27B0', bgColor: '#F3E5F5' },
  completed: { label: 'Concluída', color: '#4CAF50', bgColor: '#E8F5E9' },
  cancelled: { label: 'Cancelada', color: '#9E9E9E', bgColor: '#F5F5F5' },
  no_show: { label: 'Não Compareceu', color: '#F44336', bgColor: '#FFEBEE' },
};

export const MATCH_STATUS_CONFIG: Record<MatchStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  pending: { label: 'Aguardando', color: '#FF9500', bgColor: '#FFF3E0' },
  active: { label: 'Ativa', color: '#4CAF50', bgColor: '#E8F5E9' },
  paused: { label: 'Pausada', color: '#9E9E9E', bgColor: '#F5F5F5' },
  completed: { label: 'Concluída', color: '#2196F3', bgColor: '#E3F2FD' },
  cancelled: { label: 'Cancelada', color: '#F44336', bgColor: '#FFEBEE' },
};
