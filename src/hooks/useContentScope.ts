import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserTerritory } from "@/hooks/useMunicipios";
import { defaultScopeFor, type ScopeFields } from "@/lib/contentScope";

/** Campos de alcance territorial para gravar conteúdo novo (cursos, materiais, reuniões...). */
export const useContentScope = () => {
  const { roles } = useAuth();
  const { territoryProfile } = useUserTerritory();
  const getScopeFields = useCallback(
    (): ScopeFields => defaultScopeFor(roles, territoryProfile ?? null),
    [roles, territoryProfile],
  );
  return { getScopeFields };
};
