import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { catalogo } from "../services/catalogo";
import { ApiError } from "../services/http";
import { useConsulta } from "../utils/estado";
import { dataBR, hora, idValido, reais } from "../utils/formatacao";
import { Cabecalho, Carregando, Falha } from "../components/UI";
import { Foto } from "../components/EstacionamentoCard";
import { ReservaForm } from "../components/ReservaForm";
import { AvaliacaoForm } from "../components/AvaliacaoForm";
export function Detalhe() {
  const id = Number(useParams().id);
  const carregar = useCallback(
    () =>
      idValido(id)
        ? catalogo.detalhe(id)
        : Promise.reject(new ApiError(404, "Estacionamento não encontrado.")),
    [id],
  );
  const { estado, recarregar } = useConsulta(carregar);
  return (
    <div className="container-site page">
      {estado.status === "carregando" && <Carregando />}
      {estado.status === "erro" && (
        <Falha mensagem={estado.mensagem} tentar={recarregar} />
      )}
      {estado.status === "ok" && (
        <>
          <Cabecalho
            titulo={estado.dados.nome}
            descricao={`${estado.dados.endereco}, ${estado.dados.numero} · CEP ${estado.dados.CEP ?? ""}`}
            voltar={{
              href: "/estacionamentos",
              texto: "Voltar aos estacionamentos",
            }}
          />
          <div className="detail-grid">
            <div>
              <Foto local={estado.dados} className="detail-photo" />
              <section className="panel mt-5">
                <h2 className="text-xl font-bold">Conheça a unidade</h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-ink-muted">Funcionamento</dt>
                    <dd className="mt-1 font-bold">
                      {hora(estado.dados.horaAbertura)} –{" "}
                      {hora(estado.dados.horaFechamento)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-ink-muted">Capacidade total</dt>
                    <dd className="mt-1 font-bold">
                      {estado.dados.maximoDeVagas} vagas
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-ink-muted">
                      Vagas preferenciais
                    </dt>
                    <dd className="mt-1 font-bold">
                      {estado.dados.vagasPreferenciais ?? 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-ink-muted">Alvará</dt>
                    <dd className="mt-1 font-bold break-all">
                      {estado.dados.numeroAlvaraDeFuncionamento}
                    </dd>
                  </div>
                </dl>
              </section>
              <Precos id={id} />
              <Avaliacoes id={id} />
            </div>
            <div>
              <ReservaForm local={estado.dados} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
function Precos({ id }: { id: number }) {
  const carregar = useCallback(() => catalogo.valores(id), [id]);
  const { estado, recarregar } = useConsulta(carregar);
  return (
    <section className="panel mt-5">
      <h2 className="text-xl font-bold">Tarifas cadastradas</h2>
      {estado.status === "carregando" && <Carregando />}
      {estado.status === "erro" && (
        <Falha mensagem={estado.mensagem} tentar={recarregar} />
      )}
      {estado.status === "ok" &&
        (estado.dados.length ? (
          <ul className="mt-4 grid gap-3">
            {estado.dados.map((v) => (
              <li
                className="flex flex-wrap justify-between gap-3 border-b border-line py-3"
                key={v.id}
              >
                <span>
                  {v.periodo === "UTIL" ? "Dias úteis" : "Fim de semana"} ·{" "}
                  {v.tipoDePagamento}
                </span>
                <strong>
                  {reais(v.preco)} /{" "}
                  {v.tipoDeCobranca === "PORHORA" ? "hora" : "vaga"}
                </strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-ink-muted">
            Tarifas ainda não publicadas. Consulte o estacionamento.
          </p>
        ))}
    </section>
  );
}
function Avaliacoes({ id }: { id: number }) {
  const carregar = useCallback(() => catalogo.avaliacoes(id), [id]);
  const { estado, recarregar } = useConsulta(carregar);
  return (
    <section className="mt-7">
      <h2 className="section-title">Quem estacionou conta</h2>
      {estado.status === "carregando" && <Carregando />}
      {estado.status === "erro" && (
        <Falha mensagem={estado.mensagem} tentar={recarregar} />
      )}
      {estado.status === "ok" &&
        (estado.dados.length ? (
          <div className="mt-4 grid gap-3">
            {estado.dados.map((a) => (
              <article className="panel" key={a.id}>
                <strong>
                  {a.cliente?.nome || "Motorista"} · {a.nota}/5
                </strong>
                <p className="mt-2">{a.comentario}</p>
                <p className="mt-3 text-sm text-ink-muted">
                  {dataBR(a.dataDeAvaliacao)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-ink-muted">
            Esta unidade ainda não recebeu avaliações.
          </p>
        ))}
      <AvaliacaoForm id={id} atualizar={recarregar} />
    </section>
  );
}
