import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  GraduationCap,
  MessageSquare,
  FolderOpen,
  TrendingUp,
  Calendar,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import QuickAction from "@/components/dashboard/QuickAction";
import RecentActivity from "@/components/dashboard/RecentActivity";
import MunicipalityStatus from "@/components/dashboard/MunicipalityStatus";
import heroImage from "@/assets/hero-health-network.jpg";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden group">
          <img
            src={heroImage}
            alt="Rede de Saúde Digital"
            className="w-full h-48 lg:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-transparent flex items-center">
            <div className="p-6 lg:p-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight">
                Núcleo Microrregional de Saúde Digital
              </h1>
              <p className="text-white/90 max-w-xl text-sm lg:text-base mb-4">
                Plataforma integrada para educação permanente, suporte técnico e
                articulação entre municípios na transformação digital do SUS.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 shadow-lg"
                onClick={() => navigate("/municipios")}
              >
                Explorar Municípios
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Municípios Ativos"
            value={0}
            subtitle="na microrregião"
            icon={Building2}
            variant="primary"
            tooltip="Quantidade de municípios participando ativamente do núcleo"
          />
          <StatCard
            title="Profissionais Cadastrados"
            value={0}
            subtitle="aguardando cadastro"
            icon={Users}
            variant="secondary"
            tooltip="Total de profissionais de saúde cadastrados na plataforma"
          />
          <StatCard
            title="Cursos Disponíveis"
            value={0}
            subtitle="trilhas formativas"
            icon={GraduationCap}
            variant="accent"
            tooltip="Cursos e trilhas de capacitação disponíveis"
          />
          <StatCard
            title="Discussões Ativas"
            value={0}
            subtitle="fóruns temáticos"
            icon={MessageSquare}
            tooltip="Tópicos ativos nos fóruns de discussão"
          />
        </div>

        {/* Quick Actions */}
        <div>
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
        <div className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              Indicadores de Desempenho
            </h3>
            <Button variant="link" asChild className="p-0 h-auto">
              <a href="/indicadores">Ver todos →</a>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Meta Atingida
                </span>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">-/-</p>
              <p className="text-xs text-muted-foreground">
                Reuniões do colegiado
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Formações
                </span>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">0h</p>
              <p className="text-xs text-muted-foreground">
                meta anual a definir
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Tempo Resposta
                </span>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">--</p>
              <p className="text-xs text-muted-foreground">média nos fóruns</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
