import { Building2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { useMunicipios } from "@/hooks/useMunicipios";
import MunicipioCard from "@/components/municipios/MunicipioCard";
import MunicipioFilters from "@/components/municipios/MunicipioFilters";
import MunicipioStats from "@/components/municipios/MunicipioStats";
import { Skeleton } from "@/components/ui/skeleton";

const Municipios = () => {
  const {
    municipios,
    isLoading,
    filters,
    setFilters,
    filterOptions,
    updateMunicipio,
    stats,
    canEdit,
  } = useMunicipios();

  const handleUpdate = (id: string, data: Parameters<typeof updateMunicipio.mutate>[0]["data"]) => {
    updateMunicipio.mutate({ id, data });
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Municípios por NMSD"
          description="Gestão dos municípios vinculados aos Núcleos Microrregionais de Saúde Digital (NMSD) de Minas Gerais"
          breadcrumbs={[{ label: "Municípios" }]}
        />

        {/* Statistics */}
        <MunicipioStats stats={stats} />

        {/* Filters */}
        <MunicipioFilters
          filters={filters}
          onFiltersChange={setFilters}
          filterOptions={filterOptions}
        />

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : municipios.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Nenhum município encontrado"
            description={
              filters.search || filters.status || filters.microregiao || filters.urs || filters.macrorregiao
                ? "Nenhum município corresponde aos filtros selecionados. Tente ajustar os critérios de busca."
                : "Os municípios serão carregados a partir da base de dados de regionalização de Minas Gerais."
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {municipios.map((municipio) => (
              <MunicipioCard
                key={municipio.id}
                municipio={municipio}
                onUpdate={handleUpdate}
                canEdit={canEdit}
                showCoordinatorData={canEdit} // Apenas admin/coordenador vê dados do coordenador
              />
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && municipios.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Exibindo {municipios.length} de {stats.total} municípios
          </p>
        )}
      </div>
    </MainLayout>
  );
};

export default Municipios;