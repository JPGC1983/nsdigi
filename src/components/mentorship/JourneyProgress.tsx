import { CheckCircle, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { JourneyPhase, JOURNEY_PHASE_CONFIG } from "@/types/mentorship";

interface JourneyProgressProps {
  currentPhase: JourneyPhase;
  phaseProgress: number;
  compact?: boolean;
}

const PHASES: JourneyPhase[] = ["diagnostic", "practical", "evaluation"];

const JourneyProgress = ({
  currentPhase,
  phaseProgress,
  compact = false,
}: JourneyProgressProps) => {
  const currentIndex = PHASES.indexOf(currentPhase);
  
  const getPhaseStatus = (phase: JourneyPhase) => {
    const phaseIndex = PHASES.indexOf(phase);
    if (phaseIndex < currentIndex) return "completed";
    if (phaseIndex === currentIndex) return "current";
    return "pending";
  };

  const overallProgress = ((currentIndex + phaseProgress / 100) / PHASES.length) * 100;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {JOURNEY_PHASE_CONFIG[currentPhase].icon} {JOURNEY_PHASE_CONFIG[currentPhase].label}
          </span>
          <span className="text-muted-foreground">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progresso Geral da Jornada</span>
          <span className="text-muted-foreground">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </div>

      {/* Phase Timeline */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />

        <div className="space-y-4">
          {PHASES.map((phase, index) => {
            const config = JOURNEY_PHASE_CONFIG[phase];
            const status = getPhaseStatus(phase);
            const isLast = index === PHASES.length - 1;

            return (
              <div key={phase} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className={`
                    relative z-10 h-12 w-12 rounded-full flex items-center justify-center
                    text-xl border-2 transition-all
                    ${
                      status === "completed"
                        ? "bg-green-100 border-green-500 text-green-600"
                        : status === "current"
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted border-border text-muted-foreground"
                    }
                  `}
                >
                  {status === "completed" ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    config.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`font-semibold ${
                        status === "current"
                          ? "text-primary"
                          : status === "completed"
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {config.label}
                    </h4>
                    {status === "current" && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Em andamento
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {config.description}
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    Duração: {config.duration}
                  </p>

                  {/* Phase Progress (only for current) */}
                  {status === "current" && (
                    <div className="mt-3">
                      <Progress value={phaseProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {phaseProgress}% concluído
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JourneyProgress;
