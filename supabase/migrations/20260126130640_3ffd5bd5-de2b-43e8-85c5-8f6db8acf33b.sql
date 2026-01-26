-- Enum para tipos de discussão
CREATE TYPE public.forum_topic_type AS ENUM ('problem_solution', 'best_practice', 'qa', 'announcement');

-- Enum para status do tópico
CREATE TYPE public.forum_topic_status AS ENUM ('open', 'resolved', 'awaiting_feedback', 'validated', 'archived');

-- Tabela de Fóruns Temáticos
CREATE TABLE public.forums (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '💬',
    color TEXT NOT NULL DEFAULT '#2196F3',
    moderator_id UUID REFERENCES auth.users(id),
    faq_content TEXT,
    rules TEXT,
    sla_hours INTEGER DEFAULT 48,
    topics_count INTEGER DEFAULT 0,
    members_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Tags de Fórum
CREATE TABLE public.forum_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    forum_id UUID NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    color TEXT DEFAULT '#E0E0E0',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(forum_id, slug)
);

-- Tabela de Tópicos/Discussões
CREATE TABLE public.forum_topics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    forum_id UUID NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    topic_type forum_topic_type NOT NULL DEFAULT 'qa',
    status forum_topic_status NOT NULL DEFAULT 'open',
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    best_reply_id UUID,
    views_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    votes_score INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    notification_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Tags em Tópicos (many-to-many)
CREATE TABLE public.forum_topic_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.forum_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(topic_id, tag_id)
);

-- Tabela de Respostas/Replies
CREATE TABLE public.forum_replies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    parent_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT false,
    votes_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Votos
CREATE TABLE public.forum_votes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    vote_value INTEGER NOT NULL CHECK (vote_value IN (-1, 1)),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, topic_id),
    UNIQUE(user_id, reply_id),
    CHECK ((topic_id IS NOT NULL AND reply_id IS NULL) OR (topic_id IS NULL AND reply_id IS NOT NULL))
);

-- Tabela de Especialistas
CREATE TABLE public.forum_experts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    forum_id UUID NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
    helpful_replies_count INTEGER DEFAULT 0,
    acceptance_rate DECIMAL(5,2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, forum_id)
);

-- Tabela de Membros do Fórum
CREATE TABLE public.forum_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    forum_id UUID NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
    accepted_rules BOOLEAN DEFAULT false,
    accepted_rules_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, forum_id)
);

-- Tabela de Links Fórum-Repositório
CREATE TABLE public.forum_topic_materials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    material_id UUID NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(topic_id, material_id)
);

-- Enable RLS
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topic_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topic_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forums
CREATE POLICY "Anyone can view active forums" ON public.forums FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage forums" ON public.forums FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for forum_tags
CREATE POLICY "Anyone can view tags" ON public.forum_tags FOR SELECT USING (true);
CREATE POLICY "Admins and coordinators can manage tags" ON public.forum_tags FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordenador'));

-- RLS Policies for forum_topics
CREATE POLICY "Anyone can view topics" ON public.forum_topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create topics" ON public.forum_topics FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own topics" ON public.forum_topics FOR UPDATE USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordenador'));
CREATE POLICY "Admins can delete topics" ON public.forum_topics FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for forum_topic_tags
CREATE POLICY "Anyone can view topic tags" ON public.forum_topic_tags FOR SELECT USING (true);
CREATE POLICY "Topic authors can manage tags" ON public.forum_topic_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM public.forum_topics WHERE id = topic_id AND author_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
);

-- RLS Policies for forum_replies
CREATE POLICY "Anyone can view replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete replies" ON public.forum_replies FOR DELETE USING (has_role(auth.uid(), 'admin') OR auth.uid() = author_id);

-- RLS Policies for forum_votes
CREATE POLICY "Anyone can view votes" ON public.forum_votes FOR SELECT USING (true);
CREATE POLICY "Users can manage own votes" ON public.forum_votes FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for forum_experts
CREATE POLICY "Anyone can view experts" ON public.forum_experts FOR SELECT USING (true);
CREATE POLICY "Admins can manage experts" ON public.forum_experts FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordenador'));

