import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Network, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useNucleosMicrorregionais } from "@/hooks/useNucleosMicrorregionais";

const ITEMS_PER_PAGE = 5;

const NMSDTable = () => {
  const navigate = useNavigate();
  const { nucleos, isLoading } = useNucleosMicrorregionais();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredNMSDs = useMemo(() => {
    if (!searchQuery.trim()) return nucleos;
    return nucleos.filter((n) =>
      n.microregiao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.macrorregiao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.urs.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, nucleos]);

  const totalPages = Math.ceil(filteredNMSDs.length / ITEMS_PER_PAGE);
  const paginatedData = filteredNMSDs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-white shadow-layered overflow-hidden h-full min-h-[200px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-xl border border-border bg-white shadow-layered overflow-hidden h-full min-h-[200px] flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Núcleos Microrregionais (NMSD)
            </h3>
          </div>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {filteredNMSDs.length} microrregiões de saúde digital
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar NMSD..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-muted/50 border-border focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Table / Empty State */}
      {paginatedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-10 px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Network className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <h4 className="text-base font-medium text-muted-foreground mb-1">
            Nenhum NMSD encontrado
          </h4>
          <p className="text-[13px] text-muted-foreground/70 max-w-xs mb-5">
            Os Núcleos Microrregionais serão carregados da base de regionalização de MG.
          </p>
          <Button
            onClick={() => navigate("/municipios")}
            className="gap-2 bg-primary hover:bg-primary/90 px-6 py-2.5 h-auto rounded-lg"
          >
            Ver Microrregiões
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Microrregião
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                    Macrorregião
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    URS
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedData.map((nmsd, index) => (
                  <motion.tr
                    key={nmsd.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate("/municipios")}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Network className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors block">
                            NMSD {nmsd.microregiao}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Cód: {nmsd.cod_micro}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {nmsd.macrorregiao}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {nmsd.urs}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={nmsd.is_active 
                          ? "bg-primary/10 text-primary border-primary/20 text-xs font-medium" 
                          : "bg-muted text-muted-foreground border-border text-xs font-medium"
                        }
                      >
                        {nmsd.is_active ? "Ativo" : "Inativo"}
                      </Badge>
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

export default NMSDTable;
