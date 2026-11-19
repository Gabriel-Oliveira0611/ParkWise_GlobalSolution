import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useSessao } from "../contexts/SessaoContext";
import { motorista } from "../services/motorista";
import { useConsulta } from "../utils/estado";
import { dataBR, hora } from "../utils/formatacao";
import { Protegido } from "../components/Protegido";
import {
  Botao,
  Cabecalho,
  Carregando,
  Falha,
  Status,
  Vazio,
} from "../components/UI";
import type { Sessao } from "../types/api";
export function Reservas() {
  const { sessao } = useSessao();
  return (
    <Protegido papeis={["CLIENTE"]}>
      {sessao && <Conteudo sessao={sessao} />}
    </Protegido>
  );
}
function Conteudo({ sessao }: { sessao: Sessao }) {
  const { id } = useParams();
  const carregar = useCallback(() => motorista.reservas(sessao), [sessao]);
  const { estado, recarregar } = useConsulta(carregar);
  const reservas =
    estado.status === "ok"
      ? estado.dados.filter((r) => !id || r.id === Number(id))
      : [];
  return (
    <div className="container-site page">
      <Cabecalho
        titulo={id ? "Detalhe da reserva" : "Minhas reservas"}
        descricao="Acompanhe as solicitações e a confirmação do estacionamento."
      >
        <Botao variant="secondary" onClick={recarregar}>
          Atualizar reservas
        </Botao>
      </Cabecalho>
      {estado.status === "carregando" && <Carregando />}
      {estado.status === "erro" && (
        <Falha mensagem={estado.mensagem} tentar={recarregar} />
      )}
      {estado.status === "ok" &&
        (reservas.length ? (
          <div className="grid gap-4">
            {reservas.map((r) => (
              <article
                key={r.id}
                className="panel flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm text-ink-muted">Reserva #{r.id}</p>
                  <h2 className="mt-2 text-xl font-bold">
                    {r.estacionamento?.nome || "Estacionamento reservado"}
                  </h2>
                  <p className="mt-2">
                    {dataBR(r.dataDaReserva)} às {hora(r.horaDaReserva)}
                  </p>
                  {r.statusReserva === "PENDENTE" && (
                    <p className="mt-2 text-sm text-ink-muted">
                      Aguardando a confirmação do estacionamento.
                    </p>
                  )}
                </div>
                <div className="grid justify-items-start gap-3">
                  <Status status={r.statusReserva} />
                  {!id && (
                    <Link className="text-link" to={"/minhas-reservas/" + r.id}>
                      Ver detalhes
                    </Link>
                  )}
                  {r.estacionamento?.id && (
                    <Link
                      className="text-link"
                      to={"/estacionamentos/" + r.estacionamento.id}
                    >
                      Ver estacionamento
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Vazio
            titulo={
              id
                ? "Reserva não encontrada"
                : "Suas próximas chegadas começam aqui"
            }
            descricao="Encontre um estacionamento e envie sua primeira solicitação."
          >
            <Link className="button button-primary" to="/estacionamentos">
              Buscar estacionamento
            </Link>
          </Vazio>
        ))}
    </div>
  );
}
