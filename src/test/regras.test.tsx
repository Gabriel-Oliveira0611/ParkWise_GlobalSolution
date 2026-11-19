import { describe, expect, it } from "vitest";
import { destinoInterno } from "../components/Protegido";
import { validarUnidade } from "../pages/Parceiro";
import type { EstacionamentoInput } from "../types/api";
const dados: EstacionamentoInput = {
  nome: "Unidade",
  endereco: "Av. Paulista",
  numero: "100",
  CEP: "01310-100",
  numeroAlvaraDeFuncionamento: "A123",
  horaAbertura: "08:00:00",
  horaFechamento: "22:00:00",
  maximoDeVagas: 20,
  vagasPreferenciais: 2,
};
describe("Prevenção de dados inválidos", () => {
  it("impede redirecionamento para outro domínio após o login", () => {
    expect(destinoInterno("//outro.site", "/")).toBe("/");
    expect(destinoInterno("/\\outro.site", "/")).toBe("/");
    expect(destinoInterno("https://outro.site", "/")).toBe("/");
    expect(destinoInterno("/estacionamentos/2", "/")).toBe(
      "/estacionamentos/2",
    );
  });
  it("recusa capacidades negativas, fracionadas ou preferenciais acima do total", () => {
    for (const capacidade of [-1, 0, 1.5])
      expect(validarUnidade({ ...dados, maximoDeVagas: capacidade })).toContain(
        "capacidade",
      );
    expect(validarUnidade({ ...dados, vagasPreferenciais: 21 })).toContain(
      "capacidade",
    );
  });
  it("previne CEP e fotografia inválidos", () => {
    expect(validarUnidade({ ...dados, CEP: "123" })).toContain("CEP");
    expect(validarUnidade({ ...dados, foto: "javascript:alert(1)" })).toContain(
      "HTTPS",
    );
    expect(validarUnidade(dados)).toBe("");
  });
});
