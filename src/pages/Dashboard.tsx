import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  GraduationCap,
  MessageSquare,
  FolderOpen,
  Calendar,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import AnimatedStatCard from "@/components/dashboard/AnimatedStatCard";
import QuickAction from "@/components/dashboard/QuickAction";
import EvolutionChart from "@/components/dashboard/EvolutionChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import CompactCalendar from "@/components/dashboard/CompactCalendar";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import { useOnboarding } from "@/hooks/useOnboarding";
import heroImage from "@/assets/hero-health-network.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isActive,
    hasCompleted,
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    startOnboarding,
    nextStep,
    prevStep,
    skipOnboarding,
  } = useOnboarding();

  // Auto-start onboarding for new users
  useEffect(() => {
    if (user && !hasCompleted && !isActive) {
      const timer = setTimeout(() => {
        startOnboarding();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, hasCompleted, isActive, startOnboarding]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="flex">
          {/* Main Content - 2 columns layout */}
          <div className="flex-1 p-6">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl overflow-hidden group mb-6"
            >
              <img
                src={heroImage}
                alt="Rede de Saúde Digital"
                className="w-full h-40 lg:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1B7D4B]/90 via-[#1B7D4B]/70 to-transparent flex items-center">
                <div className="p-6 lg:p-8">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-xl lg:text-2xl font-bold text-white mb-2 tracking-tight"
                  >
                    Núcleo Microrregional de Saúde Digital
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-white/90 max-w-lg text-sm mb-4"
                  >
                    Plataforma integrada para educação permanente, suporte técnico e
                    articulação entre municípios na transformação digital do SUS.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2 shadow-lg bg-white text-[#1B7D4B] hover:bg-white/90"
                      onClick={() => navigate("/municipios")}
                    >
                      Explorar Municípios
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid - 4 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-onboarding="stats">
              <AnimatedStatCard
                title="Municípios Ativos"
                value={0}
                subtitle="na microrregião"
                icon={Building2}
                variant="primary"
                tooltip="Quantidade de municípios participando ativamente do núcleo"
                delay={0.1}
              />
              <AnimatedStatCard
                title="Profissionais Cadastrados"
                value={0}
                subtitle="em formação"
                icon={Users}
                variant="secondary"
                tooltip="Total de profissionais de saúde cadastrados na plataforma"
                delay={0.15}
              />
              <AnimatedStatCard
                title="Cursos Disponíveis"
                value={0}
                subtitle="trilhas formativas"
                icon={GraduationCap}
                variant="accent"
                tooltip="Cursos e trilhas de capacitação disponíveis"
                delay={0.2}
              />
              <AnimatedStatCard
                title="Discussões Ativas"
                value={0}
                subtitle="fóruns temáticos"
                icon={MessageSquare}
                tooltip="Tópicos ativos nos fóruns de discussão"
                delay={0.25}
              />
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              data-onboarding="quick-actions"
              className="mb-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Ações Rápidas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickAction
                  title="Acessar Fóruns"
                  description="Participe das discussões temáticas"
                  icon={MessageSquare}
                  href="/foruns"
                  tooltip="Fóruns de APS, Regulação, Gestão, TI e Inovação"
                />
                <QuickAction
                  title="Iniciar Curso"
                  description="Continue sua trilha de aprendizado"
                  icon={BookOpen}
                  href="/educacao"
                  tooltip="Acesse cursos e trilhas de capacitação"
                />
                <QuickAction
                  title="Materiais de Apoio"
                  description="Tutoriais, manuais e FAQs"
                  icon={FolderOpen}
                  href="/repositorio"
                  tooltip="Biblioteca de materiais e documentos"
                />
                <QuickAction
                  title="Agendar Reunião"
                  description="Próximo encontro do colegiado"
                  icon={Calendar}
                  href="/governanca"
                  tooltip="Calendário do colegiado microrregional"
                />
              </div>
            </motion.div>

            {/* Evolution Chart */}
            <EvolutionChart />
          </div>

          {/* Right Column - Activity Feed & Calendar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden lg:block w-80 xl:w-96 p-6 pl-0 space-y-4"
          >
            <ActivityFeed />
            <CompactCalendar />
          </motion.div>
        </div>
      </div>

      {/* Onboarding Overlay */}
      <OnboardingOverlay
        isActive={isActive}
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        progress={progress}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipOnboarding}
      />
    </MainLayout>
  );
};

export default Dashboard;
