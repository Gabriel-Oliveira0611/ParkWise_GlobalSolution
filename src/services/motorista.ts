import type {
  Avaliacao,
  Carro,
  CarroInput,
  Reserva,
  ReservaInput,
  Sessao,
} from "../types/api";
import { request } from "./http";
export const motorista = {
  carros: (s: Sessao) =>
    request<Carro[]>(`/cliente/${s.usuario.id}/carros`, { token: s.token }),
  salvarCarro: (s: Sessao, dados: CarroInput, id?: number) =>
    request<Carro>(id ? `/carro/${id}` : `/cliente/${s.usuario.id}/carros`, {
      method: id ? "PUT" : "POST",
      token: s.token,
      body: { ...dados, clienteId: s.usuario.id },
    }),
  removerCarro: (s: Sessao, id: number) =>
    request<void>(`/carro/${id}`, { method: "DELETE", token: s.token }),
  reservas: (s: Sessao) =>
    request<Reserva[]>(`/cliente/${s.usuario.id}/reservas`, { token: s.token }),
  reservar: (
    s: Sessao,
    dados: Omit<ReservaInput, "clienteId" | "statusReserva">,
  ) =>
    request<Reserva>(`/estacionamento/${dados.estacioId}/reservas`, {
      method: "POST",
      token: s.token,
      body: { ...dados, clienteId: s.usuario.id, statusReserva: "PENDENTE" },
    }),
  avaliar: (s: Sessao, id: number, nota: number, comentario: string) =>
    request<Avaliacao>(`/estacionamento/${id}/avaliacoes`, {
      method: "POST",
      token: s.token,
      body: {
        clienteId: s.usuario.id,
        estacionamentoId: id,
        nota,
        comentario,
        dataDeAvaliacao: new Date().toISOString(),
      },
    }),
};
