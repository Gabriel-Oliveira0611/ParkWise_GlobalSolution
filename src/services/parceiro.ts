import type {
  Acesso,
  AcessoInput,
  Estacionamento,
  EstacionamentoInput,
  Reserva,
  Sessao,
  SituacaoReserva,
  Valor,
  ValorInput,
} from "../types/api";
import { request } from "./http";
export const parceiro = {
  unidades: (s: Sessao) =>
    request<Estacionamento[]>(`/dono/${s.usuario.id}/estacionamentos`, {
      token: s.token,
    }),
  salvar: (s: Sessao, dados: EstacionamentoInput, id?: number) =>
    request<Estacionamento>(
      id ? `/estacionamento/${id}` : `/dono/${s.usuario.id}/estacionamentos`,
      { method: id ? "PUT" : "POST", token: s.token, body: dados },
    ),
  remover: (s: Sessao, id: number) =>
    request<void>(`/estacionamento/${id}`, {
      method: "DELETE",
      token: s.token,
    }),
  reservas: (s: Sessao, id: number) =>
    request<Reserva[]>(`/estacionamento/${id}/reservas`, { token: s.token }),
  situacao: (
    s: Sessao,
    reserva: Reserva,
    id: number,
    status: SituacaoReserva,
  ) =>
    request<Reserva>(`/reserva/${reserva.id}`, {
      method: "PUT",
      token: s.token,
      body: {
        clienteId: reserva.cliente.id,
        estacioId: id,
        dataDaReserva: reserva.dataDaReserva,
        horaDaReserva: reserva.horaDaReserva,
        statusReserva: status,
      },
    }),
  salvarValor: (s: Sessao, id: number, dados: ValorInput) =>
    request<Valor>(`/estacionamento/${id}/valores`, {
      method: "POST",
      token: s.token,
      body: { ...dados, estacionamentoId: id },
    }),
  removerValor: (s: Sessao, id: number) =>
    request<void>(`/valor/${id}`, { method: "DELETE", token: s.token }),
  acessos: (s: Sessao, id: number) =>
    request<Acesso[]>(`/estacionamento/${id}/acessos`, { token: s.token }),
  entrada: (s: Sessao, dados: AcessoInput) =>
    request<Acesso>(`/estacionamento/${dados.estacioId}/acessos`, {
      method: "POST",
      token: s.token,
      body: dados,
    }),
  saida: (s: Sessao, acesso: Acesso, saida: string, valorAPagar?: number) =>
    request<Acesso>(`/acesso/${acesso.id}`, {
      method: "PUT",
      token: s.token,
      body: {
        estacioId: acesso.estacioId,
        carroId: acesso.carroId,
        placaDoCarro: acesso.placaDoCarro,
        horaDeEntrada: acesso.horaDeEntrada,
        horaDeSaida: saida,
        valorAPagar,
      },
    }),
};
