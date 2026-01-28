import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface NucleoMicrorregional {
  id: string;
  microregiao: string;
  cod_micro: string;
  macrorregiao: string;
  cod_macro: string;
  urs: string;
  nome_nucleo: string;
  coordenador_nome: string | null;
  coordenador_email: string | null;
  coordenador_telefone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NucleoMember {
  municipio_id: string;
  municipio: string;
  cod_ibge: string;
  status: string;
  populacao: number;
  profissionais: number;
  maturidade_digital: number;
}

export const useNucleosMicrorregionais = () => {
  const { user, isAdmin, isCoordinator } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all active NMSD
  const {
    data: nucleos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["nucleos-microrregionais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nucleos_microrregionais")
        .select("*")
        .eq("is_active", true)
        .order("microregiao");

      if (error) throw error;
      return data as NucleoMicrorregional[];
    },
  });

  // Get NMSD for current user
  const { data: userNMSD } = useQuery({
    queryKey: ["user-nmsd", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase.rpc("get_user_nmsd", {
        user_uuid: user.id,
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user?.id,
  });

  // Get members (municipalities) of a specific NMSD
  const getNucleoMembers = async (microregiao: string): Promise<NucleoMember[]> => {
    const { data, error } = await supabase.rpc("list_nmsd_members", {
      nmsd_microregiao: microregiao,
    });

    if (error) throw error;
    return (data || []) as NucleoMember[];
  };

  // Update NMSD coordinator info
  const updateNucleo = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<NucleoMicrorregional, "coordenador_nome" | "coordenador_email" | "coordenador_telefone">>;
    }) => {
      if (!isAdmin && !isCoordinator) {
        throw new Error("Sem permissão para editar");
      }

      const { error } = await supabase
        .from("nucleos_microrregionais")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nucleos-microrregionais"] });
      toast.success("NMSD atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  // Statistics
  const stats = {
    totalNucleos: nucleos.length,
    nucleosPorMacro: nucleos.reduce((acc, n) => {
      acc[n.macrorregiao] = (acc[n.macrorregiao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    nucleosPorURS: nucleos.reduce((acc, n) => {
      acc[n.urs] = (acc[n.urs] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return {
    nucleos,
    isLoading,
    error,
    refetch,
    userNMSD,
    getNucleoMembers,
    updateNucleo,
    stats,
    canEdit: isAdmin || isCoordinator,
  };
};

export default useNucleosMicrorregionais;
