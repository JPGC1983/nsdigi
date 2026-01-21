import {
  Building2,
  Users,
  GraduationCap,
  MessageSquare,
  FolderOpen,
  TrendingUp,
  Calendar,
  BookOpen,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import QuickAction from "@/components/dashboard/QuickAction";
import RecentActivity from "@/components/dashboard/RecentActivity";
import MunicipalityStatus from "@/components/dashboard/MunicipalityStatus";
import heroImage from "@/assets/hero-health-network.jpg";

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden">
          <img 
            src={heroImage} 
            alt="Rede de Saúde Digital" 
            className="w-full h-48 lg:h-56 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/40 flex items-center">
            <div className="p-6 lg:p-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Núcleo Microrregional de Saúde Digital
              </h1>
              <p className="text-white/80 max-w-xl text-sm lg:text-base">
                Plataforma integrada para educação permanente, suporte técnico e articulação 
                entre municípios na transformação digital do SUS.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Municípios Ativos"
            value={12}
            subtitle="de 15 na microrregião"
            icon={Building2}
            variant="primary"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Profissionais Cadastrados"
            value={847}
            subtitle="70% da microrregião"
            icon={Users}
            variant="secondary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Cursos Disponíveis"
            value={24}
            subtitle="8 trilhas formativas"
            icon={GraduationCap}
            variant="accent"
          />
          <StatCard
            title="Discussões Ativas"
            value={38}
            subtitle="5 fóruns temáticos"
            icon={MessageSquare}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              title="Acessar Fóruns"
              description="Participe das discussões temáticas"
              icon={MessageSquare}
            />
            <QuickAction
              title="Iniciar Curso"
              description="Continue sua trilha de aprendizado"
              icon={BookOpen}
            />
            <QuickAction
              title="Materiais de Apoio"
              description="Tutoriais, manuais e FAQs"
              icon={FolderOpen}
            />
            <QuickAction
              title="Agendar Reunião"
              description="Próximo encontro do colegiado"
              icon={Calendar}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Municipality Status - Takes 2 columns */}
          <div className="lg:col-span-2">
            <MunicipalityStatus />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>

        {/* Indicators Preview */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Indicadores de Desempenho</h3>
            <a href="/indicadores" className="text-sm text-primary hover:underline">
              Ver todos →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-foreground">Meta Atingida</span>
              </div>
              <p className="text-2xl font-bold text-success">6/6</p>
              <p className="text-xs text-muted-foreground">Reuniões do colegiado</p>
            </div>
            <div className="p-4 rounded-lg bg-info/5 border border-info/20">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-info" />
                <span className="text-sm font-medium text-foreground">Formações</span>
              </div>
              <p className="text-2xl font-bold text-info">124h</p>
              <p className="text-xs text-muted-foreground">de 100h meta anual</p>
            </div>
            <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-foreground">Tempo Resposta</span>
              </div>
              <p className="text-2xl font-bold text-warning">48h</p>
              <p className="text-xs text-muted-foreground">média nos fóruns (meta: 72h)</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
