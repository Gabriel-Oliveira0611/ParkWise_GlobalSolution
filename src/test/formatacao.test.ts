import { describe, expect, it } from "vitest";
import {
  dataApi,
  dataBR,
  horaApi,
  idValido,
  maiorDeIdade,
  placaNormalizada,
  placaValida,
  senhaValida,
} from "../utils/formatacao";
describe("Dados enviados ao Java", () => {
  it("envia datas com fuso explícito sem deslocar o dia", () => {
    expect(dataApi("2026-12-25")).toBe("2026-12-25T12:00:00-03:00");
    expect(dataBR("2026-12-25T00:00:00Z")).toBe("25/12/2026");
  });
  it("envia LocalTime com segundos", () => {
    expect(horaApi("08:30")).toBe("08:30:00");
    expect(horaApi("08:30:15")).toBe("08:30:15");
  });
  it("aceita placas brasileiras antigas e Mercosul", () => {
    expect(placaValida("ABC-1234")).toBe(true);
    expect(placaValida("abc1d23")).toBe(true);
    expect(placaNormalizada("abc-1234")).toBe("ABC1234");
    expect(placaValida("123")).toBe(false);
  });
  it("recusa ID inválido antes de consultar a API", () => {
    expect(idValido(NaN)).toBe(false);
    expect(idValido(-1)).toBe(false);
    expect(idValido(1.2)).toBe(false);
    expect(idValido(12)).toBe(true);
  });
  it("valida cadastro de adulto e senha forte", () => {
    expect(maiorDeIdade("2000-01-01")).toBe(true);
    expect(maiorDeIdade("2025-01-01")).toBe(false);
    expect(maiorDeIdade("")).toBe(false);
    expect(senhaValida("Estacio_2026")).toBe(true);
    expect(senhaValida("12345678")).toBe(false);
  });
});
