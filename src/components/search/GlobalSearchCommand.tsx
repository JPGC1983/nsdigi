import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Building2,
  MessageSquare,
  BookOpen,
  FolderOpen,
  FileText,
  Clock,
  X,
  Filter,
  ChevronRight,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface SearchResult {
  id: string;
  type: "curso" | "trilha" | "material" | "forum" | "documento" | "municipio";
  title: string;
  description?: string;
  url: string;
}

interface SearchFilters {
  cursos: boolean;
  trilhas: boolean;
  materiais: boolean;
  foruns: boolean;
  documentos: boolean;
  municipios: boolean;
}

const RECENT_SEARCHES_KEY = "nmsd_recent_searches";
const MAX_RECENT_SEARCHES = 5;

// Mock search results - in production, this would query the database
const mockSearchResults: SearchResult[] = [
  { id: "1", type: "curso", title: "e-SUS AB - Módulo Básico", description: "Capacitação inicial para o sistema e-SUS Atenção Básica", url: "/educacao" },
  { id: "2", type: "curso", title: "e-SUS Regulação Avançado", description: "Módulo avançado de regulação", url: "/educacao" },
  { id: "3", type: "trilha", title: "Trilha de Informatização", description: "Percurso completo de informatização", url: "/educacao" },
  { id: "4", type: "material", title: "Manual do e-SUS AB v5.3", description: "Documentação oficial", url: "/repositorio" },
  { id: "5", type: "forum", title: "Dúvidas sobre CDS", description: "Coleta de Dados Simplificada", url: "/foruns" },
  { id: "6", type: "documento", title: "Portaria GM/MS 1.434/2020", description: "Legislação do e-SUS", url: "/governanca" },
  { id: "7", type: "municipio", title: "Belo Horizonte", description: "Capital de Minas Gerais", url: "/municipios" },
];

const typeIcons: Record<SearchResult["type"], typeof BookOpen> = {
  curso: BookOpen,
  trilha: BookOpen,
  material: FolderOpen,
  forum: MessageSquare,
  documento: FileText,
  municipio: Building2,
};

const typeLabels: Record<SearchResult["type"], string> = {
  curso: "Curso",
  trilha: "Trilha",
  material: "Material",
  forum: "Fórum",
  documento: "Documento",
  municipio: "Município",
};

const typeColors: Record<SearchResult["type"], string> = {
  curso: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  trilha: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  material: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  forum: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  documento: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  municipio: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

interface GlobalSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GlobalSearchCommand = ({ open, onOpenChange }: GlobalSearchCommandProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    cursos: true,
    trilhas: true,
    materiais: true,
    foruns: true,
    documentos: true,
    municipios: true,
  });

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recent searches:", e);
      }
    }
  }, []);

  // Filter and search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = mockSearchResults.filter((item) => {
      // Check type filter
      const typeFilterMap: Record<SearchResult["type"], keyof SearchFilters> = {
        curso: "cursos",
        trilha: "trilhas",
        material: "materiais",
        forum: "foruns",
        documento: "documentos",
        municipio: "municipios",
      };
      
      if (!filters[typeFilterMap[item.type]]) return false;

      // Check text match
      return (
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
      );
    });

    setResults(filtered);
  }, [query, filters]);

  const saveRecentSearch = useCallback((searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  const handleSelect = (result: SearchResult) => {
    saveRecentSearch(result.title);
    navigate(result.url);
    onOpenChange(false);
    setQuery("");
  };

  const handleRecentSearch = (term: string) => {
    setQuery(term);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  const allFiltersActive = activeFiltersCount === 6;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Buscar cursos, materiais, fóruns, municípios..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setQuery("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-2 gap-1">
              <Filter className="h-4 w-4" />
              {!allFiltersActive && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.cursos}
              onCheckedChange={(checked) => setFilters(f => ({ ...f, cursos: checked }))}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Cursos
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.trilhas}
              onCheckedChange={(checked) => setFilters(f => ({ ...f, trilhas: checked }))}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Trilhas Formativas
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.materiais}
              onCheckedChange={(checked) => setFilters(f => ({ ...f, materiais: checked }))}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Materiais
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.foruns}
              onCheckedChange={(checked) => setFilters(f => ({ ...f, foruns: checked }))}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Fóruns
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.documentos}
              onCheckedChange={(checked) => setFilters(f => ({ ...f, documentos: checked }))}
            >
              <FileText className="h-4 w-4 mr-2" />
              Documentos
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.municipios}
              onCheckedChange={(checked) => setFilters(f => ({ ...f, municipios: checked }))}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Municípios
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <CommandList>
        <CommandEmpty>
          {query.length < 2 
            ? "Digite pelo menos 2 caracteres para buscar..." 
            : "Nenhum resultado encontrado."}
        </CommandEmpty>

        {/* Recent searches */}
        {query.length < 2 && recentSearches.length > 0 && (
          <CommandGroup heading={
            <div className="flex items-center justify-between">
              <span>Buscas Recentes</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-muted-foreground"
                onClick={clearRecentSearches}
              >
                Limpar
              </Button>
            </div>
          }>
            {recentSearches.map((term, index) => (
              <CommandItem
                key={index}
                onSelect={() => handleRecentSearch(term)}
                className="cursor-pointer"
              >
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{term}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Search results grouped by type */}
        {query.length >= 2 && results.length > 0 && (
          <>
            {(["curso", "trilha", "material", "forum", "documento", "municipio"] as const).map((type) => {
              const typeResults = results.filter(r => r.type === type);
              if (typeResults.length === 0) return null;
              
              const Icon = typeIcons[type];
              
              return (
                <CommandGroup key={type} heading={typeLabels[type] + "s"}>
                  {typeResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="cursor-pointer"
                    >
                      <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{result.title}</span>
                          <Badge className={`text-xs ${typeColors[result.type]}`}>
                            {typeLabels[result.type]}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </>
        )}

        {/* Quick navigation */}
        {query.length < 2 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Navegação Rápida">
              <CommandItem onSelect={() => { navigate("/educacao"); onOpenChange(false); }}>
                <BookOpen className="h-4 w-4 mr-2" />
                Educação Permanente
              </CommandItem>
              <CommandItem onSelect={() => { navigate("/foruns"); onOpenChange(false); }}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Fóruns de Discussão
              </CommandItem>
              <CommandItem onSelect={() => { navigate("/repositorio"); onOpenChange(false); }}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Repositório de Materiais
              </CommandItem>
              <CommandItem onSelect={() => { navigate("/municipios"); onOpenChange(false); }}>
                <Building2 className="h-4 w-4 mr-2" />
                Municípios
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>

      <div className="border-t p-2 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex gap-2">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
          <span>navegar</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
          <span>selecionar</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">esc</kbd>
          <span>fechar</span>
        </div>
        <Button 
          variant="link" 
          size="sm" 
          className="h-auto p-0 text-xs"
          onClick={() => { navigate("/busca-avancada"); onOpenChange(false); }}
        >
          Busca Avançada →
        </Button>
      </div>
    </CommandDialog>
  );
};

export default GlobalSearchCommand;
