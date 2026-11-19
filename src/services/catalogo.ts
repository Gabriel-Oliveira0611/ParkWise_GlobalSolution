import type { Avaliacao, Estacionamento, Valor } from "../types/api";
import { ApiError, request } from "./http";
export const catalogo = {
  listar: () => request<Estacionamento[]>("/estacionamento"),
  detalhe: async (id: number) => {
    const local = await request<Estacionamento>("/estacionamento/" + id);
    if (local.status === false) throw new ApiError(404, "Estacionamento não encontrado.");
    return local;
  },
  valores: (id: number) => request<Valor[]>(`/estacionamento/${id}/valores`),
  avaliacoes: (id: number) =>
    request<Avaliacao[]>(`/estacionamento/${id}/avaliacoes`),
};
export function filtrarLocais(
  locais: Estacionamento[],
  busca: string,
  preferencial = false,
) {
  const normalizar = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const texto = normalizar(busca.trim());
  return locais.filter(
    (l) =>
      l.status !== false &&
      (!preferencial || l.vagasPreferenciais > 0) &&
      normalizar([l.nome, l.endereco, l.numero, l.CEP].join(" ")).includes(
        texto,
      ),
  );
}
