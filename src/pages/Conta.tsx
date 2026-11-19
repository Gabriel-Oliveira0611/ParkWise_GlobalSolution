import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Botao, Campo, Aviso } from "../components/UI";
import { destinoInterno } from "../components/Protegido";
import { useSessao } from "../contexts/SessaoContext";
import { useFeedback } from "../contexts/FeedbackContext";
import { cadastrar, entrar } from "../services/autenticacao";
import { useAcao } from "../utils/estado";
import { maiorDeIdade, senhaValida } from "../utils/formatacao";
export function Conta({ cadastro = false }: { cadastro?: boolean }) {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const { atualizar } = useSessao();
  const avisar = useFeedback();
  const acao = useAcao();
  const [perfil, definirPerfil] = useState<"CLIENTE" | "DONO">(
    params.get("perfil") === "DONO" ? "DONO" : "CLIENTE",
  );
  const [erros, definirErros] = useState<Record<string, string>>({});
  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dados = {
      nome: String(form.get("nome") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      senha: String(form.get("senha") ?? ""),
      dataNascimento: String(form.get("dataNascimento") ?? ""),
    };
    const invalidos: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email))
      invalidos.email = "Informe um e-mail válido.";
    if (!dados.senha) invalidos.senha = "Informe sua senha.";
    if (cadastro) {
      if (dados.nome.length < 2) invalidos.nome = "Informe seu nome completo.";
      if (!senhaValida(dados.senha))
        invalidos.senha =
          "Use pelo menos 8 caracteres, maiúscula, minúscula, número e símbolo.";
      if (!maiorDeIdade(dados.dataNascimento))
        invalidos.dataNascimento = "É necessário ter 18 anos ou mais.";
    }
    definirErros(invalidos);
    if (Object.keys(invalidos).length) return;
    void acao.executar(
      () =>
        cadastro ? cadastrar(dados, perfil) : entrar(dados.email, dados.senha),
      (sessao) => {
        atualizar(sessao);
        avisar(
          cadastro
            ? "Conta criada. Bem-vindo ao ParkWise!"
            : "Você entrou no ParkWise.",
        );
        navegar(
          destinoInterno(
            params.get("voltar"),
            sessao.usuario.papel === "DONO" ? "/parceiro" : "/estacionamentos",
          ),
          { replace: true },
        );
      },
    );
  }
  return (
    <div className="container-site page">
      <section className="auth-panel mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-pine-700">
          Seu lugar na cidade
        </p>
        <h1 className="page-title mt-3">
          {cadastro ? "Vamos começar?" : "Bom ter você aqui."}
        </h1>
        <p className="mt-3 text-ink-muted">
          {cadastro
            ? "Crie sua conta para reservar ou gerenciar um estacionamento."
            : "Entre para acompanhar suas reservas e seus estacionamentos."}
        </p>
        <form className="mt-6 grid gap-4" onSubmit={enviar} noValidate>
          {cadastro && (
            <>
              <fieldset className="grid grid-cols-2 gap-2">
                <legend className="mb-2 text-sm font-bold">
                  Quero usar como
                </legend>
                {(["CLIENTE", "DONO"] as const).map((p) => (
                  <label
                    key={p}
                    className={
                      "button " +
                      (perfil === p ? "button-primary" : "button-secondary")
                    }
                  >
                    <input
                      type="radio"
                      name="perfil"
                      value={p}
                      checked={perfil === p}
                      onChange={() => definirPerfil(p)}
                    />
                    {p === "DONO" ? "Proprietário" : "Motorista"}
                  </label>
                ))}
              </fieldset>
              <Campo
                label="Nome completo"
                name="nome"
                autoComplete="name"
                required
                maxLength={255}
                erro={erros.nome}
              />
              <Campo
                label="Data de nascimento"
                name="dataNascimento"
                type="date"
                autoComplete="bday"
                required
                erro={erros.dataNascimento}
              />
            </>
          )}
          <Campo
            label="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={255}
            erro={erros.email}
          />
          <Campo
            label="Senha"
            type="password"
            name="senha"
            autoComplete={cadastro ? "new-password" : "current-password"}
            required
            maxLength={128}
            erro={erros.senha}
            dica={
              cadastro
                ? "8 caracteres ou mais, com maiúscula, minúscula, número e símbolo."
                : undefined
            }
          />
          {acao.erro && <Aviso mensagem={acao.erro} />}
          <Botao type="submit" disabled={acao.processando}>
            {acao.processando
              ? "Aguarde…"
              : cadastro
                ? "Criar conta"
                : "Entrar"}
          </Botao>
        </form>
        <p className="mt-5 text-sm text-ink-muted">
          {cadastro ? "Já tem uma conta? " : "Primeira vez aqui? "}
          <Link
            className="text-link"
            to={
              (cadastro ? "/entrar" : "/cadastro") +
              (params.toString() ? "?" + params.toString() : "")
            }
          >
            {cadastro ? "Entrar" : "Criar conta"}
          </Link>
        </p>
      </section>
    </div>
  );
}
