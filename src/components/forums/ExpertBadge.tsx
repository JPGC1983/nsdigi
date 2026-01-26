import { Award } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExpertBadgeProps {
  forumName: string;
  helpfulReplies: number;
  acceptanceRate: number;
  color?: string;
}

const ExpertBadge = ({ 
  forumName, 
  helpfulReplies, 
  acceptanceRate,
  color = "#4CAF50"
}: ExpertBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-help"
            style={{ backgroundColor: `${color}15`, color }}
          >
            <Award className="h-3 w-3" />
            Especialista em {forumName}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            {helpfulReplies} respostas úteis • {acceptanceRate}% de aceitação
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ExpertBadge;
