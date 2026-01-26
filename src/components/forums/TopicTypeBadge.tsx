import { ForumTopicType, TOPIC_TYPE_CONFIG } from "@/types/forum";

interface TopicTypeBadgeProps {
  type: ForumTopicType;
  size?: "sm" | "md";
}

const TopicTypeBadge = ({ type, size = "sm" }: TopicTypeBadgeProps) => {
  const config = TOPIC_TYPE_CONFIG[type];
  
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
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default TopicTypeBadge;
