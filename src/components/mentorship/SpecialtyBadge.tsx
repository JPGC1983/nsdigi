import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { MentorshipSpecialty, SPECIALTY_CONFIG } from "@/types/mentorship";

interface SpecialtyBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  specialty: MentorshipSpecialty;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const SpecialtyBadge = React.forwardRef<HTMLDivElement, SpecialtyBadgeProps>(
  ({ specialty, size = "md", showIcon = true, className = "", ...props }, ref) => {
    const config = SPECIALTY_CONFIG[specialty];
    
    if (!config) return null;

    const sizeClasses = {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-2.5 py-1",
      lg: "text-base px-3 py-1.5",
    };

    return (
      <Badge
        ref={ref}
        variant="secondary"
        className={`${sizeClasses[size]} ${className}`}
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
        }}
        {...props}
      >
        {showIcon && <span className="mr-1">{config.icon}</span>}
        {config.label}
      </Badge>
    );
  }
);
SpecialtyBadge.displayName = "SpecialtyBadge";

export default SpecialtyBadge;
