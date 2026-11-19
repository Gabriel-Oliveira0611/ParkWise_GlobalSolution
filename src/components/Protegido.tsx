import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSessao } from "../contexts/SessaoContext";
import type { Papel } from "../types/api";
import { Carregando, Vazio } from "./UI";
export function destinoInterno(valor: string | null, padrao: string) {
  return valor?.startsWith("/") &&
    !valor.startsWith("//") &&
    !valor.includes("\\") &&
    !/[\r\n]/.test(valor)
    ? valor
    : padrao;
}
export function Protegido({
  papeis,
  children,
}: {
  papeis: Papel[];
  children: ReactNode;
}) {
  const { sessao, carregando } = useSessao();
  const rota = useLocation();
  if (carregando) return <Carregando mensagem="Validando sua sessão…" />;
  if (sessao && papeis.includes(sessao.usuario.papel)) return children;
  return (
    <div className="container-site page">
      <Vazio
        titulo={sessao ? "Área de outro perfil" : "Entre para continuar"}
        descricao="Acesse a conta correspondente para utilizar esta área."
      >
        <Link
          className="button button-primary"
          to={
            "/entrar?voltar=" + encodeURIComponent(rota.pathname + rota.search)
          }
        >
          Entrar com outra conta
        </Link>
      </Vazio>
    </div>
  );
}
