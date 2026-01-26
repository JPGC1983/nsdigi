import { Pin, MessageSquare, Eye, ThumbsUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ForumTopic } from "@/types/forum";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TopicTypeBadge from "./TopicTypeBadge";
import TopicStatusBadge from "./TopicStatusBadge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TopicCardProps {
  topic: ForumTopic;
  forumSlug: string;
}

const TopicCard = ({ topic, forumSlug }: TopicCardProps) => {
  const navigate = useNavigate();
  const authorName = topic.author?.full_name || "Usuário";
  const authorInitials = authorName.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <div
      onClick={() => navigate(`/foruns/${forumSlug}/topico/${topic.id}`)}
      className={`p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
        topic.is_pinned ? "bg-primary/5" : ""
      } ${topic.is_featured ? "border-l-4 border-l-primary" : ""}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={topic.author?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {authorInitials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {topic.is_pinned && (
              <Pin className="h-4 w-4 text-primary" />
            )}
            {topic.is_featured && (
              <span className="text-xs font-semibold text-destructive">📌 IMPORTANTE</span>
            )}
            <TopicTypeBadge type={topic.topic_type} />
            <TopicStatusBadge status={topic.status} />
          </div>
          
          <h4 className="font-medium text-foreground hover:text-primary transition-colors mb-1 line-clamp-2">
            {topic.title}
          </h4>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {topic.content.substring(0, 150)}...
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              por <span className="font-medium text-foreground">{authorName}</span>
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {topic.replies_count}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {topic.views_count}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {topic.votes_score}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(topic.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
