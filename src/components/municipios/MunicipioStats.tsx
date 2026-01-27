interface MunicipioStatsProps {
  stats: {
    total: number;
    ativos: number;
    pendentes: number;
    emImplantacao: number;
    inativos: number;
    maturidadeMedia: number;
  };
}

export const MunicipioStats = ({ stats }: MunicipioStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Total</p>
        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
      </div>
      <div className="rounded-lg border border-success/20 bg-success/5 p-4">
        <p className="text-sm text-muted-foreground">Ativos</p>
        <p className="text-2xl font-bold text-success">{stats.ativos}</p>
      </div>
      <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
        <p className="text-sm text-muted-foreground">Em Implantação</p>
        <p className="text-2xl font-bold text-warning">{stats.emImplantacao}</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Pendentes</p>
        <p className="text-2xl font-bold text-muted-foreground">{stats.pendentes}</p>
      </div>
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm text-muted-foreground">Inativos</p>
        <p className="text-2xl font-bold text-destructive">{stats.inativos}</p>
      </div>
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">Maturidade Média</p>
        <p className="text-2xl font-bold text-primary">{stats.maturidadeMedia}%</p>
      </div>
    </div>
  );
};

export default MunicipioStats;
