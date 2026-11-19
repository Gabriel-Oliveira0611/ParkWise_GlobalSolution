import { afterEach, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { App } from "../App";
afterEach(() => vi.unstubAllGlobals());
function abrir(rota = "/") {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  );
}
function responder(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status });
}
it("mostra a identidade visual e as cinco páginas institucionais", () => {
  abrir();
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
    "Menos voltas",
  );
  for (const nome of ["Sobre", "Integrantes", "FAQ", "Contato"])
    expect(screen.getByRole("link", { name: nome })).toBeTruthy();
});
it("exibe o estado vazio retornado pela API sem garagens fictícias", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responder([])));
  abrir("/estacionamentos");
  expect(
    await screen.findByRole("heading", {
      name: "Nenhum estacionamento encontrado",
    }),
  ).toBeTruthy();
  expect(screen.queryByText("Garagem Paulista")).toBeNull();
});
it("permite repetir uma consulta após uma falha de rede", async () => {
  const fetch = vi
    .fn()
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValue(responder([]));
  vi.stubGlobal("fetch", fetch);
  abrir("/estacionamentos");
  await userEvent.click(
    await screen.findByRole("button", { name: "Tentar novamente" }),
  );
  expect(
    await screen.findByRole("heading", {
      name: "Nenhum estacionamento encontrado",
    }),
  ).toBeTruthy();
});
it("mostra carregamento durante uma consulta pendente", async () => {
  vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
  abrir("/estacionamentos");
  expect(
    (await screen.findByText(/Consultando estacionamentos/)).textContent,
  ).toContain("Consultando estacionamentos");
});
it("rejeita uma rota dinâmica inválida sem consultar a API", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  abrir("/estacionamentos/invalido");
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(fetch).not.toHaveBeenCalled();
});
it("protege as páginas de escrita sem sessão", async () => {
  abrir("/veiculos");
  expect(
    await screen.findByRole("heading", { name: "Entre para continuar" }),
  ).toBeTruthy();
});
it("valida o cadastro antes de enviar ao servidor", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  abrir("/cadastro");
  await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));
  expect(await screen.findByText("Informe um e-mail válido.")).toBeTruthy();
  expect(screen.getByText("É necessário ter 18 anos ou mais.")).toBeTruthy();
  expect(fetch).not.toHaveBeenCalled();
});
it("menu mobile informa abertura e fecha ao navegar", async () => {
  abrir();
  const menu = screen.getByRole("button", { name: "Abrir menu" });
  await userEvent.click(menu);
  expect(
    screen
      .getByRole("button", { name: "Fechar menu" })
      .getAttribute("aria-expanded"),
  ).toBe("true");
  await userEvent.click(
    screen
      .getByRole("navigation", { name: "Navegação mobile" })
      .querySelector('a[href="/sobre"]')!,
  );
  expect(
    (await screen.findByRole("heading", { level: 1 })).textContent,
  ).toContain("Uma cidade com");
  expect(screen.queryByRole("button", { name: "Fechar menu" })).toBeNull();
});
it("prepara contato sem afirmar que um e-mail foi enviado", async () => {
  abrir("/contato");
  const u = userEvent.setup();
  await u.type(screen.getByLabelText("Seu nome"), "Teste ParkWise");
  await u.type(screen.getByLabelText("Seu e-mail"), "teste@example.test");
  await u.type(
    screen.getByLabelText("Mensagem"),
    "Gostaria de saber mais sobre o projeto.",
  );
  await u.click(screen.getByRole("button", { name: "Preparar mensagem" }));
  expect(
    await screen.findByText(
      "Mensagem preparada. Compartilhe pelo canal da equipe.",
    ),
  ).toBeTruthy();
});
it("mostra página para uma rota inexistente", () => {
  abrir("/caminho-inexistente");
  expect(
    screen.getByRole("heading", { name: "Esse caminho não foi encontrado" }),
  ).toBeTruthy();
});
