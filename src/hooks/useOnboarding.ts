import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

const ONBOARDING_KEY = "nmsd_onboarding_completed";
const ONBOARDING_STEP_KEY = "nmsd_onboarding_step";

export interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting
  position?: "top" | "bottom" | "left" | "right" | "center";
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao NMSD!",
    content: "Seu hub de educação permanente e governança digital. Vamos explorar as principais funcionalidades em poucos passos.",
    position: "center",
  },
  {
    id: "stats",
    title: "Acompanhe suas Métricas",
    content: "Aqui você visualiza: municípios ativos, profissionais cadastrados, cursos disponíveis e discussões em andamento.",
    target: "[data-onboarding='stats']",
    position: "bottom",
  },
  {
    id: "quick-actions",
    title: "Ações Rápidas",
    content: "Acesse rapidamente os principais módulos: Fóruns, Cursos, Materiais de Apoio e Agendamento de Reuniões.",
    target: "[data-onboarding='quick-actions']",
    position: "bottom",
  },
  {
    id: "municipalities",
    title: "Municípios da Microrregião",
    content: "Visualize o status de maturidade digital de cada município e acompanhe a evolução da região.",
    target: "[data-onboarding='municipalities']",
    position: "top",
  },
  {
    id: "search",
    title: "Busca Global",
    content: "Use a busca para encontrar cursos, materiais, fóruns e municípios rapidamente. Experimente filtros avançados!",
    target: "[data-onboarding='search']",
    position: "bottom",
  },
  {
    id: "notifications",
    title: "Notificações",
    content: "Fique por dentro de novos cursos, respostas em fóruns, reuniões agendadas e muito mais.",
    target: "[data-onboarding='notifications']",
    position: "bottom",
  },
  {
    id: "complete",
    title: "Pronto para começar!",
    content: "Você pode retomar este tour a qualquer momento nas Configurações. Explore a plataforma e bom trabalho!",
    position: "center",
  },
];

export const useOnboarding = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(true);

  // Check if onboarding has been completed
  useEffect(() => {
    if (user) {
      const completed = localStorage.getItem(`${ONBOARDING_KEY}_${user.id}`);
      const savedStep = localStorage.getItem(`${ONBOARDING_STEP_KEY}_${user.id}`);
      
      if (completed === "true") {
        setHasCompleted(true);
        setIsActive(false);
      } else {
        setHasCompleted(false);
        // Check if we should auto-start for new users
        if (savedStep !== null) {
          setCurrentStepIndex(parseInt(savedStep, 10));
        }
      }
    }
  }, [user]);

  const startOnboarding = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
    setHasCompleted(false);
    if (user) {
      localStorage.removeItem(`${ONBOARDING_KEY}_${user.id}`);
      localStorage.setItem(`${ONBOARDING_STEP_KEY}_${user.id}`, "0");
    }
  }, [user]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < onboardingSteps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      if (user) {
        localStorage.setItem(`${ONBOARDING_STEP_KEY}_${user.id}`, newIndex.toString());
      }
    } else {
      completeOnboarding();
    }
  }, [currentStepIndex, user]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      if (user) {
        localStorage.setItem(`${ONBOARDING_STEP_KEY}_${user.id}`, newIndex.toString());
      }
    }
  }, [currentStepIndex, user]);

  const skipOnboarding = useCallback(() => {
    completeOnboarding();
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsActive(false);
    setHasCompleted(true);
    if (user) {
      localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, "true");
      localStorage.removeItem(`${ONBOARDING_STEP_KEY}_${user.id}`);
    }
  }, [user]);

  const resetOnboarding = useCallback(() => {
    if (user) {
      localStorage.removeItem(`${ONBOARDING_KEY}_${user.id}`);
      localStorage.removeItem(`${ONBOARDING_STEP_KEY}_${user.id}`);
    }
    setHasCompleted(false);
    setCurrentStepIndex(0);
  }, [user]);

  const currentStep = onboardingSteps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / onboardingSteps.length) * 100;

  return {
    isActive,
    hasCompleted,
    currentStep,
    currentStepIndex,
    totalSteps: onboardingSteps.length,
    progress,
    startOnboarding,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
};
