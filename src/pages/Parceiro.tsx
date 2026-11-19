import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSessao } from "../contexts/SessaoContext";
import { useFeedback } from "../contexts/FeedbackContext";
import { parceiro } from "../services/parceiro";
import { ApiError } from "../services/http";
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
import { useAcao, useConsulta } from "../utils/estado";
import { hora, horaApi, idValido } from "../utils/formatacao";
import type { Estacionamento, EstacionamentoInput, Sessao } from "../types/api";

export function useUnidade() {
  const { sessao } = useSessao();
  const id = Number(useParams().id);
  const carregar = useCallback(async () => {
    if (!sessao || !idValido(id))
      throw new ApiError(404, "Unidade não encontrada.");
    const unidades = await parceiro.unidades(sessao);
    const unidade = unidades.find((u) => u.id === id);
    if (!unidade)
      throw new ApiError(403, "Esta unidade não pertence à sua conta.");
    return unidade;
  }, [sessao, id]);
  return { ...useConsulta(carregar), sessao, id };
}
export function Parceiro() {
  const { sessao } = useSessao();
  return (
    <Protegido papeis={["DONO"]}>
      {sessao && <Painel sessao={sessao} />}
    </Protegido>
  );
}
function Painel({ sessao }: { sessao: Sessao }) {
  const carregar = useCallback(() => parceiro.unidades(sessao), [sessao]);
  const { estado, recarregar } = useConsulta(carregar);
  const acao = useAcao();
  const avisar = useFeedback();
  return (
    <div className="container-site page">
      <Cabecalho
        titulo="Seu estacionamento em movimento"
        descricao="Gerencie as unidades cadastradas na sua conta."
      >
        <Link
          className="button button-primary"
          to="/parceiro/estacionamentos/novo"
        >
          Cadastrar estacionamento
        </Link>
      </Cabecalho>
      {acao.erro && <Aviso mensagem={acao.erro} />}
      {estado.status === "carregando" && <Carregando />}
      {estado.status === "erro" && (
        <Falha mensagem={estado.mensagem} tentar={recarregar} />
      )}
      {estado.status === "ok" &&
        (estado.dados.length ? (
          <div className="grid gap-5">
            {estado.dados.map((l) => (
              <article key={l.id} className="panel">
                <h2 className="text-2xl font-bold">{l.nome}</h2>
                <p className="mt-2 text-ink-muted">
                  {l.endereco}, {l.numero} · {l.maximoDeVagas} vagas totais ·{" "}
                  {hora(l.horaAbertura)}–{hora(l.horaFechamento)}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    className="button button-primary"
                    to={`/parceiro/${l.id}/reservas`}
                  >
                    Gerenciar reservas
                  </Link>
                  <Link
                    className="button button-secondary"
                    to={`/parceiro/${l.id}/tarifas`}
                  >
                    Tarifas
                  </Link>
                  <Link
                    className="button button-secondary"
                    to={`/parceiro/${l.id}/acessos`}
                  >
                    Entradas e saídas
                  </Link>
                  <Link
                    className="button button-secondary"
                    to={`/parceiro/estacionamentos/${l.id}/editar`}
                  >
                    Editar unidade
                  </Link>
                  <Botao
                    variant="danger"
                    disabled={acao.processando}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Desativar " +
                            l.nome +
                            "? Ela deixará de aparecer na busca.",
                        )
                      )
                        void acao.executar(
                          () => parceiro.remover(sessao, l.id),
                          () => {
                            recarregar();
                            avisar("Unidade desativada.");
                          },
                        );
                    }}
                  >
                    Desativar
                  </Botao>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Vazio
            titulo="Sua primeira unidade começa aqui"
            descricao="Cadastre o estacionamento para aparecer nas buscas e receber solicitações."
          />
        ))}
    </div>
  );
}
export function EditarUnidade({ nova = false }: { nova?: boolean }) {
  return (
    <Protegido papeis={["DONO"]}>
      {nova ? <Formulario /> : <CarregarEdicao />}
    </Protegido>
  );
}
function CarregarEdicao() {
  const { estado, recarregar } = useUnidade();
  return estado.status === "carregando" ? (
    <Carregando />
  ) : estado.status === "erro" ? (
    <div className="container-site page">
      <Falha mensagem={estado.mensagem} tentar={recarregar} />
    </div>
  ) : (
    <Formulario inicial={estado.dados} />
  );
}
export function validarUnidade(d: EstacionamentoInput) {
  if (
    !d.nome.trim() ||
    !d.endereco.trim() ||
    !d.numero.trim() ||
    !d.numeroAlvaraDeFuncionamento.trim()
  )
    return "Preencha nome, endereço, número e alvará.";
  if (!/^\d{5}-?\d{3}$/.test(d.CEP)) return "Informe um CEP com 8 números.";
  if (
    !Number.isInteger(d.maximoDeVagas) ||
    d.maximoDeVagas < 1 ||
    !Number.isInteger(d.vagasPreferenciais) ||
    d.vagasPreferenciais < 0 ||
    d.vagasPreferenciais > d.maximoDeVagas
  )
    return "Confira a capacidade: as vagas preferenciais devem estar entre zero e o total.";
  if (
    !d.horaAbertura ||
    !d.horaFechamento ||
    d.horaAbertura === d.horaFechamento
  )
    return "Informe horários distintos de abertura e fechamento.";
  if (d.foto && !/^https:\/\//i.test(d.foto))
    return "A foto deve usar um endereço HTTPS.";
  return "";
}
function Formulario({ inicial }: { inicial?: Estacionamento }) {
  const { sessao } = useSessao();
  const navegar = useNavigate();
  const avisar = useFeedback();
  const acao = useAcao();
  const [erro, invalidar] = useState("");
  function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sessao) return;
    const f = new FormData(e.currentTarget);
    const texto = (k: string) => String(f.get(k) ?? "").trim();
    const dados: EstacionamentoInput = {
      nome: texto("nome"),
      endereco: texto("endereco"),
      CEP: texto("CEP"),
      numero: texto("numero"),
      foto: texto("foto") || undefined,
      numeroAlvaraDeFuncionamento: texto("alvara"),
      horaAbertura: horaApi(texto("abertura")),
      horaFechamento: horaApi(texto("fechamento")),
      maximoDeVagas: Number(f.get("capacidade")),
      vagasPreferenciais: Number(f.get("preferenciais")),
      numeroDeEscrituraImovel: texto("escritura") || undefined,
    };
    const mensagem = validarUnidade(dados);
    invalidar(mensagem);
    if (mensagem) return;
    void acao.executar(
      () => parceiro.salvar(sessao, dados, inicial?.id),
      () => {
        avisar(
          inicial
            ? "Unidade atualizada."
            : "Estacionamento cadastrado e publicado.",
        );
        navegar("/parceiro");
      },
    );
  }
  return (
    <div className="container-site page">
      <Cabecalho
        titulo={inicial ? "Editar estacionamento" : "Cadastrar estacionamento"}
        descricao="Os dados salvos serão exibidos na busca pública."
        voltar={{ href: "/parceiro", texto: "Voltar às minhas unidades" }}
      />
      <form
        className="panel mx-auto grid max-w-4xl gap-5 sm:grid-cols-2"
        onSubmit={salvar}
      >
        <Campo
          label="Nome do estacionamento"
          name="nome"
          defaultValue={inicial?.nome}
          required
          maxLength={100}
        />
        <Campo
          label="Número do alvará"
          name="alvara"
          defaultValue={inicial?.numeroAlvaraDeFuncionamento}
          required
          maxLength={100}
        />
        <Campo
          label="Endereço"
          name="endereco"
          defaultValue={inicial?.endereco}
          required
          maxLength={255}
        />
        <Campo
          label="Número"
          name="numero"
          defaultValue={inicial?.numero}
          required
          maxLength={20}
        />
        <Campo
          label="CEP"
          name="CEP"
          defaultValue={inicial?.CEP}
          placeholder="01310-100"
          required
          maxLength={9}
        />
        <Campo
          label="Escritura do imóvel (opcional)"
          name="escritura"
          defaultValue={inicial?.numeroDeEscrituraImovel}
          maxLength={100}
        />
        <Campo
          label="Abertura"
          name="abertura"
          type="time"
          defaultValue={
            hora(inicial?.horaAbertura) === "Não informado"
              ? "08:00"
              : hora(inicial?.horaAbertura)
          }
          required
        />
        <Campo
          label="Fechamento"
          name="fechamento"
          type="time"
          defaultValue={inicial ? hora(inicial.horaFechamento) : "22:00"}
          required
        />
        <Campo
          label="Capacidade total"
          name="capacidade"
          type="number"
          min="1"
          step="1"
          defaultValue={inicial?.maximoDeVagas ?? 20}
          required
        />
        <Campo
          label="Vagas preferenciais"
          name="preferenciais"
          type="number"
          min="0"
          step="1"
          defaultValue={inicial?.vagasPreferenciais ?? 1}
          required
        />
        <Campo
          className="sm:col-span-2"
          label="Link HTTPS da foto (opcional)"
          name="foto"
          type="url"
          defaultValue={inicial?.foto}
          dica="Sem foto, a busca usa uma imagem identificada como ilustrativa."
        />
        {(erro || acao.erro) && (
          <div className="sm:col-span-2">
            <Aviso mensagem={erro || acao.erro} />
          </div>
        )}
        <Botao type="submit" disabled={acao.processando}>
          {acao.processando
            ? "Salvando…"
            : inicial
              ? "Salvar alterações"
              : "Publicar estacionamento"}
        </Botao>
      </form>
    </div>
  );
}
