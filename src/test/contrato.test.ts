// @vitest-environment node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
type Schema = {
  required?: string[];
  properties?: Record<string, { enum?: string[] }>;
};
type Contrato = {
  paths: Record<string, Record<string, unknown>>;
  components: { schemas: Record<string, Schema> };
};
const contrato = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../../docs/openapi.json", import.meta.url)),
    "utf8",
  ),
) as Contrato;
it("confere as rotas centrais contra o Swagger capturado da API", () => {
  for (const [method, path] of [
    ["get", "/estacionamento"],
    ["post", "/auth/me"],
    ["post", "/cliente"],
    ["post", "/dono"],
    ["post", "/cliente/{id}/carros"],
    ["post", "/dono/{id}/estacionamentos"],
    ["post", "/estacionamento/{id}/reservas"],
    ["put", "/reserva/{id}"],
    ["post", "/estacionamento/{id}/valores"],
    ["put", "/acesso/{id}"],
    ["post", "/estacionamento/{id}/avaliacoes"],
  ])
    expect(contrato.paths[path]?.[method]).toBeDefined();
});
it("preserva os nomes obrigatórios de cadastro e reserva do Java", () => {
  expect(contrato.components.schemas.EstacionamentoRequest.required).toContain(
    "CEP",
  );
  expect(contrato.components.schemas.ClienteRequest.required).toContain(
    "dataNascimento",
  );
  expect(contrato.components.schemas.ReservaRequest.required).toContain(
    "estacioId",
  );
});
it("usa as situações e condições publicadas no contrato", () => {
  expect(
    contrato.components.schemas.ReservaRequest.properties?.statusReserva.enum,
  ).toEqual(["PENDENTE", "ACEITA", "RECUSADA", "ENCERRADA"]);
  expect(
    contrato.components.schemas.ValorRequest.properties?.tipoDeCobranca.enum,
  ).toEqual(["PORHORA", "PORVAGA"]);
});
