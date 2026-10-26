// Perfis de acesso do NMSD.
// Os valores técnicos vêm do enum app_role do banco; os rótulos são os nomes usados na plataforma.
// As mesmas regras são aplicadas no banco (função review_registration); aqui elas só controlam a tela.

export type AppRole = "admin" | "coordenador" | "moderador" | "ponto_focal" | "membro";

export const ROLE_LABELS: Record<AppRole, string> = {
  membro: "Profissional",
  moderador: "Moderador",
  ponto_focal: "Ponto focal",
  coordenador: "Coordenador do NMSD",
  admin: "Admin URS/SES",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  membro: "Cursa, participa dos fóruns, consulta o repositório, solicita mentoria e vê os próprios indicadores.",
  moderador: "Tudo do profissional, mais moderar fóruns e publicar no repositório do seu domínio.",
  ponto_focal: "Tudo do profissional, mais acompanhar profissionais e maturidade do seu município e participar do colegiado.",
  coordenador: "Gerencia o NMSD: cursos, fóruns, repositório, mentorias, colegiado, indicadores e aprovações.",
  admin: "Visão de todos os NMSDs, publica conteúdo estadual, consolida indicadores e aprova coordenadores.",
};

const ROLE_ORDER: AppRole[] = ["admin", "coordenador", "ponto_focal", "moderador", "membro"];

/** Perfis que quem está logado pode atribuir ao aprovar um cadastro. */
export const grantableRoles = (callerRoles: AppRole[]): AppRole[] => {
  if (callerRoles.includes("admin")) return ["membro", "moderador", "ponto_focal", "coordenador", "admin"];
  if (callerRoles.includes("coordenador")) return ["membro", "moderador", "ponto_focal"];
  return [];
};

/** Quem pode abrir a fila de aprovação de cadastros. */
export const canReviewRegistrations = (roles: AppRole[]): boolean =>
  roles.includes("admin") || roles.includes("coordenador");

/** Quem cria e edita cursos e trilhas. */
export const canManageEducation = (roles: AppRole[]): boolean =>
  roles.includes("admin") || roles.includes("coordenador");

/** Quem publica no repositório de materiais. */
export const canPublishMaterials = (roles: AppRole[]): boolean =>
  roles.includes("admin") || roles.includes("coordenador") || roles.includes("moderador");

/** Perfil principal (o mais alto) para exibição. */
export const primaryRole = (roles: AppRole[]): AppRole | null =>
  ROLE_ORDER.find((r) => roles.includes(r)) ?? null;

export type RegistrationStatus = "pendente" | "ativo" | "inativo";

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  pendente: "Aguardando aprovação",
  ativo: "Ativo",
  inativo: "Inativo",
};
