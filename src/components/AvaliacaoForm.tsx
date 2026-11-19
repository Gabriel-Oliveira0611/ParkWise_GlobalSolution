import { useState } from "react";
import type { FormEvent } from "react";
import { useSessao } from "../contexts/SessaoContext";
import { motorista } from "../services/motorista";
import { useAcao } from "../utils/estado";
import { Aviso, Botao, Campo } from "./UI";
export function AvaliacaoForm({
  id,
  atualizar,
}: {
  id: number;
  atualizar: () => void;
}) {
  const { sessao } = useSessao();
  const acao = useAcao();
  const [sucesso, concluir] = useState(false);
  if (!sessao || sessao.usuario.papel !== "CLIENTE") return null;
  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const dados = new FormData(form);
    if (!sessao) return;
    void acao.executar(
      () =>
        motorista.avaliar(
          sessao,
          id,
          Number(dados.get("nota")),
          String(dados.get("comentario") ?? ""),
        ),
      () => {
        concluir(true);
        atualizar();
        form.reset();
      },
    );
  }
  return (
    <form className="panel mt-5 grid gap-4" onSubmit={enviar}>
      <h3 className="text-xl font-bold">Conte como foi sua experiência</h3>
      <Campo
        label="Nota de 0 a 5"
        name="nota"
        type="number"
        min="0"
        max="5"
        step="1"
        defaultValue="5"
        required
      />
      <label className="field-group">
        Comentário
        <textarea
          name="comentario"
          className="field"
          maxLength={500}
          rows={3}
        />
      </label>
      {acao.erro && <Aviso mensagem={acao.erro} />}
      {sucesso && <Aviso tipo="sucesso" mensagem="Avaliação enviada." />}
      <Botao type="submit" disabled={acao.processando}>
        {acao.processando ? "Enviando…" : "Enviar avaliação"}
      </Botao>
    </form>
  );
}
