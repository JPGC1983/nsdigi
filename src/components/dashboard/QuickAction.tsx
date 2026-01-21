import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "primary" | "secondary";
}

const QuickAction = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  variant = "default"
}: QuickActionProps) => {
  const variants = {
    default: "hover:border-primary/50 hover:bg-primary/5",
    primary: "border-primary/30 bg-primary/5 hover:bg-primary/10",
    secondary: "border-secondary/30 bg-secondary/5 hover:bg-secondary/10",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-md group",
        variants[variant]
      )}
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default QuickAction;
