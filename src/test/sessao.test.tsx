import { afterEach, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SessaoProvider, useSessao } from "../contexts/SessaoContext";
import { baseUrl } from "../config/ambiente";
afterEach(() => vi.unstubAllGlobals());
const chave = "parkwise-token-v2:" + baseUrl;
const jwt = () =>
  "h." +
  btoa(
    JSON.stringify({
      role: "CLIENTE",
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ) +
  ".s";
function Perfil() {
  const { sessao, carregando } = useSessao();
  return (
    <p>
      {carregando ? "Validando" : sessao ? sessao.usuario.nome : "Sem sessão"}
    </p>
  );
}
it("valida a sessão guardada no servidor ao recarregar", async () => {
  sessionStorage.setItem(chave, jwt());
  const f = vi
    .fn()
    .mockResolvedValue(
      new Response(
        '{"id":1,"nome":"Cliente restaurado","email":"c@example.test","senha":"HASH"}',
      ),
    );
  vi.stubGlobal("fetch", f);
  render(
    <SessaoProvider>
      <Perfil />
    </SessaoProvider>,
  );
  expect(await screen.findByText("Cliente restaurado")).toBeTruthy();
  expect(f.mock.calls[0][1].method).toBe("POST");
  expect(sessionStorage.getItem(chave)).not.toContain("HASH");
});
it("descarta sessão revogada no servidor", async () => {
  sessionStorage.setItem(chave, jwt());
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("{}", { status: 401 })),
  );
  render(
    <SessaoProvider>
      <Perfil />
    </SessaoProvider>,
  );
  expect(await screen.findByText("Sem sessão")).toBeTruthy();
  await waitFor(() => expect(sessionStorage.getItem(chave)).toBeNull());
});
it("descarta token inválido sem buscar um perfil", async () => {
  sessionStorage.setItem(chave, "inválido");
  const f = vi.fn();
  vi.stubGlobal("fetch", f);
  render(
    <SessaoProvider>
      <Perfil />
    </SessaoProvider>,
  );
  expect(await screen.findByText("Sem sessão")).toBeTruthy();
  expect(f).not.toHaveBeenCalled();
});
