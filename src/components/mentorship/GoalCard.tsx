import { CheckCircle, Circle, Clock, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MentorshipGoal, SPECIALTY_CONFIG } from "@/types/mentorship";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GoalCardProps {
  goal: MentorshipGoal;
  onUpdateProgress?: (progress: number) => void;
  onComplete?: () => void;
  canEdit?: boolean;
}

const GoalCard = ({
  goal,
  onUpdateProgress,
  onComplete,
  canEdit = false,
}: GoalCardProps) => {
  const statusColors = {
    pending: { bg: "#FFF3E0", color: "#FF9500", label: "Pendente" },
    in_progress: { bg: "#E3F2FD", color: "#2196F3", label: "Em Progresso" },
    completed: { bg: "#E8F5E9", color: "#4CAF50", label: "Concluída" },
    cancelled: { bg: "#F5F5F5", color: "#9E9E9E", label: "Cancelada" },
  };

  const status = statusColors[goal.status];
  const specialtyConfig = goal.specialty ? SPECIALTY_CONFIG[goal.specialty] : null;

  return (
    <Card className={`
      transition-all
      ${goal.status === "completed" ? "bg-green-50/50 border-green-200" : ""}
      ${goal.status === "in_progress" ? "border-primary/50" : ""}
    `}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div
            className={`
              h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0
              ${goal.status === "completed" ? "bg-green-100" : "bg-muted"}
            `}
          >
            {goal.status === "completed" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Target className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium">{goal.title}</h4>
              <Badge
                variant="secondary"
                style={{ backgroundColor: status.bg, color: status.color }}
              >
                {status.label}
              </Badge>
            </div>

            {goal.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {goal.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {specialtyConfig && (
                <Badge
                  variant="outline"
                  style={{ borderColor: specialtyConfig.color, color: specialtyConfig.color }}
                >
                  {specialtyConfig.icon} {specialtyConfig.label}
                </Badge>
              )}

              {goal.target_date && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Meta: {format(new Date(goal.target_date), "d MMM yyyy", { locale: ptBR })}
                </span>
              )}
            </div>

            {/* Progress */}
            {goal.status !== "cancelled" && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{goal.progress_percentage}%</span>
                </div>
                <Progress value={goal.progress_percentage} className="h-2" />
              </div>
            )}

            {/* Actions */}
            {canEdit && goal.status !== "completed" && goal.status !== "cancelled" && (
              <div className="flex gap-2 mt-3">
                {onUpdateProgress && (
                  <div className="flex gap-1">
                    {[25, 50, 75].map((value) => (
                      <Button
                        key={value}
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => onUpdateProgress(value)}
                        disabled={goal.progress_percentage >= value}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                )}
                {onComplete && goal.progress_percentage >= 75 && (
                  <Button size="sm" onClick={onComplete}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Concluir
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;