-- RLS Policies for forum_members
CREATE POLICY "Anyone can view members" ON public.forum_members FOR SELECT USING (true);
CREATE POLICY "Users can join forums" ON public.forum_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave forums" ON public.forum_members FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for forum_topic_materials
CREATE POLICY "Anyone can view topic materials" ON public.forum_topic_materials FOR SELECT USING (true);
CREATE POLICY "Authenticated users can link materials" ON public.forum_topic_materials FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Triggers for updated_at
CREATE TRIGGER update_forums_updated_at BEFORE UPDATE ON public.forums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON public.forum_topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON public.forum_replies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_experts_updated_at BEFORE UPDATE ON public.forum_experts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the 6 default forums
INSERT INTO public.forums (name, slug, description, icon, color, display_order, rules) VALUES
('e-SUS Atenção Básica', 'esus-ab', 'Discussões sobre implementação, configuração e otimização de e-SUS AB, fichas clínicas, registros de consulta', '🏥', '#2196F3', 1, '1. Respeite todos os participantes
2. Evite spam e publicidade
3. Cite fontes quando compartilhar informação
4. Não compartilhe dados sensíveis de pacientes
5. Reportar problemas de segurança via privado'),
('e-SUS Regulação & Agendamento', 'esus-regulacao', 'Regulação de consultas, gestão de agendamentos, Central de Regulação, integração com sistemas de marcação', '📋', '#FF9500', 2, '1. Respeite todos os participantes
2. Evite spam e publicidade
3. Cite fontes quando compartilhar informação
4. Não compartilhe dados sensíveis de pacientes
5. Reportar problemas de segurança via privado'),
('Telessaúde & Telehealth', 'telessaude', 'Teleconsultoria, tele-monitoramento, teleconsulta, infraestrutura tecnológica para telemedicina', '🖥️', '#4CAF50', 3, '1. Respeite todos os participantes
2. Evite spam e publicidade
3. Cite fontes quando compartilhar informação
4. Não compartilhe dados sensíveis de pacientes
5. Reportar problemas de segurança via privado'),
('Segurança da Informação & LGPD', 'seguranca-lgpd', 'Proteção de dados, privacidade, conformidade LGPD, segurança em sistemas de saúde', '🔒', '#F44336', 4, '1. Respeite todos os participantes
2. Evite spam e publicidade
3. Cite fontes quando compartilhar informação
4. Não compartilhe dados sensíveis de pacientes
5. Reportar problemas de segurança via privado'),
('RNDS & Interoperabilidade', 'rnds', 'Rede Nacional de Dados em Saúde, integração de sistemas, padrões de interoperabilidade', '🔗', '#9C27B0', 5, '1. Respeite todos os participantes
2. Evite spam e publicidade
3. Cite fontes quando compartilhar informação
4. Não compartilhe dados sensíveis de pacientes
5. Reportar problemas de segurança via privado'),
('Implementação & Change Management', 'implementacao', 'Estratégias de implementação, gestão de mudança, capacitação de equipes, lições aprendidas', '📈', '#00BCD4', 6, '1. Respeite todos os participantes
2. Evite spam e publicidade
3. Cite fontes quando compartilhar informação
4. Não compartilhe dados sensíveis de pacientes
5. Reportar problemas de segurança via privado');

-- Insert default tags for each forum
INSERT INTO public.forum_tags (forum_id, name, slug, color) 
SELECT id, 'Fichas Clínicas', 'fichas', '#E3F2FD' FROM public.forums WHERE slug = 'esus-ab'
UNION ALL
SELECT id, 'Sincronização', 'sincronizacao', '#E3F2FD' FROM public.forums WHERE slug = 'esus-ab'
UNION ALL
SELECT id, 'Erros', 'erros', '#FFEBEE' FROM public.forums WHERE slug = 'esus-ab'
UNION ALL
SELECT id, 'Melhores Práticas', 'melhores-praticas', '#E8F5E9' FROM public.forums WHERE slug = 'esus-ab'
UNION ALL
SELECT id, 'Android/iOS', 'android-ios', '#FFF3E0' FROM public.forums WHERE slug = 'esus-ab'
UNION ALL
SELECT id, 'Performance', 'performance', '#F3E5F5' FROM public.forums WHERE slug = 'esus-ab'
UNION ALL
SELECT id, 'Agendamento', 'agendamento', '#FFF3E0' FROM public.forums WHERE slug = 'esus-regulacao'
UNION ALL
SELECT id, 'Central de Regulação', 'central-regulacao', '#FFF3E0' FROM public.forums WHERE slug = 'esus-regulacao'
UNION ALL
SELECT id, 'Integração', 'integracao', '#E8F5E9' FROM public.forums WHERE slug = 'esus-regulacao'
UNION ALL
SELECT id, 'Teleconsulta', 'teleconsulta', '#E8F5E9' FROM public.forums WHERE slug = 'telessaude'
UNION ALL
SELECT id, 'Infraestrutura', 'infraestrutura', '#E0F7FA' FROM public.forums WHERE slug = 'telessaude'
UNION ALL
SELECT id, 'LGPD', 'lgpd', '#FFEBEE' FROM public.forums WHERE slug = 'seguranca-lgpd'
UNION ALL
SELECT id, 'Privacidade', 'privacidade', '#FFEBEE' FROM public.forums WHERE slug = 'seguranca-lgpd'
UNION ALL
SELECT id, 'Padrões', 'padroes', '#F3E5F5' FROM public.forums WHERE slug = 'rnds'
UNION ALL
SELECT id, 'APIs', 'apis', '#E0F7FA' FROM public.forums WHERE slug = 'rnds'
UNION ALL
SELECT id, 'Change Management', 'change-management', '#E0F7FA' FROM public.forums WHERE slug = 'implementacao'
UNION ALL
SELECT id, 'Capacitação', 'capacitacao', '#E8F5E9' FROM public.forums WHERE slug = 'implementacao';