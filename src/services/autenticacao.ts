import type { Cadastro, Papel, Sessao, UsuarioDTO } from "../types/api";
import { ApiError, request } from "./http";
import { dataApi } from "../utils/formatacao";

export function lerPapel(token: string): Papel {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(part)) as { role?: string; exp?: number };
    const role = payload.role?.replace(/^ROLE_/, "");
    if (
      !role ||
      !["CLIENTE", "DONO", "GERENTE", "ADMIN"].includes(role) ||
      !payload.exp ||
      payload.exp * 1000 <= Date.now()
    )
      throw new Error();
    return role as Papel;
  } catch {
    throw new ApiError(401, "Sua sessão expirou. Entre novamente.");
  }
}
export async function carregarSessao(token: string): Promise<Sessao> {
  const papel = lerPapel(token);
  const perfil = await request<UsuarioDTO>("/auth/me", {
    method: "POST",
    token,
  });
  // Apenas estes campos são mantidos. A resposta Java pode conter um campo senha.
  return {
    token,
    usuario: { id: perfil.id, nome: perfil.nome, email: perfil.email, papel },
  };
}
export async function entrar(email: string, senha: string) {
  const { token } = await request<{ token: string }>("/auth/login", {
    method: "POST",
    body: { email, senha },
  });
  if (!token)
    throw new ApiError(0, "O serviço de login não retornou uma sessão.");
  return carregarSessao(token);
}
export async function cadastrar(dados: Cadastro, perfil: "CLIENTE" | "DONO") {
  await request<UsuarioDTO>(perfil === "DONO" ? "/dono" : "/cliente", {
    method: "POST",
    body: { ...dados, dataNascimento: dataApi(dados.dataNascimento) },
  });
  return entrar(dados.email, dados.senha);
}
