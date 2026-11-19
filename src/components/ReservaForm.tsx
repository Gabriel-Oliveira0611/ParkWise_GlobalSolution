import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useSessao } from "../contexts/SessaoContext";
import { useFeedback } from "../contexts/FeedbackContext";
import { motorista } from "../services/motorista";
import type { Estacionamento, Reserva } from "../types/api";
import { useAcao } from "../utils/estado";
import { amanha, dataApi, dataBR, hora, horaApi } from "../utils/formatacao";
import { Aviso, Botao, Campo, Status } from "./UI";
export function ReservaForm({ local }: { local: Estacionamento }) {
  const { sessao } = useSessao();
  const acao = useAcao();
  const avisar = useFeedback();
  const [erro, invalidar] = useState("");
  const [reserva, concluir] = useState<Reserva | null>(null);
  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sessao) return;
    const form = new FormData(e.currentTarget);
    const dia = String(form.get("dia"));
    const horario = horaApi(String(form.get("hora")));
    if (dia < amanha()) {
      invalidar("Escolha uma data a partir de amanhã.");
      return;
    }
    const abertura = horaApi(local.horaAbertura);
    const fechamento = horaApi(local.horaFechamento);
    const dentro =
      abertura < fechamento
        ? horario >= abertura && horario < fechamento
        : horario >= abertura || horario < fechamento;
    if (!dentro) {
      invalidar(
        "Escolha um horário dentro do funcionamento do estacionamento.",
      );
      return;
    }
    invalidar("");
    void acao.executar(
      () =>
        motorista.reservar(sessao, {
          estacioId: local.id,
          dataDaReserva: dataApi(dia),
          horaDaReserva: horario,
        }),
      (r) => {
        concluir(r);
        avisar("Solicitação de reserva enviada.");
      },
    );
  }
  if (reserva)
    return (
      <section className="panel">
        <h2 className="text-2xl font-bold">Solicitação enviada</h2>
        <p className="my-4">
          Reserva #{reserva.id} · {dataBR(reserva.dataDaReserva)} às{" "}
          {hora(reserva.horaDaReserva)}
        </p>
        <Status status={reserva.statusReserva} />
        <p className="my-4 text-sm text-ink-muted">
          Acompanhe a decisão do estacionamento na sua conta.
        </p>
        <Link className="button button-primary" to="/minhas-reservas">
          Ver minhas reservas
        </Link>
      </section>
    );
  return (
    <section className="panel">
      <h2 className="text-2xl font-bold">Planeje sua chegada</h2>
      <p className="mt-3 text-sm text-ink-muted">
        Escolha uma data futura. A solicitação ficará pendente até a confirmação
        do estacionamento.
      </p>
      {!sessao ? (
        <Link
          className="button button-primary mt-5 w-full"
          to={
            "/entrar?voltar=" +
            encodeURIComponent("/estacionamentos/" + local.id)
          }
        >
          Entre para solicitar reserva
        </Link>
      ) : sessao.usuario.papel !== "CLIENTE" ? (
        <Aviso
          tipo="info"
          mensagem="Use uma conta de motorista para solicitar uma reserva."
        />
      ) : (
        <form className="mt-5 grid gap-4" onSubmit={enviar}>
          <Campo
            label="Data da reserva"
            name="dia"
            type="date"
            min={amanha()}
            defaultValue={amanha()}
            required
          />
          <Campo
            label="Horário de chegada"
            name="hora"
            type="time"
            defaultValue={hora(local.horaAbertura)}
            required
          />
          <p className="text-sm text-ink-muted">
            Funcionamento: {hora(local.horaAbertura)} –{" "}
            {hora(local.horaFechamento)}. Valores e condições são definidos pelo
            estacionamento.
          </p>
          {(erro || acao.erro) && <Aviso mensagem={erro || acao.erro} />}
          <Botao type="submit" disabled={acao.processando}>
            {acao.processando ? "Enviando…" : "Solicitar reserva"}
          </Botao>
        </form>
      )}
    </section>
  );
}
