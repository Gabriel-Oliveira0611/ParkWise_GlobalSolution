import { afterEach, expect, it, vi } from "vitest";
import { catalogo, filtrarLocais } from "../services/catalogo";
import type { Estacionamento } from "../types/api";
afterEach(() => vi.unstubAllGlobals());
it("busca na rota singular do Java sem prefixo inventado", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response("[]"));
  vi.stubGlobal("fetch", fetch);
  expect(await catalogo.listar()).toEqual([]);
  expect(fetch.mock.calls[0][0]).toBe(
    "https://gerenciamentoestacionamento-ru6m.onrender.com/estacionamento",
  );
});
it("não inclui unidades desativadas nos resultados filtrados", () => {
  const local = {
    id: 1,
    nome: "Unidade",
    endereco: "Rua",
    numero: "1",
    CEP: "01310100",
    status: false,
  } as Estacionamento;
  expect(filtrarLocais([local], "")).toEqual([]);
});
