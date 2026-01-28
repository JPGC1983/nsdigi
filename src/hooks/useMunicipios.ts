import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export type MunicipioStatus = Database["public"]["Enums"]["municipio_status"];

// Tipo público (sem dados de coordenador)
export interface MunicipioPublic {
  id: string;
  municipio: string;
  cod_ibge: string;
  macrorregiao: string;
  cod_macro: string;
  microregiao: string;
  cod_micro: string;
  urs: string;
  grs: string | null;
  status: MunicipioStatus;
  populacao: number;
  profissionais: number;
  maturidade_digital: number;
  created_at: string;
  updated_at: string;
}

// Tipo completo (com dados de coordenador - apenas para admin/coordenador)
export interface Municipio extends MunicipioPublic {
  coordenador_nome: string | null;
  coordenador_email: string | null;
  coordenador_telefone: string | null;
}

export interface MunicipioUpdateData {
  status?: MunicipioStatus;
  coordenador_nome?: string;
  coordenador_email?: string;
  coordenador_telefone?: string;
}

export interface MunicipioFilters {
  search?: string;
  status?: string;
  microregiao?: string;
  urs?: string;
  macrorregiao?: string;
}

export const useMunicipios = () => {
  const { user, isAdmin, isCoordinator } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<MunicipioFilters>({});

  const canEdit = isAdmin || isCoordinator;

  // Fetch all municipalities usando função segura (sem dados de coordenador)
  const {
    data: municipios = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["municipios", filters],
    queryFn: async () => {
      // Usar função RPC segura que não expõe dados de coordenador
      const { data, error } = await supabase.rpc("list_municipios_safe", {
        search_term: filters.search || null,
        status_filter: filters.status || null,
        microregiao_filter: filters.microregiao || null,
        urs_filter: filters.urs || null,
        macrorregiao_filter: filters.macrorregiao || null,
      });

      if (error) throw error;
      return (data || []) as MunicipioPublic[];
    },
  });

  // Get unique values for filters using secure RPC
  const { data: filterOptions } = useQuery({
    queryKey: ["municipios-filter-options"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_municipios_filter_options");

      if (error) throw error;

      const result = data as { microrregioes: string[]; ursList: string[]; macrorregioes: string[] } | null;

      return {
        microrregioes: result?.microrregioes || [],
        ursList: result?.ursList || [],
        macrorregioes: result?.macrorregioes || [],
      };
    },
  });

  // Update municipality
  const updateMunicipio = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MunicipioUpdateData }) => {
      if (!canEdit) {
        throw new Error("Sem permissão para editar");
      }

      const { error } = await supabase
        .from("municipios")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["municipios"] });
      toast.success("Município atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  // Find municipality by IBGE code
  const findByIBGE = useCallback(async (codIbge: string): Promise<Municipio | null> => {
    const { data, error } = await supabase
      .from("municipios")
      .select("*")
      .eq("cod_ibge", codIbge)
      .maybeSingle();

    if (error) {
      console.error("Error finding municipality:", error);
      return null;
    }

    return data as Municipio | null;
  }, []);

  // Get statistics
  const stats = {
    total: municipios.length,
    ativos: municipios.filter(m => m.status === "ativo").length,
    pendentes: municipios.filter(m => m.status === "pendente").length,
    emImplantacao: municipios.filter(m => m.status === "em_implantacao").length,
    inativos: municipios.filter(m => m.status === "inativo").length,
    maturidadeMedia: municipios.length > 0
      ? Math.round(municipios.reduce((acc, m) => acc + (m.maturidade_digital || 0), 0) / municipios.length)
      : 0,
  };

  return {
    municipios,
    isLoading,
    error,
    refetch,
    filters,
    setFilters,
    filterOptions,
    updateMunicipio,
    findByIBGE,
    stats,
    canEdit,
  };
};

// Hook for user territory profile
export const useUserTerritory = () => {
  const { user } = useAuth();

  const { data: territoryProfile, isLoading } = useQuery({
    queryKey: ["user-territory", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_territory_profiles")
        .select(`
          *,
          municipio:municipios(*)
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    territoryProfile,
    isLoading,
    perfilTerritorio: territoryProfile?.perfil_territorio || null,
    municipio: territoryProfile?.municipio || null,
    microregiao: territoryProfile?.microregiao || null,
    urs: territoryProfile?.urs || null,
    grs: territoryProfile?.grs || null,
  };
};
