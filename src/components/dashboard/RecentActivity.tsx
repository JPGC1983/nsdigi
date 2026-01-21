import { MessageSquare, GraduationCap, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "forum" | "course" | "document" | "meeting";
  title: string;
  description: string;
  time: string;
  user?: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "forum",
    title: "Nova discussão no Fórum APS",
    description: "Dúvida sobre integração e-SUS com prontuário",
    time: "Há 15 min",
    user: "Maria Silva",
  },
  {
    id: "2",
    type: "course",
    title: "Novo curso disponível",
    description: "Trilha de Gestor em Saúde Digital",
    time: "Há 2 horas",
  },
  {
    id: "3",
    type: "document",
    title: "Material atualizado",
    description: "Guia de Boas Práticas - e-SUS v5.2",
    time: "Há 4 horas",
  },
  {
    id: "4",
    type: "meeting",
    title: "Reunião do Colegiado agendada",
    description: "Próxima reunião: 28/01/2026 às 14h",
    time: "Ontem",
  },
];

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
    </div>
  );
};

export default RecentActivity;
