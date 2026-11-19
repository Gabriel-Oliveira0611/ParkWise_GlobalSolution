import { useCallback } from "react";
import { useUnidade } from "./Parceiro";
import { parceiro } from "../services/parceiro";
import { useAcao, useConsulta } from "../utils/estado";
import { dataBR, hora } from "../utils/formatacao";
import { Protegido } from "../components/Protegido";
import {
  Aviso,
  Botao,
  Cabecalho,
  Carregando,
  Falha,
  Status,
  Vazio,
} from "../components/UI";
import type { Sessao } from "../types/api";
export function GestaoReservas() {
  return (
    <Protegido papeis={["DONO"]}>
      <Unidade />
    </Protegido>
  );
}
function Unidade() {
  const { estado, sessao, id, recarregar } = useUnidade();
  return estado.status === "carregando" ? (
    <Carregando />
  ) : estado.status === "erro" ? (
    <div className="container-site page">
      <Falha mensagem={estado.mensagem} tentar={recarregar} />
    </div>
  ) : (
    sessao && <Lista sessao={sessao} id={id} nome={estado.dados.nome} />
  );
}
function Lista({
  sessao,
  id,
  nome,
}: {
  sessao: Sessao;
  id: number;
  nome: string;
}) {
  const carregar = useCallback(
    () => parceiro.reservas(sessao, id),
    [sessao, id],
  );
  const { estado, recarregar } = useConsulta(carregar);
  const acao = useAcao();
  return (
    <div className="container-site page">
      <Cabecalho
        titulo="Reservas da unidade"
        descricao={nome}
        voltar={{ href: "/parceiro", texto: "Minhas unidades" }}
      />
      <Aviso
        tipo="info"
        mensagem="Uma solicitação pendente ainda não representa uma vaga confirmada. Atualize a situação após conferir a operação."
      />
      {acao.erro && <Aviso mensagem={acao.erro} />}
      <div className="mt-5">
        {estado.status === "carregando" && <Carregando />}
        {estado.status === "erro" && (
          <Falha mensagem={estado.mensagem} tentar={recarregar} />
        )}
        {estado.status === "ok" &&
          (estado.dados.length ? (
            <div className="grid gap-4">
              {estado.dados.map((r) => (
                <article className="panel" key={r.id}>
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">
                        {r.cliente.nome} · Reserva #{r.id}
                      </h2>
                      <p className="mt-2">
                        {dataBR(r.dataDaReserva)} às {hora(r.horaDaReserva)}
                      </p>
                    </div>
                    <Status status={r.statusReserva} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(r.statusReserva === "PENDENTE"
                      ? ["ACEITA", "RECUSADA"]
                      : r.statusReserva === "ACEITA"
                        ? ["ENCERRADA", "RECUSADA"]
                        : []
                    ).map((status) => (
                      <Botao
                        key={status}
                        variant={
                          status === "RECUSADA" ? "secondary" : "primary"
                        }
                        disabled={acao.processando}
                        onClick={() =>
                          void acao.executar(
                            () =>
                              parceiro.situacao(
                                sessao,
                                r,
                                id,
                                status as "ACEITA" | "RECUSADA" | "ENCERRADA",
                              ),
                            recarregar,
                          )
                        }
                      >
                        {status === "ACEITA"
                          ? "Confirmar reserva"
                          : status === "RECUSADA"
                            ? "Recusar reserva"
                            : "Concluir reserva"}
                      </Botao>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Vazio
              titulo="Nenhuma solicitação por enquanto"
              descricao="As reservas enviadas pelos motoristas aparecerão aqui."
            />
          ))}
      </div>
    </div>
  );
}
