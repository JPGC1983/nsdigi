import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  CheckCircle,
  XCircle,
  AlertCircle 
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MentorshipSession, 
  SESSION_STATUS_CONFIG,
  JOURNEY_PHASE_CONFIG 
} from "@/types/mentorship";

interface SessionCardProps {
  session: MentorshipSession;
  onJoin?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onViewDetails?: () => void;
  isMentor?: boolean;
}

const SessionCard = ({
  session,
  onJoin,
  onComplete,
  onCancel,
  onViewDetails,
  isMentor = false,
}: SessionCardProps) => {
  const statusConfig = SESSION_STATUS_CONFIG[session.status];
  const phaseConfig = JOURNEY_PHASE_CONFIG[session.session_type];
  const sessionDate = new Date(session.scheduled_at);
  const isPast = sessionDate < new Date();
  const isUpcoming = !isPast && session.status === "confirmed";

  return (
    <Card className={`
      transition-all duration-200
      ${isUpcoming ? "border-primary/50 shadow-md" : ""}
      ${session.status === "completed" ? "bg-muted/30" : ""}
    `}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{phaseConfig.icon}</span>
            <div>
              <h4 className="font-medium">
                Sessão #{session.session_number} - {phaseConfig.label}
              </h4>
              <p className="text-sm text-muted-foreground">
                {format(sessionDate, "EEEE, d 'de' MMMM 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
          <Badge
            style={{
              backgroundColor: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{session.duration_minutes} minutos</span>
          </div>

          {/* Agenda */}
          {session.agenda && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Pauta</p>
                  <p className="text-sm text-muted-foreground">
                    {session.agenda}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Meeting Link */}
          {session.meeting_link && isUpcoming && (
            <div className="bg-primary/5 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Link da reunião disponível
                </span>
              </div>
            </div>
          )}

          {/* Rating (completed sessions) */}
          {session.status === "completed" && session.rating && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Avaliação:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${
                      star <= session.rating!
                        ? "text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {session.status === "confirmed" && !isPast && (
              <>
                {session.meeting_link && onJoin && (
                  <Button size="sm" onClick={onJoin}>
                    <Video className="h-4 w-4 mr-1" />
                    Entrar
                  </Button>
                )}
                {onCancel && (
                  <Button size="sm" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
              </>
            )}

            {session.status === "in_progress" && isMentor && onComplete && (
              <Button size="sm" onClick={onComplete}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Concluir
              </Button>
            )}

            {onViewDetails && (
              <Button size="sm" variant="ghost" onClick={onViewDetails}>
                Ver Detalhes
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCard;
