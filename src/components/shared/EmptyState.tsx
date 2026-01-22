import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "compact";
  className?: string;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
  className,
}: EmptyStateProps) => {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-gradient-to-b from-muted/30 to-muted/10",
        isCompact ? "py-6 px-4" : "py-12 px-6",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full bg-muted/50 flex items-center justify-center mb-4 ring-8 ring-muted/20",
          isCompact ? "h-12 w-12" : "h-16 w-16"
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground/60",
            isCompact ? "h-6 w-6" : "h-8 w-8"
          )}
        />
      </div>
      <h3
        className={cn(
          "font-semibold text-foreground mb-2",
          isCompact ? "text-sm" : "text-lg"
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "text-muted-foreground max-w-sm",
          isCompact ? "text-xs mb-3" : "text-sm mb-6"
        )}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size={isCompact ? "sm" : "default"}
          className="gap-2 shadow-sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
