import { 
  BarChart3, 
  TrendingUp, 
  Target,
  Users,
  GraduationCap,
  Building2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Progress } from "@/components/ui/progress";

// Empty arrays - data will be populated from backend
const processIndicators: Array<{
  name: string;
  current: number;
  target: number;
  unit: string;
  status: string;
}> = [];

const resultIndicators: Array<{
  name: string;
  current: number;
  target: number;
  unit?: string;
  status: string;
}> = [];

const Indicadores = () => {
  const getStatusColor = (status: string) => {
    return status === "success" ? "text-success" : status === "warning" ? "text-warning" : "text-destructive";
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Indicadores de Monitoramento</h1>
          <p className="text-muted-foreground">
            Acompanhamento de metas e desempenho do núcleo microrregional
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Metas Atingidas</span>
            </div>
            <p className="text-3xl font-bold text-muted-foreground">-/-</p>
            <p className="text-xs text-muted-foreground mt-1">Aguardando dados</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Participantes</span>
            </div>
            <p className="text-3xl font-bold text-muted-foreground">0</p>
            <p className="text-xs text-muted-foreground mt-1">Aguardando cadastro</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Certificações</span>
            </div>
            <p className="text-3xl font-bold text-muted-foreground">0</p>
            <p className="text-xs text-muted-foreground mt-1">emitidas</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Maturidade Média</span>
            </div>
            <p className="text-3xl font-bold text-muted-foreground">--%</p>
            <p className="text-xs text-muted-foreground mt-1">Sem dados</p>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Participation Chart Placeholder */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Evolução de Participantes</h3>
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
              <TrendingUp className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Gráfico de evolução</p>
              <p className="text-xs text-muted-foreground/60">Dados serão exibidos aqui</p>
            </div>
          </div>

          {/* Municipality Maturity Placeholder */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Distribuição de Maturidade</h3>
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
              <BarChart3 className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Gráfico de distribuição</p>
              <p className="text-xs text-muted-foreground/60">Dados serão exibidos aqui</p>
            </div>
          </div>
        </div>

        {/* Process Indicators */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Indicadores de Processo
          </h3>
          {processIndicators.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg bg-muted/20">
              <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum indicador cadastrado</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Configure os indicadores de processo para acompanhamento
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processIndicators.map((indicator) => (
                <div key={indicator.name} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{indicator.name}</span>
                    <span className={`text-sm font-bold ${getStatusColor(indicator.status)}`}>
                      {indicator.current}/{indicator.target} {indicator.unit}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((indicator.current / indicator.target) * 100, 100)} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Result Indicators */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            Indicadores de Resultado
          </h3>
          {resultIndicators.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg bg-muted/20">
              <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum indicador cadastrado</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Configure os indicadores de resultado para acompanhamento
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resultIndicators.map((indicator) => (
                <div key={indicator.name} className="p-4 rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground">{indicator.name}</span>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-2xl font-bold text-foreground">
                      {indicator.current}{indicator.unit || ""}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">
                      meta: {indicator.target}{indicator.unit || ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Indicadores;
