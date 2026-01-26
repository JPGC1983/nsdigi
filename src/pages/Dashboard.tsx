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
import SparklineCard from "@/components/dashboard/SparklineCard";
import QuickAction from "@/components/dashboard/QuickAction";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

import MunicipalitiesTable from "@/components/dashboard/MunicipalitiesTable";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import { useOnboarding } from "@/hooks/useOnboarding";
import heroImage from "@/assets/hero-health-network.jpg";
import { Button } from "@/components/ui/button";
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

  // Empty sparkline data for now
  const emptySparkline: { value: number }[] = [];

  return (
    <MainLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-6"
      >
        {/* Hero Section - More Compact */}
        <motion.div
          variants={itemVariants}
          className="relative rounded-2xl overflow-hidden group"
        >
          <img
            src={heroImage}
            alt="Rede de Saúde Digital"
            className="w-full h-32 lg:h-40 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-transparent flex items-center">
            <div className="p-5 lg:p-6">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-lg lg:text-xl font-bold text-card mb-1 tracking-tight"
              >
                Núcleo Microrregional de Saúde Digital
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-card/80 max-w-md text-xs lg:text-sm mb-3"
              >
                Plataforma integrada para educação permanente e transformação digital do SUS.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Button
                  size="sm"
                  className="gap-2 shadow-layered-lg bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs"
                  onClick={() => navigate("/municipios")}
                >
                  Explorar Municípios
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row - 4 columns on desktop */}
        <motion.div
          variants={itemVariants}
          data-onboarding="stats"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <SparklineCard
            title="Municípios Ativos"
            value={0}
            subtitle="na microrregião"
            icon={Building2}
            sparklineData={emptySparkline}
            delay={0.1}
          />
          <SparklineCard
            title="Profissionais"
            value={0}
            subtitle="em formação"
            icon={Users}
            sparklineData={emptySparkline}
            delay={0.15}
          />
          <SparklineCard
            title="Cursos Disponíveis"
            value={0}
            subtitle="trilhas formativas"
            icon={GraduationCap}
            sparklineData={emptySparkline}
            delay={0.2}
          />
          <SparklineCard
            title="Discussões Ativas"
            value={0}
            subtitle="fóruns temáticos"
            icon={MessageSquare}
            sparklineData={emptySparkline}
            delay={0.25}
          />
        </motion.div>

        {/* Quick Actions - Inline Row */}
        <motion.div variants={itemVariants} data-onboarding="quick-actions">
          <h2 className="text-sm font-semibold text-foreground mb-3 tracking-tight">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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