import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { MentorshipBadge, BADGE_CONFIG, SPECIALTY_CONFIG } from "@/types/mentorship";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BadgeDisplayProps {
  badges: MentorshipBadge[];
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
}

const BadgeDisplay = ({
  badges,
  maxVisible = 5,
  size = "md",
}: BadgeDisplayProps) => {
  const visibleBadges = badges.slice(0, maxVisible);
  const hiddenCount = badges.length - maxVisible;

  const sizeClasses = {
    sm: "h-8 w-8 text-lg",
    md: "h-10 w-10 text-xl",
    lg: "h-14 w-14 text-2xl",
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {visibleBadges.map((badge) => {
        const config = BADGE_CONFIG[badge.badge_type];
        const specialtyConfig = badge.specialty ? SPECIALTY_CONFIG[badge.specialty] : null;

        return (
          <Tooltip key={badge.id}>
            <TooltipTrigger>
              <div
                className={`
                  ${sizeClasses[size]}
                  rounded-full flex items-center justify-center
                  bg-gradient-to-br from-amber-100 to-amber-200
                  border-2 border-amber-300 shadow-sm
                  hover:scale-110 transition-transform cursor-pointer
                `}
              >
                {badge.badge_icon || config?.icon || "🏅"}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-semibold">
                  {badge.badge_name || config?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {badge.badge_description || config?.description}
                </p>
                {specialtyConfig && (
                  <p className="text-xs" style={{ color: specialtyConfig.color }}>
                    {specialtyConfig.icon} {specialtyConfig.label}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Conquistado em {format(new Date(badge.earned_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {hiddenCount > 0 && (
        <div
          className={`
            ${sizeClasses[size]}
            rounded-full flex items-center justify-center
            bg-muted text-muted-foreground text-sm font-medium
          `}
        >
          +{hiddenCount}
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;
