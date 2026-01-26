import { ForumTopicStatus, TOPIC_STATUS_CONFIG } from "@/types/forum";
import { CheckCircle2, Clock, MessageCircle, Archive, HelpCircle } from "lucide-react";

interface TopicStatusBadgeProps {
  status: ForumTopicStatus;
  size?: "sm" | "md";
}

const statusIcons: Record<ForumTopicStatus, React.ReactNode> = {
  open: <HelpCircle className="h-3 w-3" />,
  resolved: <CheckCircle2 className="h-3 w-3" />,
  awaiting_feedback: <Clock className="h-3 w-3" />,
  validated: <CheckCircle2 className="h-3 w-3" />,
  archived: <Archive className="h-3 w-3" />,
};

const TopicStatusBadge = ({ status, size = "sm" }: TopicStatusBadgeProps) => {
  const config = TOPIC_STATUS_CONFIG[status];
  
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
      style={{ 
        backgroundColor: config.bgColor, 
        color: config.color 
      }}
    >
      {statusIcons[status]}
      <span>{config.label}</span>
    </span>
  );
};

export default TopicStatusBadge;
