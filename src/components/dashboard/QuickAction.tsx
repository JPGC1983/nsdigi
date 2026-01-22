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
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
        <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
    </div>
  );

  const baseClasses = cn(
    "w-full text-left rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-300 hover:shadow-lg group cursor-pointer",
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
