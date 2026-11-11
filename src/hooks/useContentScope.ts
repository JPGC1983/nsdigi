import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserTerritory } from "@/hooks/useMunicipios";
import { defaultScopeFor, type ScopeFields } from "@/lib/contentScope";

/** Campos de alcance territorial para gravar conteúdo novo (cursos, materiais, reuniões...). */
export const useContentScope = () => {
  const { roles } = useAuth();
  const { territoryProfile } = useUserTerritory();
  const getScopeFields = useCallback(
    (): ScopeFields => {
      const scope = defaultScopeFor(roles, territoryProfile ?? null);
      if (!scope) {
        throw new Error("Seu perfil ainda não tem território (município ou NMSD) definido. Peça ao Super Administrador para vincular.");
      }
      return scope;
    },
    [roles, territoryProfile],
  );
  return { getScopeFields };
};
