import { MapPin, TrendingUp, AlertCircle, CheckCircle, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Municipality {
  id: string;
  name: string;
  maturityLevel: number;
  status: "active" | "pending" | "attention";
  professionals: number;
}

// Empty array - data will be populated from backend
const municipalities: Municipality[] = [];

const statusConfig = {
  active: { icon: CheckCircle, color: "text-success", label: "Ativo" },
  pending: { icon: TrendingUp, color: "text-warning", label: "Em progresso" },
  attention: { icon: AlertCircle, color: "text-destructive", label: "Atenção" },
};

const MunicipalityStatus = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Municípios da Microrregião</h3>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
          {municipalities.length} municípios
        </span>
      </div>
      {municipalities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum município cadastrado</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Adicione os municípios da microrregião
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {municipalities.map((municipality) => {
            const StatusIcon = statusConfig[municipality.status].icon;
            return (
              <div
                key={municipality.id}
                className="group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {municipality.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn("h-4 w-4", statusConfig[municipality.status].color)} />
                    <span className="text-xs text-muted-foreground">
                      {municipality.professionals} profissionais
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={municipality.maturityLevel} className="flex-1 h-2" />
                  <span className="text-xs font-medium text-foreground w-10">
                    {municipality.maturityLevel}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MunicipalityStatus;
