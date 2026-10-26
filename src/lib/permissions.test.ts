import { describe, it, expect } from "vitest";
import { grantableRoles, canReviewRegistrations, canPublishMaterials, canManageEducation } from "./permissions";

describe("aprovação de cadastros", () => {
  it("coordenador aprova apenas profissional, moderador e ponto focal", () => {
    expect(grantableRoles(["coordenador", "membro"])).toEqual(["membro", "moderador", "ponto_focal"]);
  });

  it("coordenador não pode definir coordenadores nem administradores", () => {
    const roles = grantableRoles(["coordenador"]);
    expect(roles).not.toContain("coordenador");
    expect(roles).not.toContain("admin");
  });

  it("admin URS/SES pode aprovar coordenadores", () => {
    expect(grantableRoles(["admin"])).toContain("coordenador");
  });

  it("profissional, moderador e ponto focal não aprovam cadastros", () => {
    expect(canReviewRegistrations(["membro"])).toBe(false);
    expect(canReviewRegistrations(["moderador", "membro"])).toBe(false);
    expect(canReviewRegistrations(["ponto_focal", "membro"])).toBe(false);
    expect(grantableRoles(["ponto_focal", "membro"])).toEqual([]);
  });

  it("só coordenador e admin acessam a fila de aprovação", () => {
    expect(canReviewRegistrations(["coordenador"])).toBe(true);
    expect(canReviewRegistrations(["admin"])).toBe(true);
  });
});

describe("publicação de conteúdo", () => {
  it("moderador publica no repositório, profissional não", () => {
    expect(canPublishMaterials(["moderador", "membro"])).toBe(true);
    expect(canPublishMaterials(["membro"])).toBe(false);
  });

  it("só coordenador e admin cadastram cursos", () => {
    expect(canManageEducation(["coordenador"])).toBe(true);
    expect(canManageEducation(["moderador", "membro"])).toBe(false);
  });
});
