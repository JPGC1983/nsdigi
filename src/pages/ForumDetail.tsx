import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MessageSquare, Users, Clock, Plus, ArrowLeft, 
  Pin, Star, BookOpen, Award, Shield, Filter 
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useForum, useForumTopics, useForumExperts, useForumMembership } from "@/hooks/useForums";
import { useAuth } from "@/hooks/useAuth";
import TopicCard from "@/components/forums/TopicCard";
import ForumRulesModal from "@/components/forums/ForumRulesModal";
import CreateTopicModal from "@/components/forums/CreateTopicModal";
import { ForumTopicType } from "@/types/forum";

const ForumDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { forum, tags, loading: forumLoading, error: forumError } = useForum(slug || "");
  const { topics, loading: topicsLoading, refetch: refetchTopics } = useForumTopics(forum?.id);
  const { experts } = useForumExperts(forum?.id);
  const { isMember, hasAcceptedRules, joinForum } = useForumMembership(forum?.id);
  
  const [activeTab, setActiveTab] = useState("all");
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleNewTopic = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!hasAcceptedRules) {
      setShowRulesModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleAcceptRules = async () => {
    await joinForum(true);
    setShowCreateModal(true);
  };

  // Filter topics
  const filteredTopics = topics.filter(topic => {
    if (activeTab !== "all" && topic.topic_type !== activeTab) return false;
    if (selectedTag && !topic.tags?.some(t => t.id === selectedTag)) return false;
    return true;
  });

  const pinnedTopics = filteredTopics.filter(t => t.is_pinned);
  const featuredTopics = filteredTopics.filter(t => t.is_featured && !t.is_pinned);
  const regularTopics = filteredTopics.filter(t => !t.is_pinned && !t.is_featured);

  if (forumLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (forumError || !forum) {
    return (
      <MainLayout>
        <EmptyState
          icon={MessageSquare}
          title="Fórum não encontrado"
          description="O fórum que você procura não existe ou foi removido."
          actionLabel="Voltar aos Fóruns"
          onAction={() => navigate("/foruns")}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title={forum.name}
          description={forum.description}
          breadcrumbs={[
            { label: "Fóruns de Discussão", href: "/foruns" },
            { label: forum.name },
          ]}
          action={{
            label: "Nova Discussão",
            icon: Plus,
            onClick: handleNewTopic,
          }}
        />

        {/* Forum Header Card */}
        <div 
          className="rounded-xl border border-border bg-card p-6 shadow-card"
          style={{ borderLeftWidth: 4, borderLeftColor: forum.color }}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{forum.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{forum.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {topics.length} tópicos
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {forum.members_count} membros
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      SLA {forum.sla_hours}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge
                    variant={selectedTag === null ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag(null)}
                  >
                    Todas
                  </Badge>
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTag === tag.id ? "default" : "outline"}
                      className="cursor-pointer"
                      style={selectedTag === tag.id ? { 
                        backgroundColor: tag.color,
                        borderColor: tag.color,
                      } : {}}
                      onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Experts Sidebar */}
            {experts.length > 0 && (
              <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Especialistas
                </h4>
                <div className="space-y-2">
                  {experts.slice(0, 3).map((expert) => (
                    <div key={expert.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={expert.user?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {expert.user?.full_name?.slice(0, 2) || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {expert.user?.full_name || "Usuário"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {expert.helpful_replies_count} respostas úteis
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        {forum.faq_content && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">FAQ - Perguntas Frequentes</h3>
            </div>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {forum.faq_content}
            </div>
          </div>
        )}

        {/* Topics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="problem_solution">🔧 Problemas</TabsTrigger>
              <TabsTrigger value="best_practice">💎 Práticas</TabsTrigger>
              <TabsTrigger value="qa">❓ Q&A</TabsTrigger>
              <TabsTrigger value="announcement">📢 Anúncios</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-4">
            {topicsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : filteredTopics.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Nenhuma discussão encontrada"
                description={
                  activeTab === "all"
                    ? "Seja o primeiro a iniciar uma discussão neste fórum!"
                    : "Nenhuma discussão deste tipo ainda. Crie a primeira!"
                }
                actionLabel="Criar Discussão"
                onAction={handleNewTopic}
              />
            ) : (
              <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                {/* Pinned Topics */}
                {pinnedTopics.length > 0 && (
                  <div className="bg-primary/5 border-b border-border">
                    <div className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-primary">
                      <Pin className="h-4 w-4" />
                      Fixados
                    </div>
                    {pinnedTopics.map((topic) => (
                      <TopicCard key={topic.id} topic={topic} forumSlug={forum.slug} />
                    ))}
                  </div>
                )}

                {/* Featured Topics */}
                {featuredTopics.length > 0 && (
                  <div className="border-b border-border">
                    <div className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-amber-600">
                      <Star className="h-4 w-4" />
                      Em Destaque
                    </div>
                    {featuredTopics.map((topic) => (
                      <TopicCard key={topic.id} topic={topic} forumSlug={forum.slug} />
                    ))}
                  </div>
                )}

                {/* Regular Topics */}
                {regularTopics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} forumSlug={forum.slug} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {forum && (
        <>
          <ForumRulesModal
            open={showRulesModal}
            onOpenChange={setShowRulesModal}
            forum={forum}
            onAccept={handleAcceptRules}
          />
          <CreateTopicModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            forum={forum}
            tags={tags}
            onSuccess={refetchTopics}
          />
        </>
      )}
    </MainLayout>
  );
};

export default ForumDetail;
