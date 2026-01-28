import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  GraduationCap,
  MessageSquare,
  FolderOpen,
  Calendar,
  BookOpen,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import HeroBanner from "@/components/dashboard/HeroBanner";
import MetricCard from "@/components/dashboard/MetricCard";
import QuickAction from "@/components/dashboard/QuickAction";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import MunicipalitiesTable from "@/components/dashboard/MunicipalitiesTable";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/hooks/useAuth";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
  },
};

const Dashboard = () => {
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-6"
      >
        {/* Hero Banner */}
        <motion.div variants={itemVariants}>
          <HeroBanner />
        </motion.div>

        {/* Stats Row - 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <motion.div
          variants={itemVariants}
          data-onboarding="stats"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <MetricCard
            title="Municípios Ativos"
            value={0}
            subtitle="no NMSD"
            icon={Building2}
            delay={0.1}
          />
          <MetricCard
            title="Profissionais"
            value={0}
            subtitle="em formação"
            icon={Users}
            delay={0.15}
          />
          <MetricCard
            title="Cursos Disponíveis"
            value={0}
            subtitle="trilhas formativas"
            icon={GraduationCap}
            delay={0.2}
          />
          <MetricCard
            title="Discussões Ativas"
            value={0}
            subtitle="fóruns temáticos"
            icon={MessageSquare}
            delay={0.25}
          />
        </motion.div>

        {/* Quick Actions - 4 columns */}
        <motion.div variants={itemVariants} data-onboarding="quick-actions">
          <h2 className="text-lg font-semibold text-foreground mb-4 tracking-tight">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              title="Acessar Fóruns"
              description="Participe das discussões"
              icon={MessageSquare}
              href="/foruns"
              tooltip="Fóruns temáticos"
            />
            <QuickAction
              title="Iniciar Curso"
              description="Continue aprendendo"
              icon={BookOpen}
              href="/educacao"
              tooltip="Cursos e trilhas"
            />
            <QuickAction
              title="Materiais"
              description="Tutoriais e manuais"
              icon={FolderOpen}
              href="/repositorio"
              tooltip="Biblioteca de materiais"
            />
            <QuickAction
              title="Agendar Reunião"
              description="Colegiado regional"
              icon={Calendar}
              href="/governanca"
              tooltip="Calendário do colegiado"
            />
          </div>
        </motion.div>

        {/* Bottom Section - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Municipalities Table - Takes 2/3 */}
          <motion.div variants={itemVariants} data-onboarding="municipalities" className="lg:col-span-2">
            <MunicipalitiesTable />
          </motion.div>

          {/* Activity Feed - Takes 1/3 */}
          <motion.div variants={itemVariants}>
            <ActivityFeed />
          </motion.div>
        </div>
      </motion.div>

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
