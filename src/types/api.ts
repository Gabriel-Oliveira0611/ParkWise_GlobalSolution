export type Papel = "CLIENTE" | "DONO" | "GERENTE" | "ADMIN";
export interface UsuarioDTO {
  id: number;
  nome: string;
  email: string;
  dataNascimento?: string;
  status?: boolean;
}
export interface Usuario extends UsuarioDTO {
  papel: Papel;
}
export interface Sessao {
  token: string;
  usuario: Usuario;
}
export interface Cadastro {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: string;
}
export interface CarroInput {
  placa: string;
  modelo: string;
  cor: string;
}
export interface Carro extends CarroInput {
  id: number;
  clienteId: number;
  status: boolean;
}
export interface EstacionamentoInput {
  nome: string;
  endereco: string;
  CEP: string;
  numero: string;
  foto?: string;
  numeroAlvaraDeFuncionamento: string;
  horaAbertura: string;
  horaFechamento: string;
  vagasPreferenciais: number;
  maximoDeVagas: number;
  numeroDeEscrituraImovel?: string;
}
export interface Estacionamento extends EstacionamentoInput {
  id: number;
  status: boolean;
}
export type SituacaoReserva = "PENDENTE" | "ACEITA" | "RECUSADA" | "ENCERRADA";
export interface ReservaInput {
  clienteId: number;
  estacioId: number;
  dataDaReserva: string;
  horaDaReserva: string;
  statusReserva: SituacaoReserva;
}
export interface Reserva {
  id: number;
  cliente: UsuarioDTO;
  estacionamento?: Estacionamento;
  dataDaReserva: string;
  horaDaReserva: string;
  statusReserva: SituacaoReserva;
  status: boolean;
}
export interface ValorInput {
  tipoDeCobranca: "PORHORA" | "PORVAGA";
  tipoDePagamento: "PIX" | "DEBITO" | "DINHEIRO";
  preco: number;
  periodo: "UTIL" | "FINALDESEMANA";
  estacionamentoId?: number;
}
export interface Valor extends ValorInput {
  id: number;
  estacioId: number;
  status: boolean;
}
export interface AcessoInput {
  carroId?: number;
  placaDoCarro: string;
  horaDeEntrada: string;
  horaDeSaida?: string;
  valorAPagar?: number;
  estacioId: number;
}
export interface Acesso extends AcessoInput {
  id: number;
  totalHoras?: number;
  status: boolean;
}
export interface Avaliacao {
  id: number;
  cliente: UsuarioDTO;
  estacioId: number;
  nota: number;
  comentario: string;
  dataDeAvaliacao: string;
  status: boolean;
}