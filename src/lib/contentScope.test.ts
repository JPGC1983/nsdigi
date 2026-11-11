import { describe, it, expect } from "vitest";
import { defaultScopeFor } from "./contentScope";

describe("defaultScopeFor", () => {
  it("admin publica para todo o estado", () => {
    expect(defaultScopeFor(["admin"], { perfil_territorio: "nsd_microrregional", microregiao: "X" })?.escopo).toBe("global");
  });

  it("coordenador de NMSD publica para a própria microrregião", () => {
    const s = defaultScopeFor(["coordenador"], { perfil_territorio: "nsd_microrregional", microregiao: "BOCAIÚVA", urs: "Montes Claros" });
    expect(s).toEqual({ escopo: "microrregional", urs: "Montes Claros", microregiao: "BOCAIÚVA", municipio_id: null });
  });

  it("perfil de URS publica para a regional", () => {
    expect(defaultScopeFor(["coordenador"], { perfil_territorio: "grs", urs: "Uberaba" })).toEqual({
      escopo: "regional", urs: "Uberaba", microregiao: null, municipio_id: null,
    });
  });

  it("perfil municipal publica para o próprio município", () => {
    const s = defaultScopeFor(["moderador"], { perfil_territorio: "municipal", municipio_id: "m1", microregiao: "M", urs: "U" });
    expect(s?.escopo).toBe("municipal");
    expect(s?.municipio_id).toBe("m1");
  });

  it("admin sem território publica para todo o estado", () => {
    expect(defaultScopeFor(["admin"], null)?.escopo).toBe("global");
  });

  it("não admin sem território não pode publicar", () => {
    expect(defaultScopeFor(["coordenador"], null)).toBeNull();
    expect(defaultScopeFor(["moderador"], { perfil_territorio: null })).toBeNull();
  });
});
