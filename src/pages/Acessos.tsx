import { useCallback } from "react";
import type { FormEvent } from "react";
import { useUnidade } from "./Parceiro";
import { parceiro } from "../services/parceiro";
import { useAcao, useConsulta } from "../utils/estado";
import {
  hora,
  horaApi,
  placaNormalizada,
  placaValida,
  reais,
} from "../utils/formatacao";
import { Protegido } from "../components/Protegido";
import {
  Aviso,
  Botao,
  Cabecalho,
  Campo,
  Carregando,
  Falha,
  Vazio,
} from "../components/UI";
import type { Sessao } from "../types/api";
export function Acessos() {
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
    sessao && <Conteudo sessao={sessao} id={id} nome={estado.dados.nome} />
  );
}
function Conteudo({
  sessao,
  id,
  nome,
}: {
  sessao: Sessao;
  id: number;
  nome: string;
}) {
  const carregar = useCallback(
    () => parceiro.acessos(sessao, id),
    [sessao, id],
  );
  const { estado, recarregar } = useConsulta(carregar);
  const acao = useAcao();
  function entrada(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const placa = placaNormalizada(String(f.get("placa")));
    if (!placaValida(placa)) {
      acao.setErro("Informe uma placa válida.");
      return;
    }
    void acao.executar(
      () =>
        parceiro.entrada(sessao, {
          estacioId: id,
          placaDoCarro: placa,
          horaDeEntrada: horaApi(String(f.get("entrada"))),
        }),
      () => {
        form.reset();
        recarregar();
      },
    );
  }
  return (
    <div className="container-site page">
      <Cabecalho
        titulo="Entradas e saídas"
        descricao={nome}
        voltar={{ href: "/parceiro", texto: "Minhas unidades" }}
      />
      <Aviso
        tipo="info"
        mensagem="Registre horários e valores da operação. Este controle não realiza cobranças ou transferências de dinheiro."
      />
      {acao.erro && <Aviso mensagem={acao.erro} />}
      <form
        className="panel my-6 grid items-end gap-4 sm:grid-cols-3"
        onSubmit={entrada}
      >
        <Campo
          label="Placa"
          name="placa"
          required
          maxLength={8}
          placeholder="ABC1D23"
        />
        <Campo label="Horário de entrada" name="entrada" type="time" required />
        <Botao type="submit" disabled={acao.processando}>
          Registrar entrada
        </Botao>
      </form>
      {estado.status === "carregando" && <Carregando />}
      {estado.status === "erro" && (
        <Falha mensagem={estado.mensagem} tentar={recarregar} />
      )}
      {estado.status === "ok" &&
        (estado.dados.length ? (
          <div className="grid gap-4">
            {estado.dados.map((a) => (
              <article className="panel" key={a.id}>
                <h2 className="text-xl font-bold">{a.placaDoCarro}</h2>
                <p className="mt-2">
                  Entrada: {hora(a.horaDeEntrada)} · Saída:{" "}
                  {a.horaDeSaida ? hora(a.horaDeSaida) : "Em aberto"}
                </p>
                {a.horaDeSaida ? (
                  <p className="mt-2 font-bold">
                    Valor registrado:{" "}
                    {a.valorAPagar == null
                      ? "Não informado"
                      : reais(a.valorAPagar)}
                  </p>
                ) : (
                  <form
                    className="mt-4 grid items-end gap-3 sm:grid-cols-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      const saida = horaApi(String(f.get("saida")));
                      if (saida <= a.horaDeEntrada) {
                        acao.setErro(
                          "Neste controle diário, a saída deve ser posterior à entrada.",
                        );
                        return;
                      }
                      void acao.executar(
                        () =>
                          parceiro.saida(
                            sessao,
                            a,
                            saida,
                            Number(f.get("valor")),
                          ),
                        recarregar,
                      );
                    }}
                  >
                    <Campo
                      label={"Saída de " + a.placaDoCarro}
                      name="saida"
                      type="time"
                      required
                    />
                    <Campo
                      label={"Valor de " + a.placaDoCarro + " (R$)"}
                      name="valor"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                    />
                    <Botao type="submit" disabled={acao.processando}>
                      Registrar saída
                    </Botao>
                  </form>
                )}
              </article>
            ))}
          </div>
        ) : (
          <Vazio
            titulo="Nenhuma movimentação registrada"
            descricao="Registre a primeira entrada da unidade."
          />
        ))}
    </div>
  );
}
