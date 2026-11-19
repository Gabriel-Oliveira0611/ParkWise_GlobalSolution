import { useCallback } from "react";
import type { FormEvent } from "react";
import { useUnidade } from "./Parceiro";
import { parceiro } from "../services/parceiro";
import { catalogo } from "../services/catalogo";
import { useAcao, useConsulta } from "../utils/estado";
import { reais } from "../utils/formatacao";
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
import type { Sessao, ValorInput } from "../types/api";
export function Tarifas() {
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
  const carregar = useCallback(() => catalogo.valores(id), [id]);
  const { estado, recarregar } = useConsulta(carregar);
  const acao = useAcao();
  function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const dados: ValorInput = {
      preco: Number(f.get("preco")),
      tipoDeCobranca: f.get("cobranca") as ValorInput["tipoDeCobranca"],
      tipoDePagamento: f.get("pagamento") as ValorInput["tipoDePagamento"],
      periodo: f.get("periodo") as ValorInput["periodo"],
    };
    if (!Number.isFinite(dados.preco) || dados.preco <= 0) {
      acao.setErro("Informe um preço maior que zero.");
      return;
    }
    void acao.executar(
      () => parceiro.salvarValor(sessao, id, dados),
      () => {
        form.reset();
        recarregar();
      },
    );
  }
  return (
    <div className="container-site page">
      <Cabecalho
        titulo="Tarifas"
        descricao={nome}
        voltar={{ href: "/parceiro", texto: "Minhas unidades" }}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="panel grid content-start gap-4" onSubmit={salvar}>
          <h2 className="text-xl font-bold">Publicar tarifa</h2>
          <Campo
            label="Preço (R$)"
            name="preco"
            type="number"
            min="0.01"
            max="999999"
            step="0.01"
            required
          />
          <label className="field-group">
            Cobrança
            <select name="cobranca" className="field">
              <option value="PORHORA">Por hora</option>
              <option value="PORVAGA">Por vaga</option>
            </select>
          </label>
          <label className="field-group">
            Pagamento
            <select name="pagamento" className="field">
              <option value="PIX">PIX</option>
              <option value="DEBITO">Débito</option>
              <option value="DINHEIRO">Dinheiro</option>
            </select>
          </label>
          <label className="field-group">
            Período
            <select name="periodo" className="field">
              <option value="UTIL">Dias úteis</option>
              <option value="FINALDESEMANA">Fim de semana</option>
            </select>
          </label>
          {acao.erro && <Aviso mensagem={acao.erro} />}
          <Botao type="submit" disabled={acao.processando}>
            {acao.processando ? "Publicando…" : "Publicar tarifa"}
          </Botao>
        </form>
        <section aria-label="Tarifas da unidade">
          {estado.status === "carregando" && <Carregando />}
          {estado.status === "erro" && (
            <Falha mensagem={estado.mensagem} tentar={recarregar} />
          )}
          {estado.status === "ok" &&
            (estado.dados.length ? (
              <div className="grid gap-3">
                {estado.dados.map((v) => (
                  <article key={v.id} className="panel">
                    <h2 className="text-xl font-bold">
                      {reais(v.preco)} /{" "}
                      {v.tipoDeCobranca === "PORHORA" ? "hora" : "vaga"}
                    </h2>
                    <p className="my-3">
                      {v.periodo === "UTIL" ? "Dias úteis" : "Fim de semana"} ·{" "}
                      {v.tipoDePagamento}
                    </p>
                    <Botao
                      variant="danger"
                      disabled={acao.processando}
                      onClick={() => {
                        if (window.confirm("Remover esta tarifa?"))
                          void acao.executar(
                            () => parceiro.removerValor(sessao, v.id),
                            recarregar,
                          );
                      }}
                    >
                      Remover tarifa
                    </Botao>
                  </article>
                ))}
              </div>
            ) : (
              <Vazio
                titulo="Nenhuma tarifa publicada"
                descricao="Adicione os preços e as condições de pagamento da unidade."
              />
            ))}
        </section>
      </div>
    </div>
  );
}
