import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { integrantes, turma, contatoEmail } from "../config/equipe";
import { Aviso, Botao, Cabecalho, Campo, Vazio } from "../components/UI";
import { FotoIntegrante } from "../components/FotoIntegrante";
export function Sobre() {
  return (
    <div className="container-site page">
      <section className="institutional-hero rounded-3xl px-6 py-12 text-white sm:p-12">
        <p className="text-sm font-bold uppercase tracking-widest text-lime-200">
          Tecnologia a favor das pessoas
        </p>
        <h1 className="page-title mt-5">
          Uma cidade com
          <br />
          menos voltas.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-pine-100">
          O ParkWise aproxima quem precisa estacionar de quem tem um lugar para
          oferecer.
        </p>
      </section>
      <section className="mx-auto mt-10 grid max-w-4xl gap-7 leading-relaxed">
        <h2 className="section-title">
          Planejar a chegada também é mobilidade.
        </h2>
        <p>
          Procurar estacionamento pode transformar um pequeno deslocamento em
          tempo perdido. Nossa proposta é reunir informações de unidades,
          horários, vagas preferenciais e tarifas para ajudar o cidadão a se
          planejar.
        </p>
        <p>
          Motoristas podem solicitar reservas e acompanhar a confirmação.
          Proprietários publicam unidades, gerenciam as solicitações e registram
          entradas e saídas.
        </p>
        <div className="panel">
          <h2 className="text-xl font-bold">CitizenTech · ODS 11</h2>
          <p className="mt-3">
            O projeto se conecta ao objetivo de cidades e comunidades
            sustentáveis ao propor uma mobilidade mais organizada, com acesso
            mais claro às informações do serviço.
          </p>
        </div>
        <p className="text-sm text-ink-muted">
          Projeto acadêmico da FIAP. As condições de uso, preços e confirmação
          da reserva são de responsabilidade de cada estacionamento.
        </p>
      </section>
    </div>
  );
}
const perguntas = [
  [
    "Como faço uma reserva?",
    "Busque um estacionamento, abra os detalhes e escolha uma data futura e o horário de chegada. É preciso estar em uma conta de motorista.",
  ],
  [
    "Minha reserva já está garantida ao enviar?",
    "A solicitação começa como pendente. Aguarde a situação mudar para Confirmada na página Minhas reservas.",
  ],
  [
    "Posso pagar pelo ParkWise?",
    "Nesta versão, os valores exibidos são informativos. O pagamento é combinado diretamente com o estacionamento.",
  ],
  [
    "As vagas totais representam disponibilidade?",
    "A capacidade total informa a estrutura do estacionamento. A confirmação depende da operação da unidade para a data e o horário solicitados.",
  ],
  [
    "Como cadastro meu estacionamento?",
    "Crie uma conta de proprietário e acesse Minhas unidades. Informe o endereço, o alvará, os horários e a capacidade. Depois publique suas tarifas.",
  ],
  [
    "Por que o primeiro acesso pode demorar?",
    "O serviço pode precisar iniciar ao receber a primeira consulta. Aguarde a mensagem de carregamento e tente novamente caso o tempo se esgote.",
  ],
];
export function FAQ() {
  return (
    <div className="container-site page">
      <Cabecalho
        titulo="Como podemos ajudar?"
        descricao="Respostas para planejar sua próxima chegada."
      />
      <div className="mx-auto grid max-w-4xl gap-3">
        {perguntas.map(([q, a]) => (
          <details className="faq-item" key={q}>
            <summary className="flex justify-between gap-4 text-lg font-bold">
              {q}
              <span aria-hidden="true">+</span>
            </summary>
            <p className="mt-4 leading-relaxed text-ink-muted">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
export function Integrantes() {
  return (
    <div className="container-site page">
      <Cabecalho
        titulo="Quem constrói o ParkWise"
        descricao={"Equipe · FIAP " + turma}
      />
      <div className="parking-grid">
        {integrantes.map((i) => (
          <article className="panel flex h-full flex-col" key={i.id}>
            <FotoIntegrante
              nome={i.nome}
              src={i.foto}
              className="aspect-square w-full rounded-2xl"
            />
            <h2 className="mt-5 text-xl font-bold">{i.nome}</h2>
            <p className="mt-2 text-ink-muted">{i.funcao}</p>
            <Link className="text-link mt-5" to={"/integrantes/" + i.id}>
              Conhecer integrante
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
export function Integrante() {
  const { id } = useParams();
  const i = integrantes.find((p) => p.id === id);
  if (!i) return <NaoEncontrado />;
  return (
    <div className="container-site page">
      <Cabecalho
        titulo={i.nome}
        descricao={i.funcao}
        voltar={{ href: "/integrantes", texto: "Voltar à equipe" }}
      />
      <section className="panel grid max-w-3xl gap-6 sm:grid-cols-[11rem_minmax(0,1fr)]">
        <FotoIntegrante
          nome={i.nome}
          src={i.foto}
          prioridade
          className="aspect-square w-full max-w-64 rounded-2xl"
        />
        <div>
          <p>
            FIAP · {turma}
            {i.rm ? " · RM " + i.rm : ""}
          </p>
          <p className="mt-4 text-ink-muted">
            Integrante da equipe ParkWise na Global Solution CitizenTech 2026.
          </p>
          {i.github && (
            <a
              className="button button-primary mt-5"
              href={i.github}
              target="_blank"
              rel="noreferrer"
            >
              Perfil no GitHub
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
export function Contato() {
  const [erro, invalidar] = useState("");
  const [mensagem, preparar] = useState("");
  const [copiada, confirmar] = useState(false);
  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nome = String(f.get("nome")).trim();
    const email = String(f.get("email")).trim();
    const texto = String(f.get("mensagem")).trim();
    if (
      nome.length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      texto.length < 10
    ) {
      invalidar(
        "Confira seu nome, e-mail e uma mensagem com pelo menos 10 caracteres.",
      );
      return;
    }
    invalidar("");
    confirmar(false);
    preparar(`${nome} <${email}>\n\n${texto}`);
  }
  return (
    <div className="container-site page">
      <Cabecalho
        titulo="Fale com a equipe"
        descricao="Prepare sua mensagem para compartilhar com os responsáveis pelo projeto."
      />
      <form
        className="panel mx-auto grid max-w-2xl gap-5"
        onSubmit={enviar}
        noValidate
      >
        <Campo
          label="Seu nome"
          name="nome"
          autoComplete="name"
          required
          maxLength={150}
        />
        <Campo
          label="Seu e-mail"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={255}
        />
        <label className="field-group">
          Mensagem
          <textarea
            className="field"
            name="mensagem"
            rows={6}
            required
            minLength={10}
            maxLength={2000}
          />
        </label>
        {erro && <Aviso mensagem={erro} />}
        <Botao type="submit">Preparar mensagem</Botao>
        {mensagem && (
          <section className="grid gap-3" aria-label="Mensagem preparada">
            <Aviso
              tipo="sucesso"
              mensagem={
                copiada
                  ? "Mensagem copiada."
                  : "Mensagem preparada. Compartilhe pelo canal da equipe."
              }
            />
            <pre className="whitespace-pre-wrap break-words rounded-xl bg-canvas p-4 text-sm">
              {mensagem}
            </pre>
            {contatoEmail ? (
              <a
                className="button button-secondary"
                href={
                  "mailto:" +
                  contatoEmail +
                  "?subject=Contato%20ParkWise&body=" +
                  encodeURIComponent(mensagem)
                }
              >
                Abrir aplicativo de e-mail
              </a>
            ) : (
              <Botao
                variant="secondary"
                onClick={() => {
                  void navigator.clipboard?.writeText(mensagem).then(
                    () => confirmar(true),
                    () =>
                      invalidar(
                        "Selecione o texto acima para copiá-lo manualmente.",
                      ),
                  );
                }}
              >
                Copiar mensagem
              </Botao>
            )}
          </section>
        )}
      </form>
    </div>
  );
}
export function NaoEncontrado() {
  return (
    <div className="container-site page">
      <Vazio
        titulo="Esse caminho não foi encontrado"
        descricao="Volte para a busca e encontre seu próximo destino."
      >
        <Link className="button button-primary" to="/estacionamentos">
          Buscar estacionamento
        </Link>
      </Vazio>
    </div>
  );
}
