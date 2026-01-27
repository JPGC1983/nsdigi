import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MunicipioFilters as FilterType } from "@/hooks/useMunicipios";

interface MunicipioFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  filterOptions?: {
    microrregioes: string[];
    ursList: string[];
    macrorregioes: string[];
  };
}

export const MunicipioFilters = ({
  filters,
  onFiltersChange,
  filterOptions,
}: MunicipioFiltersProps) => {
  const hasActiveFilters = 
    filters.status || 
    filters.microregiao || 
    filters.urs || 
    filters.macrorregiao;

  const clearFilters = () => {
    onFiltersChange({ search: filters.search });
  };

  return (
    <div className="space-y-4">
      {/* Search and main filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código IBGE..."
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="em_implantacao">Em Implantação</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.macrorregiao || "all"}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, macrorregiao: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Macrorregião" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as macrorregiões</SelectItem>
            {filterOptions?.macrorregioes.map((macro) => (
              <SelectItem key={macro} value={macro}>
                {macro}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.microregiao || "all"}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, microregiao: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Microrregião" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as microrregiões</SelectItem>
            {filterOptions?.microrregioes.map((micro) => (
              <SelectItem key={micro} value={micro}>
                {micro}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.urs || "all"}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, urs: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="URS" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as URS</SelectItem>
            {filterOptions?.ursList.map((urs) => (
              <SelectItem key={urs} value={urs}>
                {urs}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
};

export default MunicipioFilters;
