import { baseUrl, timeoutMs } from "../config/ambiente";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export const mensagemErro = (erro: unknown) =>
  erro instanceof Error
    ? erro.message
    : "Não foi possível concluir. Tente novamente.";
export function criarHttp(base: string, tempo = timeoutMs) {
  return async function request<T>(
    path: string,
    options: { method?: string; body?: unknown; token?: string } = {},
  ): Promise<T> {
    const headers = new Headers({ Accept: "application/json" });
    if (options.token) headers.set("Authorization", "Bearer " + options.token);
    if (options.body !== undefined)
      headers.set("Content-Type", "application/json");
    let response: Response;
    try {
      response = await fetch(base.replace(/\/+$/, "") + path, {
        method: options.method ?? "GET",
        headers,
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: AbortSignal.timeout(tempo),
      });
    } catch (error) {
      throw new ApiError(
        0,
        typeof error === "object" &&
          error !== null &&
          "name" in error &&
          ["TimeoutError", "AbortError"].includes(String(error.name))
          ? "O serviço demorou para responder. Aguarde um pouco e tente novamente."
          : "Não foi possível conectar ao serviço. Confira sua conexão e tente novamente.",
      );
    }
    if (response.status === 204) return undefined as T;
    const data: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      if (
        response.status === 401 &&
        options.token &&
        typeof window !== "undefined"
      )
        window.dispatchEvent(new Event("parkwise:sessao-expirada"));
      if (response.status >= 500)
        throw new ApiError(
          response.status,
          "O serviço encontrou uma falha. Tente novamente em instantes.",
        );
      if (response.status === 401)
        throw new ApiError(
          401,
          "E-mail ou senha incorretos, ou sessão expirada. Entre novamente.",
        );
      if (response.status === 403)
        throw new ApiError(
          403,
          "Acesso não autorizado. Entre novamente com o perfil correspondente.",
        );
      const record =
        data && typeof data === "object"
          ? (data as Record<string, unknown>)
          : {};
      const messages = ["erro", "message", "mensagem", "detail"]
        .map((k) => record[k])
        .filter((v) => typeof v === "string");
      const validation = Object.values(record).filter(
        (v) => typeof v === "string",
      );
      throw new ApiError(
        response.status,
        String(
          messages[0] ||
            validation.join(" · ") ||
            (response.status === 404
              ? "Registro não encontrado."
              : "Confira os dados e tente novamente."),
        ),
      );
    }
    if (data === undefined)
      throw new ApiError(0, "O serviço retornou uma resposta inesperada.");
    return data as T;
  };
}
export const request = criarHttp(baseUrl);