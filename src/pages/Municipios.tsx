import { useState } from "react";
import { Search, MapPin, Users, TrendingUp, Filter, Plus, Building2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Municipality {
  id: string;
  name: string;
  population: number;
  professionals: number;
  maturityLevel: number;
  status: "ativo" | "em_implantacao" | "pendente";
  lastUpdate: string;
  coordinator: string;
}

// Empty array - data will be populated from backend
const municipalities: Municipality[] = [];

const statusConfig = {
  ativo: { label: "Ativo", variant: "default" as const, className: "bg-success/10 text-success border-success/20" },
  em_implantacao: { label: "Em Implantação", variant: "secondary" as const, className: "bg-warning/10 text-warning border-warning/20" },
  pendente: { label: "Pendente", variant: "outline" as const, className: "bg-muted text-muted-foreground" },
};

const Municipios = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMunicipalities = municipalities.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = municipalities.filter((m) => m.status === "ativo").length;
  const implantationCount = municipalities.filter((m) => m.status === "em_implantacao").length;
  const avgMaturity = municipalities.length > 0 
    ? Math.round(municipalities.reduce((acc, m) => acc + m.maturityLevel, 0) / municipalities.length)
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header with Breadcrumbs */}
        <div className="space-y-4">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">Início</a>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground font-medium">Municípios</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Municípios</h1>
              <p className="text-muted-foreground">
                Gestão e acompanhamento dos municípios da microrregião
              </p>
            </div>
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              Adicionar Município
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar município..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="em_implantacao">Em Implantação</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total de Municípios</p>
            <p className="text-2xl font-bold text-foreground">{municipalities.length}</p>
          </div>
          <div className="rounded-lg border border-success/20 bg-success/5 p-4">
            <p className="text-sm text-muted-foreground">Ativos</p>
            <p className="text-2xl font-bold text-success">{activeCount}</p>
          </div>
          <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
            <p className="text-sm text-muted-foreground">Em Implantação</p>
            <p className="text-2xl font-bold text-warning">{implantationCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Maturidade Média</p>
            <p className="text-2xl font-bold text-foreground">{avgMaturity}%</p>
          </div>
        </div>

        {/* Municipality Cards or Empty State */}
        {filteredMunicipalities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum município cadastrado
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Adicione os municípios que compõem a microrregião para começar o acompanhamento da maturidade digital.
            </p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Primeiro Município
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMunicipalities.map((municipality) => (
              <div
                key={municipality.id}
                className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {municipality.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Pop: {municipality.population.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusConfig[municipality.status].className}>
                    {statusConfig[municipality.status].label}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Profissionais
                    </span>
                    <span className="font-medium text-foreground">{municipality.professionals}</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Maturidade Digital
                      </span>
                      <span className="font-medium text-foreground">{municipality.maturityLevel}%</span>
                    </div>
                    <Progress value={municipality.maturityLevel} className="h-2" />
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Coordenador: {municipality.coordinator}</span>
                    <span className="text-muted-foreground/60">
                      Atualizado: {new Date(municipality.lastUpdate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Municipios;
