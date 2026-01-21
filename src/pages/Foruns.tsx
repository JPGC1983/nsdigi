import { useState } from "react";
import { MessageSquare, Users, Clock, ChevronRight, Pin, Plus } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Forum {
  id: string;
  name: string;
  description: string;
  topics: number;
  members: number;
  lastActivity: string;
  category: string;
  pinned?: boolean;
}

interface Topic {
  id: string;
  title: string;
  author: string;
  replies: number;
  views: number;
  lastReply: string;
  isPinned?: boolean;
  isResolved?: boolean;
}

const forums: Forum[] = [
  {
    id: "1",
    name: "Atenção Primária e e-SUS",
    description: "Discussões sobre APS digital, prontuário eletrônico e registro de atendimentos",
    topics: 156,
    members: 234,
    lastActivity: "Há 15 min",
    category: "aps",
    pinned: true,
  },
  {
    id: "2",
    name: "Regulação e Acesso",
    description: "Fluxos de regulação, sistemas de marcação e integração de serviços",
    topics: 89,
    members: 156,
    lastActivity: "Há 1 hora",
    category: "regulacao",
  },
  {
    id: "3",
    name: "Gestão da Informação",
    description: "Qualidade de dados, análise de indicadores e relatórios gerenciais",
    topics: 67,
    members: 98,
    lastActivity: "Há 3 horas",
    category: "gestao",
  },
  {
    id: "4",
    name: "Segurança e Infraestrutura",
    description: "Questões técnicas, suporte de TI e infraestrutura de rede",
    topics: 45,
    members: 67,
    lastActivity: "Ontem",
    category: "ti",
  },
  {
    id: "5",
    name: "Inovação e Melhorias",
    description: "Práticas inovadoras, sugestões e relatos de experiência bem-sucedida",
    topics: 34,
    members: 189,
    lastActivity: "Há 2 horas",
    category: "inovacao",
  },
];

const recentTopics: Topic[] = [
  {
    id: "1",
    title: "Como integrar prontuário com RNDS? Dúvidas sobre certificado digital",
    author: "Maria Silva",
    replies: 12,
    views: 89,
    lastReply: "Há 15 min",
    isPinned: true,
  },
  {
    id: "2",
    title: "Novo módulo de agendamento e-SUS - Experiências da implementação",
    author: "Carlos Mendes",
    replies: 8,
    views: 67,
    lastReply: "Há 45 min",
    isResolved: true,
  },
  {
    id: "3",
    title: "Problemas com sincronização de dados entre municípios",
    author: "Ana Paula",
    replies: 5,
    views: 45,
    lastReply: "Há 2 horas",
  },
  {
    id: "4",
    title: "Boas práticas para qualidade de registro no prontuário",
    author: "Roberto Lima",
    replies: 23,
    views: 156,
    lastReply: "Há 4 horas",
    isPinned: true,
  },
];

const categoryColors: Record<string, string> = {
  aps: "bg-primary/10 text-primary border-primary/20",
  regulacao: "bg-secondary/10 text-secondary border-secondary/20",
  gestao: "bg-accent/10 text-accent border-accent/20",
  ti: "bg-warning/10 text-warning border-warning/20",
  inovacao: "bg-info/10 text-info border-info/20",
};

const Foruns = () => {
  const [activeTab, setActiveTab] = useState("foruns");

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fóruns de Discussão</h1>
            <p className="text-muted-foreground">
              Comunidade de prática para troca de experiências e suporte mútuo
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Discussão
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Fóruns Ativos</p>
            <p className="text-2xl font-bold text-foreground">{forums.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total de Tópicos</p>
            <p className="text-2xl font-bold text-foreground">
              {forums.reduce((acc, f) => acc + f.topics, 0)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Participantes</p>
            <p className="text-2xl font-bold text-foreground">
              {forums.reduce((acc, f) => acc + f.members, 0)}
            </p>
          </div>
          <div className="rounded-lg border border-success/20 bg-success/5 p-4">
            <p className="text-sm text-muted-foreground">Tempo Médio Resposta</p>
            <p className="text-2xl font-bold text-success">48h</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="foruns">Fóruns</TabsTrigger>
            <TabsTrigger value="recentes">Discussões Recentes</TabsTrigger>
          </TabsList>

          <TabsContent value="foruns" className="mt-4">
            <div className="space-y-4">
              {forums.map((forum) => (
                <div
                  key={forum.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {forum.pinned && <Pin className="h-4 w-4 text-primary" />}
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {forum.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{forum.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          {forum.topics} tópicos
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {forum.members} membros
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {forum.lastActivity}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recentes" className="mt-4">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="divide-y divide-border">
                {recentTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.isPinned && <Pin className="h-3 w-3 text-primary" />}
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {topic.title}
                          </h4>
                          {topic.isResolved && (
                            <Badge className="bg-success/10 text-success border-success/20 text-xs">
                              Resolvido
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>por {topic.author}</span>
                          <span>{topic.replies} respostas</span>
                          <span>{topic.views} visualizações</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {topic.lastReply}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Foruns;
