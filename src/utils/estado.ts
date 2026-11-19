import { useEffect, useRef, useState } from "react";
import { mensagemErro } from "../services/http";

type Resultado<T> =
  | { status: "carregando" }
  | { status: "ok"; dados: T }
  | { status: "erro"; mensagem: string };

export function useConsulta<T>(executar: () => Promise<T>) {
  const [estado, setEstado] = useState<Resultado<T>>({ status: "carregando" });
  const [versao, atualizar] = useState(0);

  useEffect(() => {
    let valida = true;
    setEstado({ status: "carregando" });
    executar().then(
      (dados) => {
        if (valida) setEstado({ status: "ok", dados });
      },
      (erro) => {
        if (valida) setEstado({ status: "erro", mensagem: mensagemErro(erro) });
      },
    );
    return () => {
      valida = false;
    };
  }, [executar, versao]);

  function recarregar() {
    atualizar((anterior) => anterior + 1);
  }

  return { estado, recarregar };
}

export function useAcao() {
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const bloqueio = useRef(false);

  async function executar<T>(
    acao: () => Promise<T>,
    receber?: (dado: T) => void,
  ) {
    if (bloqueio.current) return;
    bloqueio.current = true;
    setProcessando(true);
    setErro("");
    try {
      const dado = await acao();
      receber?.(dado);
    } catch (falha) {
      setErro(mensagemErro(falha));
    } finally {
      bloqueio.current = false;
      setProcessando(false);
    }
  }

  return { processando, erro, setErro, executar };
}
