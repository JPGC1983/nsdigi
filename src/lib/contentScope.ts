import type { AppRole } from "@/lib/permissions";

export type ContentScope = "global" | "regional" | "microrregional" | "municipal";

export interface TerritoryLike {
  perfil_territorio?: string | null;
  urs?: string | null;
  microregiao?: string | null;
  municipio_id?: string | null;
}

export interface ScopeFields {
  escopo: ContentScope;
  urs: string | null;
  microregiao: string | null;
  municipio_id: string | null;
}

/**
 * Alcance territorial padrão de um conteúdo novo, de acordo com o perfil de quem publica.
 * Admin e equipe estadual publicam para todos; demais publicam para o próprio território.
 * O banco confere a mesma regra (user_can_manage_content) — isto só evita gravações recusadas.
 */
export const defaultScopeFor = (roles: AppRole[], territory: TerritoryLike | null | undefined): ScopeFields => {
  const global: ScopeFields = { escopo: "global", urs: null, microregiao: null, municipio_id: null };
  if (roles.includes("admin")) return global;
  if (!territory) return global;

  switch (territory.perfil_territorio) {
    case "estado_nsdigi":
      return global;
    case "grs":
      return { escopo: "regional", urs: territory.urs ?? null, microregiao: null, municipio_id: null };
    case "nsd_microrregional":
      return {
        escopo: "microrregional",
        urs: territory.urs ?? null,
        microregiao: territory.microregiao ?? null,
        municipio_id: null,
      };
    case "municipal":
      return {
        escopo: "municipal",
        urs: territory.urs ?? null,
        microregiao: territory.microregiao ?? null,
        municipio_id: territory.municipio_id ?? null,
      };
    default:
      return global;
  }
};

export const SCOPE_LABELS: Record<ContentScope, string> = {
  global: "Todo o estado",
  regional: "Regional (URS)",
  microrregional: "Microrregional (NMSD)",
  municipal: "Municipal",
};
