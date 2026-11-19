import { afterEach, describe, expect, it, vi } from "vitest";
import { catalogo, filtrarLocais } from "../services/catalogo";
import {
  cadastrar,
  carregarSessao,
  entrar,
  lerPapel,
} from "../services/autenticacao";
import { motorista } from "../services/motorista";
import { parceiro } from "../services/parceiro";
import type { Estacionamento, Sessao } from "../types/api";
afterEach(() => vi.unstubAllGlobals());
export const tokenTeste = (
  role = "CLIENTE",
  exp = Math.floor(Date.now() / 1000) + 3600,
) =>
  "header." +
  btoa(JSON.stringify({ role, exp })).replace(/=/g, "") +
  ".assinatura";
const sessao: Sessao = {
  token: "token",
  usuario: {
    id: 7,
    nome: "Motorista",
    email: "teste@example.test",
    papel: "CLIENTE",
  },
};
const local: Estacionamento = {
  id: 3,
  nome: "São Paulo Centro",
  endereco: "Av. Paulista",
  numero: "100",
  CEP: "01310-100",
  horaAbertura: "08:00:00",
  horaFechamento: "22:00:00",
  maximoDeVagas: 20,
  vagasPreferenciais: 2,
  numeroAlvaraDeFuncionamento: "A123",
  status: true,
};
function stub(data: unknown = []) {
  const fn = vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify(data), { status: 200 })),
    );
  vi.stubGlobal("fetch", fn);
  return fn;
}
describe("Contrato real dos serviços", () => {
  it("consulta a rota singular do catálogo", async () => {
    const f = stub([]);
    await catalogo.listar();
    expect(f.mock.calls[0][0]).toMatch(/\/estacionamento$/);
  });
  it("filtra por nome ou endereço sem acentos e por estrutura preferencial", () => {
    expect(filtrarLocais([local], "sao")).toHaveLength(1);
    expect(filtrarLocais([local], "paulista", true)).toHaveLength(1);
    expect(filtrarLocais([local], "Pinheiros")).toHaveLength(0);
    expect(
      filtrarLocais([{ ...local, vagasPreferenciais: 0 }], "", true),
    ).toHaveLength(0);
  });
  it("consulta o perfil com POST /auth/me e descarta o campo senha", async () => {
    const f = stub({
      id: 7,
      nome: "Nome",
      email: "n@example.test",
      senha: "HASH_NAO_PERSISTIR",
    });
    const s = await carregarSessao(tokenTeste());
    expect(f.mock.calls[0][0]).toMatch(/\/auth\/me$/);
    expect(f.mock.calls[0][1].method).toBe("POST");
    expect(JSON.stringify(s)).not.toContain("HASH_NAO_PERSISTIR");
    expect(s.usuario.papel).toBe("CLIENTE");
  });
  it("recusa JWT expirado ou papel desconhecido", () => {
    expect(() => lerPapel(tokenTeste("CLIENTE", 1))).toThrow("expirou");
    expect(() => lerPapel(tokenTeste("EMPRESA"))).toThrow("expirou");
    expect(() => lerPapel("inválido")).toThrow("expirou");
  });
  it("faz login e valida o token no servidor", async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: tokenTeste("DONO") })),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ id: 5, nome: "Dono", email: "d@example.test" }),
        ),
      );
    vi.stubGlobal("fetch", f);
    expect((await entrar("d@example.test", "Senha")).usuario.papel).toBe(
      "DONO",
    );
    expect(f.mock.calls).toHaveLength(2);
  });
  it("cadastra proprietário incluindo a data obrigatória", async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(new Response('{"id":5}', { status: 201 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: tokenTeste("DONO") })),
      )
      .mockResolvedValueOnce(
        new Response('{"id":5,"nome":"Dono","email":"d@example.test"}'),
      );
    vi.stubGlobal("fetch", f);
    await cadastrar(
      {
        nome: "Dono",
        email: "d@example.test",
        senha: "Senha_123",
        dataNascimento: "2000-01-01",
      },
      "DONO",
    );
    expect(f.mock.calls[0][0]).toMatch(/\/dono$/);
    expect(JSON.parse(f.mock.calls[0][1].body).dataNascimento).toBe(
      "2000-01-01T12:00:00-03:00",
    );
  });
  it("vincula o veículo ao cliente autenticado", async () => {
    const f = stub({ id: 1 });
    await motorista.salvarCarro(sessao, {
      placa: "ABC1D23",
      modelo: "Carro",
      cor: "Preto",
    });
    expect(f.mock.calls[0][0]).toMatch(/\/cliente\/7\/carros$/);
    expect(JSON.parse(f.mock.calls[0][1].body).clienteId).toBe(7);
  });
  it("edita veículo por PUT e remove por DELETE", async () => {
    const f = stub({});
    await motorista.salvarCarro(
      sessao,
      { placa: "ABC1D23", modelo: "Carro", cor: "Preto" },
      9,
    );
    expect(f.mock.calls[0][0]).toMatch(/\/carro\/9$/);
    expect(f.mock.calls[0][1].method).toBe("PUT");
    await motorista.removerCarro(sessao, 9);
    expect(f.mock.calls[1][1].method).toBe("DELETE");
  });
  it("solicita reserva pendente pela rota aninhada sem inventar veículo ou pagamento", async () => {
    const f = stub({ id: 1 });
    await motorista.reservar(sessao, {
      estacioId: 3,
      dataDaReserva: "2026-12-25T12:00:00-03:00",
      horaDaReserva: "10:00:00",
    });
    expect(f.mock.calls[0][0]).toMatch(/\/estacionamento\/3\/reservas$/);
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({
      estacioId: 3,
      clienteId: 7,
      dataDaReserva: "2026-12-25T12:00:00-03:00",
      horaDaReserva: "10:00:00",
      statusReserva: "PENDENTE",
    });
  });
  it("busca somente as reservas do cliente selecionado", async () => {
    const f = stub([]);
    await motorista.reservas(sessao);
    expect(f.mock.calls[0][0]).toMatch(/\/cliente\/7\/reservas$/);
  });
  it("publica a unidade na rota do proprietário com CEP preservado", async () => {
    const f = stub(local);
    const s = {
      ...sessao,
      usuario: { ...sessao.usuario, papel: "DONO" as const },
    };
    await parceiro.salvar(s, local);
    expect(f.mock.calls[0][0]).toMatch(/\/dono\/7\/estacionamentos$/);
    expect(JSON.parse(f.mock.calls[0][1].body).CEP).toBe("01310-100");
  });
  it("envia enumerações de tarifa aceitas pelo Java", async () => {
    const f = stub({});
    await parceiro.salvarValor(sessao, 3, {
      preco: 12,
      tipoDeCobranca: "PORHORA",
      tipoDePagamento: "PIX",
      periodo: "UTIL",
    });
    expect(f.mock.calls[0][0]).toMatch(/\/estacionamento\/3\/valores$/);
    expect(JSON.parse(f.mock.calls[0][1].body).estacionamentoId).toBe(3);
  });
  it("envia a saída pela atualização completa de acesso", async () => {
    const f = stub({});
    await parceiro.saida(
      sessao,
      {
        id: 5,
        estacioId: 3,
        placaDoCarro: "ABC1D23",
        horaDeEntrada: "08:00:00",
        status: true,
      },
      "10:00:00",
      20,
    );
    expect(f.mock.calls[0][0]).toMatch(/\/acesso\/5$/);
    expect(f.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(f.mock.calls[0][1].body).valorAPagar).toBe(20);
  });
});
