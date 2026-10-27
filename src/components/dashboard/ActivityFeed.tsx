import { MessageSquare, GraduationCap, FileText, Users, Inbox } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardActivity } from "@/hooks/useDashboardSummary";

const iconMap = {
  forum: MessageSquare,
  course: GraduationCap,
  document: FileText,
  meeting: Users,
};

const colorMap = {
  forum: "bg-info/10 text-info",
  course: "bg-primary/10 text-primary",
  document: "bg-accent/10 text-accent",
  meeting: "bg-warning/10 text-warning",
};

interface ActivityFeedProps {
  activities: DashboardActivity[];
  isLoading?: boolean;
}

const tempoRelativo = (iso: string) => {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ptBR });
  } catch {
    return "";
  }
};

const ActivityFeed = ({ activities, isLoading = false }: ActivityFeedProps) => {
  const navigate = useNavigate();

  return (
    <section
      aria-labelledby="atividades-recentes-titulo"
      className="rounded-xl border border-border bg-card p-6 shadow-layered h-full min-h-[200px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 id="atividades-recentes-titulo" className="font-semibold text-foreground text-base">
          Atividades Recentes
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando atividades">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <Inbox className="h-6 w-6 text-muted-foreground/40" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Nenhuma atividade recente</p>
          <p className="text-xs text-muted-foreground/60">
            Novos cursos, materiais, discussões e reuniões aparecerão aqui
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {activities.map((activity, index) => {
            const Icon = iconMap[activity.type];
            return (
              <motion.li
                key={activity.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => navigate(activity.link)}
                  className="w-full text-left flex items-start gap-3 group p-2 rounded-lg hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      colorMap[activity.type]
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{tempoRelativo(activity.createdAt)}</p>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default ActivityFeed;
