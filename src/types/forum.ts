export type ForumTopicType = 'problem_solution' | 'best_practice' | 'qa' | 'announcement';
export type ForumTopicStatus = 'open' | 'resolved' | 'awaiting_feedback' | 'validated' | 'archived';

export interface Forum {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  moderator_id: string | null;
  faq_content: string | null;
  rules: string | null;
  sla_hours: number;
  topics_count: number;
  members_count: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ForumTag {
  id: string;
  forum_id: string;
  name: string;
  slug: string;
  color: string;
  usage_count: number;
  created_at: string;
}

export interface ForumTopic {
  id: string;
  forum_id: string;
  author_id: string;
  title: string;
  content: string;
  topic_type: ForumTopicType;
  status: ForumTopicStatus;
  is_pinned: boolean;
  is_featured: boolean;
  is_locked: boolean;
  best_reply_id: string | null;
  views_count: number;
  replies_count: number;
  votes_score: number;
  expires_at: string | null;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  tags?: ForumTag[];
}

export interface ForumReply {
  id: string;
  topic_id: string;
  author_id: string;
  parent_reply_id: string | null;
  content: string;
  is_accepted: boolean;
  votes_score: number;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ForumVote {
  id: string;
  user_id: string;
  topic_id: string | null;
  reply_id: string | null;
  vote_value: -1 | 1;
  created_at: string;
}

export interface ForumExpert {
  id: string;
  user_id: string;
  forum_id: string;
  helpful_replies_count: number;
  acceptance_rate: number;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ForumMember {
  id: string;
  user_id: string;
  forum_id: string;
  accepted_rules: boolean;
  accepted_rules_at: string | null;
  created_at: string;
}

export const TOPIC_TYPE_CONFIG: Record<ForumTopicType, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  problem_solution: {
    label: 'Problema & Solução',
    icon: '🔧',
    color: '#FF9500',
    bgColor: '#FFF3E0',
  },
  best_practice: {
    label: 'Melhor Prática',
    icon: '💎',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
  },
  qa: {
    label: 'Pergunta & Resposta',
    icon: '❓',
    color: '#2196F3',
    bgColor: '#E3F2FD',
  },
  announcement: {
    label: 'Anúncio Oficial',
    icon: '📢',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
  },
};

export const TOPIC_STATUS_CONFIG: Record<ForumTopicStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  open: {
    label: 'Aberto',
    color: '#2196F3',
    bgColor: '#E3F2FD',
  },
  resolved: {
    label: 'Resolvido',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
  },
  awaiting_feedback: {
    label: 'Aguardando Feedback',
    color: '#FF9500',
    bgColor: '#FFF3E0',
  },
  validated: {
    label: 'Validado',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
  },
  archived: {
    label: 'Arquivado',
    color: '#9E9E9E',
    bgColor: '#F5F5F5',
  },
};
