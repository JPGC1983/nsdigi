import { MessageSquare, Users, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Forum } from "@/types/forum";
import { Badge } from "@/components/ui/badge";

interface ForumCardProps {
  forum: Forum;
}

const ForumCard = ({ forum }: ForumCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/foruns/${forum.slug}`)}
      className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div 
          className="h-14 w-14 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl"
          style={{ backgroundColor: `${forum.color}15` }}
        >
          {forum.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {forum.name}
            </h3>
            {forum.moderator_id && (
              <Badge variant="outline" className="text-xs">
                Moderado
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {forum.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              {forum.topics_count} tópicos
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              {forum.members_count} membros
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              SLA {forum.sla_hours}h
            </span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
    </div>
  );
};

export default ForumCard;
