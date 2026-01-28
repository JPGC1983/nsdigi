import * as React from "react";
import { ForumTopicType, TOPIC_TYPE_CONFIG } from "@/types/forum";

interface TopicTypeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: ForumTopicType;
  size?: "sm" | "md";
}

const TopicTypeBadge = React.forwardRef<HTMLSpanElement, TopicTypeBadgeProps>(
  ({ type, size = "sm", className, ...props }, ref) => {
    const config = TOPIC_TYPE_CONFIG[type];
    
    if (!config) return null;
    
    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1 rounded-full font-medium ${
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
        } ${className || ""}`}
        style={{ 
          backgroundColor: config.bgColor, 
          color: config.color 
        }}
        {...props}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  }
);
TopicTypeBadge.displayName = "TopicTypeBadge";

export default TopicTypeBadge;
