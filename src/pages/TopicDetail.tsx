import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MessageSquare, Eye, ThumbsUp, Clock, 
  CheckCircle2, Share2, Flag, MoreHorizontal, Send, Award
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useForum, useForumTopic } from "@/hooks/useForums";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TopicTypeBadge from "@/components/forums/TopicTypeBadge";
import TopicStatusBadge from "@/components/forums/TopicStatusBadge";
import VoteButtons from "@/components/forums/VoteButtons";

const TopicDetail = () => {
  const { slug, topicId } = useParams<{ slug: string; topicId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { forum } = useForum(slug || "");
  const { topic, replies, loading, error, refetch } = useForumTopic(topicId);
  
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!user) {
      toast.error("Faça login para responder");
      return;
    }

    if (!replyContent.trim()) {
      toast.error("Escreva sua resposta");
      return;
    }

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from("forum_replies")
        .insert({
          topic_id: topicId,
          author_id: user.id,
          content: replyContent.trim(),
        });

      if (error) throw error;

      toast.success("Resposta enviada!");
      setReplyContent("");
      refetch();
    } catch (err: any) {
      toast.error("Erro ao enviar resposta: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!topic) return;

    try {
      await supabase
        .from("forum_topics")
        .update({ status: "resolved" })
        .eq("id", topic.id);

      toast.success("Tópico marcado como resolvido!");
      refetch();
    } catch (err: any) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleAcceptReply = async (replyId: string) => {
    if (!topic) return;

    try {
      // Remove accepted from all replies
      await supabase
        .from("forum_replies")
        .update({ is_accepted: false })
        .eq("topic_id", topic.id);

      // Mark this reply as accepted
      await supabase
        .from("forum_replies")
        .update({ is_accepted: true })
        .eq("id", replyId);

      // Update topic with best reply
      await supabase
        .from("forum_topics")
        .update({ best_reply_id: replyId, status: "resolved" })
        .eq("id", topic.id);

      toast.success("Resposta aceita como solução!");
      refetch();
    } catch (err: any) {
      toast.error("Erro ao aceitar resposta");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (error || !topic || !forum) {
    return (
      <MainLayout>
        <EmptyState
          icon={MessageSquare}
          title="Tópico não encontrado"
          description="O tópico que você procura não existe ou foi removido."
          actionLabel="Voltar ao Fórum"
          onAction={() => navigate(`/foruns/${slug}`)}
        />
      </MainLayout>
    );
  }

  const isAuthor = user?.id === topic.author_id;
  const authorName = topic.author?.full_name || "Usuário";
  const authorInitials = authorName.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title=""
          description=""
          breadcrumbs={[
            { label: "Fóruns", href: "/foruns" },
            { label: forum.name, href: `/foruns/${forum.slug}` },
            { label: topic.title.substring(0, 40) + "..." },
          ]}
        />

        {/* Topic Card */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          {/* Topic Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={topic.author?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <TopicTypeBadge type={topic.topic_type} size="md" />
                  <TopicStatusBadge status={topic.status} size="md" />
                </div>
                
                <h1 className="text-xl font-bold text-foreground mb-2">
                  {topic.title}
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    por <span className="font-medium text-foreground">{authorName}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(topic.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {topic.views_count} visualizações
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <VoteButtons topicId={topic.id} currentScore={topic.votes_score} />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Copiar Link
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Flag className="h-4 w-4 mr-2" />
                      Reportar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Topic Content */}
          <div className="p-6">
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {topic.content}
            </div>
            
            {/* Actions for author */}
            {isAuthor && topic.status === "open" && (
              <div className="mt-6 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={handleMarkResolved}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como Resolvido
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Replies Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {replies.length} {replies.length === 1 ? "Resposta" : "Respostas"}
          </h3>

          {replies.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma resposta ainda. Seja o primeiro a contribuir!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => {
                const replyAuthorName = reply.author?.full_name || "Usuário";
                const replyAuthorInitials = replyAuthorName.split(" ").map(n => n[0]).join("").slice(0, 2);
                const isAccepted = reply.is_accepted;
                
                return (
                  <div 
                    key={reply.id} 
                    className={`rounded-xl border bg-card p-5 ${
                      isAccepted ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    {isAccepted && (
                      <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
                        <CheckCircle2 className="h-4 w-4" />
                        Melhor Resposta
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={reply.author?.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                          {replyAuthorInitials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-foreground">{replyAuthorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                        
                        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                          {reply.content}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-3">
                          <VoteButtons replyId={reply.id} currentScore={reply.votes_score} />
                          
                          {isAuthor && !isAccepted && topic.status !== "resolved" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleAcceptReply(reply.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Aceitar como Solução
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reply Form */}
        {!topic.is_locked && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h4 className="font-semibold text-foreground mb-4">Sua Resposta</h4>
            
            {user ? (
              <div className="space-y-4">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escreva sua resposta aqui..."
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSubmitReply} disabled={submitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? "Enviando..." : "Enviar Resposta"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">
                  Faça login para participar da discussão
                </p>
                <Button onClick={() => navigate("/auth")}>
                  Entrar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TopicDetail;
