import type { ReactNode } from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
  };
  /** Conteúdo livre à direita do título (vários botões, por exemplo). */
  actions?: ReactNode;
}

const PageHeader = ({
  title,
  description,
  breadcrumbs = [],
  action,
  actions,
}: PageHeaderProps) => {
  return (
    <div className="space-y-4">
      {breadcrumbs.length > 0 && (
        <nav aria-label="Caminho da página" className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label="Início"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
          </Link>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={index} className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
                {item.href && !isLast ? (
                  <Link to={item.href} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium" aria-current={isLast ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        {(action || actions) && (
          <div className="flex flex-wrap gap-2">
            {actions}
            {action && (
              <Button onClick={action.onClick} className="gap-2 shadow-sm">
                {action.icon && <action.icon className="h-4 w-4" aria-hidden="true" />}
                {action.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
