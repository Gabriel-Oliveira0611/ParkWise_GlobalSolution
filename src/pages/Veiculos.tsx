import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { useSessao } from "../contexts/SessaoContext";
import { useFeedback } from "../contexts/FeedbackContext";
import { motorista } from "../services/motorista";
import { useAcao, useConsulta } from "../utils/estado";
import { placaNormalizada, placaValida } from "../utils/formatacao";
import {
  Aviso,
  Botao,
  Cabecalho,
  Campo,
  Carregando,
  Falha,
  Vazio,
} from "../components/UI";
import { Protegido } from "../components/Protegido";
import type { Carro, Sessao } from "../types/api";
export function Veiculos() {
  const { sessao } = useSessao();
  return (
    <Protegido papeis={["CLIENTE"]}>
      {sessao && <Conteudo sessao={sessao} />}
    </Protegido>
  );
}
function Conteudo({ sessao }: { sessao: Sessao }) {
  const carregar = useCallback(() => motorista.carros(sessao), [sessao]);
  const { estado, recarregar } = useConsulta(carregar);
  const [edicao, editar] = useState<Carro | null>(null);
  const [remover, confirmar] = useState<Carro | null>(null);
  const [validacao, validar] = useState("");
  const acao = useAcao();
  const avisar = useFeedback();
  function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const dados = new FormData(form);
    const carro = {
      placa: placaNormalizada(String(dados.get("placa"))),
      modelo: String(dados.get("modelo")).trim(),
      cor: String(dados.get("cor")).trim(),
    };
    if (!placaValida(carro.placa) || !carro.modelo || !carro.cor) {
      validar("Informe placa válida, modelo e cor.");
      return;
    }
    validar("");
    void acao.executar(
      () => motorista.salvarCarro(sessao, carro, edicao?.id),
      () => {
        avisar("Veículo salvo.");
        editar(null);
        form.reset();
        recarregar();
      },
    );
  }
  return (
    <div className="container-site page">
      <Cabecalho
        titulo="Meus veículos"
        descricao="Mantenha os veículos da sua conta organizados."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <form
          key={edicao?.id ?? "novo"}
          className="panel grid content-start gap-4"
          onSubmit={salvar}
        >
          <h2 className="text-xl font-bold">
            {edicao ? "Editar veículo" : "Cadastrar veículo"}
          </h2>
          <Campo
            label="Placa"
            name="placa"
            defaultValue={edicao?.placa}
            placeholder="ABC1D23"
            required
            maxLength={8}
          />
          <Campo
            label="Modelo"
            name="modelo"
            defaultValue={edicao?.modelo}
            required
            maxLength={100}
          />
          <Campo
            label="Cor"
            name="cor"
            defaultValue={edicao?.cor}
            required
            maxLength={50}
          />
          {(validacao || acao.erro) && (
            <Aviso mensagem={validacao || acao.erro} />
          )}
          <Botao type="submit" disabled={acao.processando}>
            {acao.processando ? "Salvando…" : "Salvar veículo"}
          </Botao>
          {edicao && (
            <Botao variant="secondary" onClick={() => editar(null)}>
              Cancelar edição
            </Botao>
          )}
        </form>
        <section aria-label="Veículos cadastrados">
          {estado.status === "carregando" && <Carregando />}
          {estado.status === "erro" && (
            <Falha mensagem={estado.mensagem} tentar={recarregar} />
          )}
          {estado.status === "ok" &&
            (estado.dados.length ? (
              <div className="grid gap-3">
                {estado.dados.map((c) => (
                  <article
                    key={c.id}
                    className="panel flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <h2 className="text-xl font-bold">{c.modelo}</h2>
                      <p className="mt-1 text-ink-muted">
                        {c.placa} · {c.cor}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Botao variant="secondary" onClick={() => editar(c)}>
                        Editar
                      </Botao>
                      <Botao variant="danger" onClick={() => confirmar(c)}>
                        Remover
                      </Botao>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <Vazio
                titulo="Nenhum veículo cadastrado"
                descricao="Use o formulário para adicionar seu primeiro veículo."
              />
            ))}
        </section>
      </div>
      {remover && (
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="remover-carro"
          className="modal-backdrop"
        >
          <div className="panel max-w-md">
            <h2 className="text-xl font-bold" id="remover-carro">
              Remover {remover.placa}?
            </h2>
            <p className="my-4">O veículo deixará de aparecer na sua lista.</p>
            {acao.erro && <Aviso mensagem={acao.erro} />}
            <div className="flex gap-2">
              <Botao
                variant="secondary"
                autoFocus
                onClick={() => confirmar(null)}
              >
                Voltar
              </Botao>
              <Botao
                variant="danger"
                disabled={acao.processando}
                onClick={() =>
                  void acao.executar(
                    () => motorista.removerCarro(sessao, remover.id),
                    () => {
                      confirmar(null);
                      recarregar();
                      avisar("Veículo removido.");
                    },
                  )
                }
              >
                Confirmar remoção
              </Botao>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
