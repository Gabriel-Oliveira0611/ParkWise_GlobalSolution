import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Sessao } from "../types/api";
import { carregarSessao } from "../services/autenticacao";
import { baseUrl } from "../config/ambiente";

const chave = "parkwise-token-v2:" + baseUrl;
const Contexto = createContext<{
  sessao: Sessao | null;
  carregando: boolean;
  atualizar: (s: Sessao | null) => void;
} | null>(null);
export function SessaoProvider({ children }: { children: ReactNode }) {
  const [sessao, definir] = useState<Sessao | null>(null);
  const [carregando, aguardar] = useState(true);
  function atualizar(s: Sessao | null) {
    try {
      if (s) sessionStorage.setItem(chave, s.token);
      else sessionStorage.removeItem(chave);
    } catch {
      /* sessão continua apenas na memória */
    }
    definir(s);
  }
  useEffect(() => {
    let ativa = true;
    let token: string | null = null;
    try {
      token = sessionStorage.getItem(chave);
    } catch {
      /* armazenamento indisponível */
    }
    if (token)
      void carregarSessao(token)
        .then(
          (s) => {
            if (ativa) atualizar(s);
          },
          () => {
            if (ativa) atualizar(null);
          },
        )
        .finally(() => {
          if (ativa) aguardar(false);
        });
    else aguardar(false);
    const expirar = () => atualizar(null);
    window.addEventListener("parkwise:sessao-expirada", expirar);
    return () => {
      ativa = false;
      window.removeEventListener("parkwise:sessao-expirada", expirar);
    };
  }, []);
  return (
    <Contexto.Provider value={{ sessao, carregando, atualizar }}>
      {children}
    </Contexto.Provider>
  );
}
export function useSessao() {
  const c = useContext(Contexto);
  if (!c) throw new Error("SessaoProvider ausente.");
  return c;
}
