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
        className="min-h-screen"
      >
        {/* Hero Section */}
        <motion.div
          variants={itemVariants}
          className="relative rounded-2xl overflow-hidden group mb-6"
        >
          <img
            src={heroImage}
            alt="Rede de Saúde Digital"
            className="w-full h-40 lg:h-48 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-transparent flex items-center">
            <div className="p-6 lg:p-8">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-xl lg:text-2xl font-bold text-card mb-2 tracking-tight"
              >
                Núcleo Microrregional de Saúde Digital
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-card/80 max-w-lg text-sm mb-4"
              >
                Plataforma integrada para educação permanente, suporte técnico e
                articulação entre municípios na transformação digital do SUS.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Button
                  size="sm"
                  className="gap-2 shadow-layered-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => navigate("/municipios")}
                >
                  Explorar Municípios
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bento Grid - Stats */}
            <motion.div
              variants={itemVariants}
              data-onboarding="stats"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
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

            {/* Quick Actions */}
            <motion.div variants={itemVariants} data-onboarding="quick-actions">
              <h2 className="text-base font-semibold text-foreground mb-4 tracking-tight">
                Ações Rápidas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

            {/* Municipalities Table */}
            <motion.div variants={itemVariants} data-onboarding="municipalities">
              <MunicipalitiesTable />
            </motion.div>
          </div>

          {/* Right Column - Activity Feed & Calendar */}
          <motion.div
            variants={itemVariants}
            className="space-y-4"
          >
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