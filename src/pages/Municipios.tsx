import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { useMunicipios, type MunicipioFilters as Filters } from "@/hooks/useMunicipios";
import MunicipioCard from "@/components/municipios/MunicipioCard";
import MunicipioFilters from "@/components/municipios/MunicipioFilters";
import MunicipioStats from "@/components/municipios/MunicipioStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

const Municipios = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [page, setPage] = useState(1);

  // Abrir já filtrado quando vier do Dashboard (?microrregiao=...)
  const microParam = searchParams.get("microrregiao");
  useEffect(() => {
    if (microParam && filters.microregiao !== microParam) {
      setFilters((f) => ({ ...f, microregiao: microParam }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microParam]);

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setPage(1);
    if (microParam && next.microregiao !== microParam) {
      const params = new URLSearchParams(searchParams);
      if (next.microregiao) params.set("microrregiao", next.microregiao);
      else params.delete("microrregiao");
      setSearchParams(params, { replace: true });
    }
  };

  const totalPages = Math.max(1, Math.ceil(municipios.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => municipios.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [municipios, currentPage]
  );

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = (id: string, data: Parameters<typeof updateMunicipio.mutate>[0]["data"]) => {
    updateMunicipio.mutate({ id, data });
  };

  const breadcrumbs = filters.microregiao
    ? [{ label: "Municípios", href: "/municipios" }, { label: `NMSD ${filters.microregiao}` }]
    : [{ label: "Municípios" }];

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title={filters.microregiao ? `Municípios do NMSD ${filters.microregiao}` : "Municípios por NMSD"}
          description="Gestão dos municípios vinculados aos Núcleos Microrregionais de Saúde Digital (NMSD) de Minas Gerais"
          breadcrumbs={breadcrumbs}
        />

        <MunicipioStats stats={stats} />

        <MunicipioFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          filterOptions={filterOptions}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" aria-busy="true" aria-label="Carregando municípios">
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
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pageItems.map((municipio) => (
                <MunicipioCard
                  key={municipio.id}
                  municipio={municipio}
                  onUpdate={handleUpdate}
                  canEdit={canEdit}
                  showCoordinatorData={canEdit}
                />
              ))}
            </div>

            <nav
              className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2"
              aria-label="Paginação de municípios"
            >
              <p className="text-sm text-muted-foreground">
                Exibindo {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, municipios.length)} de{" "}
                {municipios.length} municípios
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goTo(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground px-2" aria-current="page">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goTo(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Próxima página"
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </nav>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Municipios;
