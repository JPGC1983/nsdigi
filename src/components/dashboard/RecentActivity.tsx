import { MessageSquare, GraduationCap, FileText, Users, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "forum" | "course" | "document" | "meeting";
  title: string;
  description: string;
  time: string;
  user?: string;
}

// Empty array - data will be populated from backend
const activities: Activity[] = [];

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

const RecentActivity = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="font-semibold text-foreground mb-4">Atividades Recentes</h3>
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            As atividades aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type];
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 group cursor-pointer"
              >
                <div className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                  colorMap[activity.type]
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {activity.time}
                    {activity.user && ` • ${activity.user}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
