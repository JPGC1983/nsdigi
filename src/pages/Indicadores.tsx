import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  Users,
  GraduationCap,
  MessageSquare,
  Building2,
  Clock,
  CheckCircle,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const processIndicators = [
  { name: "Reuniões do Colegiado", current: 6, target: 6, unit: "reuniões", status: "success" },
  { name: "Cursos Ofertados", current: 10, target: 12, unit: "cursos", status: "warning" },
  { name: "Horas de Formação", current: 124, target: 100, unit: "horas", status: "success" },
  { name: "Fóruns Ativos", current: 5, target: 5, unit: "fóruns", status: "success" },
  { name: "Materiais no Repositório", current: 48, target: 50, unit: "materiais", status: "warning" },
  { name: "Profissionais Cadastrados", current: 70, target: 80, unit: "%", status: "warning" },
];

const resultIndicators = [
  { name: "Participantes em Formações", current: 312, target: 300, status: "success" },
  { name: "Taxa Participação Municípios", current: 85, target: 80, unit: "%", status: "success" },
  { name: "Conclusão de Cursos", current: 42, target: 40, unit: "%", status: "success" },
  { name: "Satisfação", current: 87, target: 80, unit: "%", status: "success" },
  { name: "Tempo Resposta Fóruns", current: 48, target: 72, unit: "h", status: "success" },
];

const monthlyData = [
  { month: "Jul", participantes: 45, cursos: 2 },
  { month: "Ago", participantes: 78, cursos: 3 },
  { month: "Set", participantes: 92, cursos: 2 },
  { month: "Out", participantes: 120, cursos: 4 },
  { month: "Nov", participantes: 156, cursos: 3 },
  { month: "Dez", participantes: 189, cursos: 2 },
  { month: "Jan", participantes: 234, cursos: 3 },
];

const municipalityMaturity = [
  { name: "Iniciante (0-40%)", value: 2, color: "#ef4444" },
  { name: "Em Desenvolvimento (41-60%)", value: 3, color: "#f59e0b" },
  { name: "Maduro (61-80%)", value: 4, color: "#22c55e" },
  { name: "Avançado (81-100%)", value: 3, color: "#0ea5e9" },
];

const Indicadores = () => {
  const getStatusColor = (status: string) => {
    return status === "success" ? "text-success" : status === "warning" ? "text-warning" : "text-destructive";
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return "bg-success";
    if (percentage >= 80) return "bg-warning";
    return "bg-destructive";
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
          <div className="rounded-xl border border-success/20 bg-success/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-foreground">Metas Atingidas</span>
            </div>
            <p className="text-3xl font-bold text-success">8/11</p>
            <p className="text-xs text-muted-foreground mt-1">73% das metas</p>
          </div>
          <div className="rounded-xl border border-info/20 bg-info/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-info" />
              <span className="text-sm font-medium text-foreground">Participantes</span>
            </div>
            <p className="text-3xl font-bold text-info">847</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" /> +12% este mês
            </p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Certificações</span>
            </div>
            <p className="text-3xl font-bold text-primary">356</p>
            <p className="text-xs text-muted-foreground mt-1">emitidas este ano</p>
          </div>
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-foreground">Maturidade Média</span>
            </div>
            <p className="text-3xl font-bold text-accent">58%</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" /> +5% vs. semestre
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Participation Chart */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Evolução de Participantes</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="participantes" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Municipality Maturity Pie */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Distribuição de Maturidade</h3>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={municipalityMaturity}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {municipalityMaturity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {municipalityMaturity.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium text-foreground ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Process Indicators */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Indicadores de Processo
          </h3>
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
        </div>

        {/* Result Indicators */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            Indicadores de Resultado
          </h3>
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
                  {indicator.current >= indicator.target ? (
                    <TrendingUp className="h-4 w-4 text-success mb-1 ml-auto" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-warning mb-1 ml-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Indicadores;
