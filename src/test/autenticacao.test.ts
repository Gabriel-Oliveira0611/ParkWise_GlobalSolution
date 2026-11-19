import { afterEach, expect, it, vi } from "vitest";
import { entrar, lerPapel } from "../services/autenticacao";
afterEach(() => vi.unstubAllGlobals());
it("recusa um login sem token sem consultar ou persistir um perfil", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", fetch);
  await expect(entrar("teste@example.test", "Senha_123")).rejects.toThrow(
    "não retornou uma sessão",
  );
  expect(fetch).toHaveBeenCalledOnce();
});
it("aceita o prefixo ROLE_ no papel do token", () => {
  const token =
    "h." +
    btoa(
      JSON.stringify({
        role: "ROLE_DONO",
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    ) +
    ".s";
  expect(lerPapel(token)).toBe("DONO");
});
