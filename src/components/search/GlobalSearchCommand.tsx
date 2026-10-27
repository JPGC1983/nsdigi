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
import { supabase } from "@/integrations/supabase/client";

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
const PER_TYPE = 5;

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

const groupLabels: Record<SearchResult["type"], string> = {
  curso: "Cursos",
  trilha: "Trilhas",
  material: "Materiais",
  forum: "Fóruns e discussões",
  documento: "Documentos",
  municipio: "Municípios",
};

const typeColors: Record<SearchResult["type"], string> = {
  curso: "bg-primary/10 text-primary",
  trilha: "bg-secondary/10 text-secondary",
  material: "bg-info/10 text-info",
  forum: "bg-success/10 text-success",
  documento: "bg-muted text-muted-foreground",
  municipio: "bg-accent/10 text-accent",
};

/** Escapa curingas do ILIKE para que o texto digitado seja buscado literalmente. */
const likePattern = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

const runSearch = async (q: string, filters: SearchFilters): Promise<SearchResult[]> => {
  const pattern = likePattern(q);
  const tasks: PromiseLike<SearchResult[]>[] = [];

  if (filters.cursos) {
    tasks.push(
      supabase.from("courses").select("id, title, description").ilike("title", pattern).limit(PER_TYPE)
        .then(({ data }) => (data || []).map((c) => ({ id: `curso-${c.id}`, type: "curso" as const, title: c.title, description: c.description || undefined, url: "/educacao" })))
    );
  }
  if (filters.trilhas) {
    tasks.push(
      supabase.from("trails").select("id, title, description").ilike("title", pattern).limit(PER_TYPE)
        .then(({ data }) => (data || []).map((t) => ({ id: `trilha-${t.id}`, type: "trilha" as const, title: t.title, description: t.description || undefined, url: "/educacao?aba=trilhas" })))
    );
  }
  if (filters.materiais) {
    tasks.push(
      supabase.from("materials").select("id, title, description").ilike("title", pattern).limit(PER_TYPE)
        .then(({ data }) => (data || []).map((m) => ({ id: `material-${m.id}`, type: "material" as const, title: m.title, description: m.description || undefined, url: "/repositorio" })))
    );
  }
  if (filters.foruns) {
    tasks.push(
      supabase.from("forums").select("id, name, slug, description").ilike("name", pattern).limit(PER_TYPE)
        .then(({ data }) => (data || []).map((f) => ({ id: `forum-${f.id}`, type: "forum" as const, title: f.name, description: f.description || undefined, url: `/foruns/${f.slug}` })))
    );
    tasks.push(
      supabase.from("forum_topics").select("id, title, forums(slug, name)").ilike("title", pattern).limit(PER_TYPE)
        .then(({ data }) => (data || []).map((t) => {
          const forum = t.forums as { slug: string; name: string } | null;
          return { id: `topico-${t.id}`, type: "forum" as const, title: t.title, description: forum ? `Discussão em ${forum.name}` : undefined, url: forum ? `/foruns/${forum.slug}/topico/${t.id}` : "/foruns" };
        }))
    );
  }
  if (filters.documentos) {
    tasks.push(
      supabase.from("governance_documents").select("id, name, description").ilike("name", pattern).limit(PER_TYPE)
        .then(({ data }) => (data || []).map((d) => ({ id: `doc-${d.id}`, type: "documento" as const, title: d.name, description: d.description || undefined, url: "/governanca" })))
    );
  }
  if (filters.municipios) {
    tasks.push(
      supabase.rpc("list_municipios_safe", { search_term: q, status_filter: null, microregiao_filter: null, urs_filter: null, macrorregiao_filter: null })
        .then(({ data }) => ((data || []) as { id: string; municipio: string; microregiao: string }[]).slice(0, PER_TYPE).map((m) => ({
          id: `municipio-${m.id}`, type: "municipio" as const, title: m.municipio, description: `NMSD ${m.microregiao}`, url: `/municipios?microrregiao=${encodeURIComponent(m.microregiao)}`,
        })))
    );
  }

  const settled = await Promise.allSettled(tasks);
  return settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
};

interface GlobalSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GlobalSearchCommand = ({ open, onOpenChange }: GlobalSearchCommandProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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
      } catch {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
      }
    }
  }, []);

  // Busca real (com pequena espera para não consultar a cada tecla)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      const found = await runSearch(q, filters);
      if (!cancelled) {
        setResults(found);
        setIsSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
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
          {query.trim().length < 2
            ? "Digite pelo menos 2 caracteres para buscar..."
            : isSearching
              ? "Buscando..."
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
        {query.trim().length >= 2 && results.length > 0 && (
          <>
            {(["curso", "trilha", "material", "forum", "documento", "municipio"] as const).map((type) => {
              const typeResults = results.filter(r => r.type === type);
              if (typeResults.length === 0) return null;
              
              const Icon = typeIcons[type];
              
              return (
                <CommandGroup key={type} heading={groupLabels[type]}>
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
        <span className="hidden sm:inline">Mostra apenas o que seu território permite ver</span>
      </div>
    </CommandDialog>
  );
};

export default GlobalSearchCommand;
