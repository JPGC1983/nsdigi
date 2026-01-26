import { LucideIcon, ArrowRight } from "lucide-react";
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
  variant?: "default" | "primary" | "secondary";
  tooltip?: string;
}

const QuickAction = ({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  variant = "default",
  tooltip,
}: QuickActionProps) => {
  const variants = {
    default: "hover:border-primary/50 hover:bg-primary/5",
    primary: "border-primary/30 bg-primary/5 hover:bg-primary/10",
    secondary: "border-secondary/30 bg-secondary/5 hover:bg-secondary/10",
  };

  const content = (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all duration-300 flex-shrink-0">
        <Icon className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>
        <p className="text-[10px] text-muted-foreground truncate leading-tight">{description}</p>
      </div>
      <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0" />
    </div>
  );

  const baseClasses = cn(
    "w-full text-left rounded-lg border border-border bg-card p-3 shadow-layered transition-all duration-300 hover:shadow-layered-lg group cursor-pointer",
    variants[variant]
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
