export const reais = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const hora = (valor?: string) => valor?.slice(0, 5) || "Não informado";
export const horaApi = (valor: string) =>
  valor.length === 5 ? valor + ":00" : valor;
export const dataApi = (valor: string) => valor + "T12:00:00-03:00";
export function dataBR(valor?: string) {
  return valor
    ? valor.slice(0, 10).split("-").reverse().join("/")
    : "Não informado";
}
export function amanha() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
export const placaNormalizada = (placa: string) =>
  placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
export const placaValida = (placa: string) =>
  /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placaNormalizada(placa));
export const idValido = (id: number) => Number.isSafeInteger(id) && id > 0;
export function maiorDeIdade(data: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const hoje = new Date();
  const limite = new Date(
    hoje.getFullYear() - 18,
    hoje.getMonth(),
    hoje.getDate(),
  );
  const nascimento = new Date(data + "T12:00:00");
  return (
    Number.isFinite(nascimento.getTime()) &&
    nascimento <= limite &&
    nascimento.getFullYear() >= 1900
  );
}
export const senhaValida = (senha: string) =>
  senha.length >= 8 &&
  /[A-Z]/.test(senha) &&
  /[a-z]/.test(senha) &&
  /\d/.test(senha) &&
  /[^A-Za-z0-9]/.test(senha);
