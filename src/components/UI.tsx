import {
  AlertCircle,
  ArrowLeft,
  CarFront,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { useId } from "react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";

export function Botao({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      type="button"
      {...props}
      className={["button", "button-" + variant, className].join(" ")}
    />
  );
}

export function Campo({
  label,
  erro,
  dica,
  id,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  erro?: string;
  dica?: string;
}) {
  const gerado = useId();
  const campoId = id ?? gerado;
  return (
    <div className={"field-group " + className}>
      <label htmlFor={campoId}>{label}</label>
      <input
        {...props}
        id={campoId}
        className="field"
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro || dica ? campoId + "-mensagem" : undefined}
      />
      {(erro || dica) && (
        <span
          id={campoId + "-mensagem"}
          className={erro ? "text-sm text-red-700" : "hint"}
        >
          {erro ?? dica}
        </span>
      )}
    </div>
  );
}

export function Aviso({
  mensagem,
  tipo = "erro",
  children,
}: {
  mensagem: string;
  tipo?: "erro" | "sucesso" | "info";
  children?: ReactNode;
}) {
  const Icone =
    tipo === "erro"
      ? AlertCircle
      : tipo === "sucesso"
        ? CheckCircle2
        : CircleAlert;
  return (
    <div
      className={"notice notice-" + tipo}
      role={tipo === "erro" ? "alert" : "status"}
    >
      <Icone size={19} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p>{mensagem}</p>
        {children}
      </div>
    </div>
  );
}

export function Carregando({
  mensagem = "Carregando…",
}: {
  mensagem?: string;
}) {
  return (
    <div
      className="flex min-h-28 items-center justify-center gap-3 py-8 text-sm text-ink-muted"
      role="status"
    >
      <LoaderCircle className="animate-spin text-pine-700" size={19} />{" "}
      {mensagem}
    </div>
  );
}

export function Falha({
  mensagem,
  tentar,
}: {
  mensagem: string;
  tentar?: () => void;
}) {
  return (
    <Aviso mensagem={mensagem}>
      {tentar && (
        <button
          type="button"
          className="mt-2 text-sm font-bold underline"
          onClick={tentar}
        >
          Tentar novamente
        </button>
      )}
    </Aviso>
  );
}

export function Vazio({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-pine-50 text-pine-700">
        <CarFront size={23} />
      </div>
      <h2 className="mt-4 text-xl font-bold">{titulo}</h2>
      <p className="mt-1 max-w-md text-sm text-ink-muted">{descricao}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function Cabecalho({
  titulo,
  descricao,
  voltar,
  children,
}: {
  titulo: string;
  descricao?: string;
  voltar?: { href: string; texto: string };
  children?: ReactNode;
}) {
  return (
    <div className="mb-7 sm:mb-9">
      {voltar && (
        <Link to={voltar.href} className="text-link mb-4 w-fit">
          <ArrowLeft size={15} />
          {voltar.texto}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">{titulo}</h1>
          {descricao && (
            <p className="mt-2 max-w-2xl text-ink-muted">{descricao}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  ACEITA: "Confirmada",
  CONFIRMADA: "Confirmada",
  PENDENTE: "Pendente",
  CANCELADA: "Cancelada",
  EXPIRADA: "Expirada",
  ENCERRADA: "Concluída",
  RECUSADA: "Recusada",
  ATIVA: "Ativa",
  ATIVO: "Ativo",
  EXPIRADO: "Expirado",
  RECUSADO: "Recusado",
  PROPOSTA: "Em análise",
  PUBLICADO: "Publicado",
  RASCUNHO: "Rascunho",
  REVISADA: "Revisada",
};

export function Status({ status }: { status: string }) {
  const positivo = [
    "ACEITA",
    "CONFIRMADA",
    "ENCERRADA",
    "ATIVA",
    "ATIVO",
    "PUBLICADO",
    "REVISADA",
  ].includes(status);
  const negativo = [
    "CANCELADA",
    "EXPIRADA",
    "EXPIRADO",
    "RECUSADA",
    "RECUSADO",
  ].includes(status);
  const Icone = positivo ? CheckCircle2 : negativo ? XCircle : Clock3;
  return (
    <span
      className={
        "status " +
        (positivo ? "status-ok" : negativo ? "status-off" : "status-wait")
      }
    >
      <Icone size={13} /> {statusLabels[status] ?? status}
    </span>
  );
}
