import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  tooltip?: string;
}

const QuickAction = ({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  tooltip,
}: QuickActionProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center text-center h-full py-6 px-4">
      <div className="mb-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground leading-tight">{description}</p>
    </div>
  );

  const baseClasses = cn(
    "h-[160px] w-full rounded-xl border border-border bg-white transition-colors duration-150 ease-in-out hover-bg cursor-pointer"
  );

  const actionContent = href ? (
    <Link to={href} className={baseClasses}>
      {content}
    </Link>
  ) : (
    <button onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{actionContent}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return actionContent;
};

export default QuickAction;
