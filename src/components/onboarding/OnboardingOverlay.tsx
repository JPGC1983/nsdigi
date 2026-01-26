import { useEffect, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OnboardingStep } from "@/hooks/useOnboarding";
import { cn } from "@/lib/utils";

interface OnboardingOverlayProps {
  isActive: boolean;
  currentStep: OnboardingStep;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const OnboardingOverlay = ({
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  progress,
  onNext,
  onPrev,
  onSkip,
}: OnboardingOverlayProps) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !currentStep.target) {
      setTargetRect(null);
      return;
    }

    const findTarget = () => {
      const target = document.querySelector(currentStep.target!);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll into view if needed
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setTargetRect(null);
      }
    };

    // Small delay to allow DOM to settle
    const timeout = setTimeout(findTarget, 100);
    
    // Also listen for resize
    window.addEventListener("resize", findTarget);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", findTarget);
    };
  }, [isActive, currentStep]);

  if (!isActive) return null;

  const isCenter = currentStep.position === "center" || !currentStep.target;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const getTooltipPosition = () => {
    if (isCenter || !targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 16;
    const tooltipHeight = 200; // Approximate
    const tooltipWidth = 380;

    switch (currentStep.position) {
      case "bottom":
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case "top":
        return {
          top: `${targetRect.top - tooltipHeight - padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case "left":
        return {
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
        };
      case "right":
        return {
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.right + padding}px`,
        };
      default:
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left}px`,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />
      
      {/* Highlight cutout */}
      {targetRect && !isCenter && (
        <div
          className="absolute bg-transparent ring-4 ring-primary rounded-lg animate-pulse"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "absolute w-[380px] max-w-[calc(100vw-32px)] bg-card rounded-xl shadow-2xl border border-border p-6 animate-scale-in",
          isCenter && "text-center"
        )}
        style={getTooltipPosition()}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onSkip}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Icon for center steps */}
        {isCenter && (
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
        )}

        {/* Content */}
        <h3 className="text-lg font-semibold text-foreground mb-2 pr-8">
          {currentStep.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {currentStep.content}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Passo {currentStepIndex + 1} de {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Pular Tour
          </Button>
          
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button variant="outline" size="sm" onClick={onPrev}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button size="sm" onClick={onNext}>
              {isLastStep ? "Concluir" : "Próximo"}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
