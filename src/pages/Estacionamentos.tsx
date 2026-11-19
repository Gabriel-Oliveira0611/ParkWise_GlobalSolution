import { useCallback, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { catalogo, filtrarLocais } from "../services/catalogo";
import { useConsulta } from "../utils/estado";
import { EstacionamentoCard } from "../components/EstacionamentoCard";
import { Botao, Cabecalho, Carregando, Falha, Vazio } from "../components/UI";
export function Estacionamentos() {
  const [params, alterar] = useSearchParams();
  const [busca, buscar] = useState(params.get("busca") ?? "");
  const [preferencial, preferir] = useState(false);
  const [ordem, ordenar] = useState("nome");
  const carregar = useCallback(() => catalogo.listar(), []);
  const { estado, recarregar } = useConsulta(carregar);
  const locais =
    estado.status === "ok"
      ? filtrarLocais(
          estado.dados,
          params.get("busca") ?? "",
          preferencial,
        ).toSorted((a, b) =>
          ordem === "capacidade"
            ? b.maximoDeVagas - a.maximoDeVagas
            : a.nome.localeCompare(b.nome),
        )
      : [];
  return (
    <div className="container-site page">
      <Cabecalho
        titulo="Encontre seu estacionamento"
        descricao="Consulte locais cadastrados, horários e estrutura antes de planejar sua chegada."
      />
      <form
        className="filter-bar"
        onSubmit={(e) => {
          e.preventDefault();
          alterar(busca ? { busca } : {});
        }}
      >
        <div className="field-group min-w-0 flex-1">
          <label htmlFor="busca">Rua, nome ou CEP</label>
          <input
            id="busca"
            value={busca}
            className="field"
            onChange={(e) => buscar(e.target.value)}
            placeholder="Onde você quer estacionar?"
          />
        </div>
        <Botao type="submit">Buscar</Botao>
        <label className="check-label">
          <input
            type="checkbox"
            checked={preferencial}
            onChange={(e) => preferir(e.target.checked)}
          />{" "}
          Com vagas preferenciais
        </label>
        <label className="field-group">
          Ordenar por
          <select
            className="field"
            value={ordem}
            onChange={(e) => ordenar(e.target.value)}
          >
            <option value="nome">Nome</option>
            <option value="capacidade">Capacidade total</option>
          </select>
        </label>
      </form>
      <div className="mt-7">
        {estado.status === "carregando" && (
          <Carregando mensagem="Consultando estacionamentos. A primeira conexão pode levar cerca de um minuto…" />
        )}
        {estado.status === "erro" && (
          <Falha mensagem={estado.mensagem} tentar={recarregar} />
        )}
        {estado.status === "ok" && (
          <>
            <p className="mb-4 text-sm text-ink-muted" role="status">
              {locais.length}{" "}
              {locais.length === 1
                ? "estacionamento encontrado"
                : "estacionamentos encontrados"}
            </p>
            {locais.length ? (
              <div className="parking-grid">
                {locais.map((l) => (
                  <EstacionamentoCard local={l} key={l.id} />
                ))}
              </div>
            ) : (
              <Vazio
                titulo="Nenhum estacionamento encontrado"
                descricao="Tente outro endereço ou volte mais tarde. Novas unidades aparecem aqui após o cadastro."
              >
                <Link
                  className="button button-secondary"
                  to="/cadastro?perfil=DONO"
                >
                  Cadastrar minha unidade
                </Link>
              </Vazio>
            )}
          </>
        )}
      </div>
    </div>
  );
}
