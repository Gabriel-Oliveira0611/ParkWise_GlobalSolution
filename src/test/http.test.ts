import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, criarHttp } from "../services/http";
afterEach(() => vi.unstubAllGlobals());
const mockResponse = (body: unknown, status = 200) =>
  new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
describe("Transporte HTTP e erros do Java", () => {
  it("envia JSON e Bearer sem colocar o token na URL", async () => {
    const fetch = vi.fn().mockResolvedValue(mockResponse({ id: 1 }, 201));
    vi.stubGlobal("fetch", fetch);
    expect(
      await criarHttp("https://example.test/")("/carro", {
        method: "POST",
        body: { placa: "ABC1D23" },
        token: "jwt",
      }),
    ).toEqual({ id: 1 });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("https://example.test/carro");
    expect(options.headers.get("Authorization")).toBe("Bearer jwt");
    expect(options.body).toBe('{"placa":"ABC1D23"}');
  });
  it("aceita DELETE 204 sem tentar ler JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse(null, 204)));
    expect(
      await criarHttp("")("/carro/1", { method: "DELETE" }),
    ).toBeUndefined();
  });
  it("mostra a mensagem erro devolvida pelo Java em um conflito", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(mockResponse({ erro: "Placa já cadastrada" }, 409)),
    );
    await expect(criarHttp("")("/carro")).rejects.toThrow(
      "Placa já cadastrada",
    );
  });
  it("agrega validações de campos", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          mockResponse(
            { email: "E-mail inválido", nome: "Nome obrigatório" },
            400,
          ),
        ),
    );
    await expect(criarHttp("")("/cliente")).rejects.toThrow(
      "E-mail inválido · Nome obrigatório",
    );
  });
  it("não expõe detalhes SQL de um erro 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          mockResponse({ erro: "SQL e detalhes internos" }, 500),
        ),
    );
    await expect(criarHttp("")("/estacionamento")).rejects.toThrow(
      "O serviço encontrou uma falha",
    );
  });
  it("invalida a sessão em resposta 401 autenticada", async () => {
    const expirar = vi.fn();
    window.addEventListener("parkwise:sessao-expirada", expirar);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse({}, 401)));
    await expect(
      criarHttp("")("/auth/me", { token: "jwt" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(expirar).toHaveBeenCalledOnce();
    window.removeEventListener("parkwise:sessao-expirada", expirar);
  });
  it("trata erro de rede sem inventar dados locais", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(criarHttp("")("/estacionamento")).rejects.toThrow(
      "Não foi possível conectar",
    );
  });
  it("trata timeout com mensagem de nova tentativa", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("timeout", "TimeoutError")),
    );
    await expect(criarHttp("")("/estacionamento")).rejects.toThrow(
      "demorou para responder",
    );
  });
  it("recusa HTML em uma resposta de sucesso", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("<html>Loading</html>", { status: 200 }),
        ),
    );
    await expect(criarHttp("")("/estacionamento")).rejects.toThrow(
      "resposta inesperada",
    );
  });
});
