import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, MapPin, Building2, Users, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Municipality {
  id: string;
  name: string;
  population: number;
  professionals: number;
  status: "active" | "pending" | "inactive";
  maturityLevel: number;
}

// Empty state for now - will be populated from database
const municipalities: Municipality[] = [];

const statusConfig = {
  active: { label: "Ativo", className: "bg-primary/10 text-primary border-primary/20" },
  pending: { label: "Pendente", className: "bg-warning/10 text-warning border-warning/20" },
  inactive: { label: "Inativo", className: "bg-muted text-muted-foreground border-border" },
};

const ITEMS_PER_PAGE = 5;

const MunicipalitiesTable = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMunicipalities = useMemo(() => {
    if (!searchQuery.trim()) return municipalities;
    return municipalities.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredMunicipalities.length / ITEMS_PER_PAGE);
  const paginatedData = filteredMunicipalities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-xl border border-border bg-card shadow-layered overflow-hidden h-full min-h-[200px] flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border-b border-border">
        <div>
          <h3 className="text-base font-semibold text-foreground tracking-tight">
            Municípios da Microrregião
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filteredMunicipalities.length} municípios cadastrados
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar município..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-muted/50 border-border focus:bg-card transition-colors"
          />
        </div>
      </div>

      {/* Table / Empty State */}
      {paginatedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-6 px-6 text-center">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-1">
            Nenhum município cadastrado
          </h4>
          <p className="text-xs text-muted-foreground max-w-xs mb-3">
            Os municípios aparecerão aqui após o cadastro.
          </p>
          <Button
            size="sm"
            onClick={() => navigate("/municipios")}
            className="gap-2 h-8 text-xs"
          >
            Cadastrar Município
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Município
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                    População
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    Profissionais
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                    Maturidade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedData.map((municipality, index) => (
                  <motion.tr
                    key={municipality.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate("/municipios")}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {municipality.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {municipality.population.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {municipality.professionals}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={cn("text-xs font-medium", statusConfig[municipality.status].className)}
                      >
                        {statusConfig[municipality.status].label}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${municipality.maturityLevel}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {municipality.maturityLevel}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default MunicipalitiesTable;