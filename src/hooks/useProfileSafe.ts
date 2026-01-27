import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Tipo para perfil público (sem dados sensíveis)
export interface ProfilePublic {
  id: string;
  full_name: string | null;
  municipality: string | null;
  avatar_url: string | null;
  job_title: string | null;
}

// Tipo para perfil privado (com todos os dados)
export interface ProfilePrivate extends ProfilePublic {
  phone: string | null;
  created_at: string;
  updated_at: string;
  _access_level: "private" | "public";
}

// Tipo para resposta da função segura
export type ProfileSafe = ProfilePublic & {
  _access_level: "private" | "public";
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
};

/**
 * Hook para buscar perfil de forma segura
 * Retorna dados completos apenas para usuários autorizados
 */
export const useProfileSafe = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile-safe", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase.rpc("get_profile_safe", {
        target_id: userId,
      });

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data as unknown as ProfileSafe | null;
    },
    enabled: !!userId,
  });
};

/**
 * Hook para buscar perfil público (sempre sem dados sensíveis)
 */
export const useProfilePublic = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile-public", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase.rpc("get_profile_public", {
        profile_id: userId,
      });

      if (error) {
        console.error("Error fetching public profile:", error);
        throw error;
      }

      return data?.[0] as ProfilePublic | null;
    },
    enabled: !!userId,
  });
};

/**
 * Hook para listar perfis públicos (para listagens gerais)
 */
export const useProfilesList = (searchTerm?: string) => {
  return useQuery({
    queryKey: ["profiles-list", searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_profiles_public", {
        search_term: searchTerm || null,
        limit_count: 50,
        offset_count: 0,
      });

      if (error) {
        console.error("Error fetching profiles list:", error);
        throw error;
      }

      return data as ProfilePublic[];
    },
  });
};

/**
 * Hook para verificar se pode ver dados privados de um usuário
 */
export const useCanViewPrivateProfile = (targetUserId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["can-view-private", user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId) return false;

      const { data, error } = await supabase.rpc("can_view_private_profile", {
        viewer_id: user.id,
        target_id: targetUserId,
      });

      if (error) {
        console.error("Error checking profile access:", error);
        return false;
      }

      return data as boolean;
    },
    enabled: !!user?.id && !!targetUserId,
  });
};
