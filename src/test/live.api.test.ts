// @vitest-environment node
// Opt-in: grava somente registros técnicos próprios e os desativa no finally.
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { cadastrar } from "../services/autenticacao";
import { catalogo } from "../services/catalogo";
import { motorista } from "../services/motorista";
import { parceiro } from "../services/parceiro";
import { request } from "../services/http";
import { amanha, dataApi } from "../utils/formatacao";
import type { Sessao } from "../types/api";

describe.runIf(process.env.PARKWISE_TESTE_ESCRITA === "1")(
  "Integração real com a API publicada",
  () => {
    it("cadastra, autentica, grava, relê e desativa apenas seus próprios registros", async () => {
      const run = randomUUID().slice(0, 8);
      const senha = "QA_Parkwise9!" + randomUUID();
      let cliente: Sessao | undefined;
      let dono: Sessao | undefined;
      let unidadeId: number | undefined;
      let carroId: number | undefined;
      let valorId: number | undefined;
      let reservaId: number | undefined;
      let acessoId: number | undefined;
      let avaliacaoId: number | undefined;
      const limpezas: string[] = [];
      const etapas: string[] = [];
      try {
        expect(Array.isArray(await catalogo.listar())).toBe(true);
        etapas.push("GET público");
        cliente = await cadastrar(
          {
            nome: "QA ParkWise Motorista " + run,
            email: "qa.cliente." + run + "@parkwise.example",
            senha,
            dataNascimento: "2000-01-01",
          },
          "CLIENTE",
        );
        dono = await cadastrar(
          {
            nome: "QA ParkWise Proprietário " + run,
            email: "qa.dono." + run + "@parkwise.example",
            senha,
            dataNascimento: "2000-01-01",
          },
          "DONO",
        );
        expect(cliente.usuario.papel).toBe("CLIENTE");
        expect(dono.usuario.papel).toBe("DONO");
        etapas.push("Cadastro e login de dois perfis");
        const unidade = await parceiro.salvar(dono, {
          nome: "QA ParkWise Unidade " + run,
          endereco: "Unidade técnica de validação",
          numero: "0",
          CEP: "01310-100",
          numeroAlvaraDeFuncionamento: "QA-" + run,
          horaAbertura: "08:00:00",
          horaFechamento: "22:00:00",
          maximoDeVagas: 20,
          vagasPreferenciais: 2,
        });
        unidadeId = unidade.id;
        expect(unidadeId).toBeGreaterThan(0);
        const detalhe = await catalogo.detalhe(unidadeId);
        expect(detalhe.nome).toBe(unidade.nome);
        expect(
          (await parceiro.unidades(dono)).some((u) => u.id === unidadeId),
        ).toBe(true);
        etapas.push("Unidade: POST + GET público + GET do dono");
        const valor = await parceiro.salvarValor(dono, unidadeId, {
          preco: 12.5,
          tipoDeCobranca: "PORHORA",
          tipoDePagamento: "PIX",
          periodo: "UTIL",
        });
        valorId = valor.id;
        expect(
          (await catalogo.valores(unidadeId)).find((v) => v.id === valorId)
            ?.preco,
        ).toBe(12.5);
        etapas.push("Tarifa: POST + GET");
        const placa =
          "QAW" + String(Math.floor(Math.random() * 10000)).padStart(4, "0");
        const carro = await motorista.salvarCarro(cliente, {
          placa,
          modelo: "Veículo técnico QA",
          cor: "Preto",
        });
        carroId = carro.id;
        await motorista.salvarCarro(
          cliente,
          { placa, modelo: "Veículo técnico QA atualizado", cor: "Cinza" },
          carro.id,
        );
        expect(
          (await motorista.carros(cliente)).find((c) => c.id === carro.id)?.cor,
        ).toBe("Cinza");
        etapas.push("Veículo: POST + PUT + GET");
        const reserva = await motorista.reservar(cliente, {
          estacioId: unidadeId,
          dataDaReserva: dataApi(amanha()),
          horaDaReserva: "10:00:00",
        });
        reservaId = reserva.id;
        expect(reserva.statusReserva).toBe("PENDENTE");
        expect(
          (await motorista.reservas(cliente)).some((r) => r.id === reservaId),
        ).toBe(true);
        const confirmada = await parceiro.situacao(
          dono,
          reserva,
          unidadeId,
          "ACEITA",
        );
        expect(confirmada.statusReserva).toBe("ACEITA");
        etapas.push("Reserva: POST + GET do cliente + PUT do dono");
        const acesso = await parceiro.entrada(dono, {
          estacioId: unidadeId,
          placaDoCarro: placa,
          horaDeEntrada: "10:00:00",
        });
        acessoId = acesso.id;
        const saida = await parceiro.saida(dono, acesso, "12:00:00", 25);
        expect(saida.horaDeSaida).toMatch(/^12:00/);
        expect(
          (await parceiro.acessos(dono, unidadeId)).some(
            (a) => a.id === acessoId,
          ),
        ).toBe(true);
        etapas.push("Movimentação: POST + PUT + GET");
        const avaliacao = await motorista.avaliar(
          cliente,
          unidadeId,
          5,
          "Registro técnico de validação, será desativado.",
        );
        avaliacaoId = avaliacao.id;
        expect(
          (await catalogo.avaliacoes(unidadeId)).some(
            (a) => a.id === avaliacaoId,
          ),
        ).toBe(true);
        etapas.push("Avaliação: POST + GET");
        expect(
          (await parceiro.situacao(dono, confirmada, unidadeId, "ENCERRADA"))
            .statusReserva,
        ).toBe("ENCERRADA");
      } finally {
        const remover = async (path: string, sessao?: Sessao) => {
          if (!sessao) return;
          try {
            await request<void>(path, {
              method: "DELETE",
              token: sessao.token,
            });
            limpezas.push(path);
          } catch (e) {
            console.error(
              "Falha ao desativar registro QA " + path,
              e instanceof Error ? e.message : "Falha",
            );
          }
        };
        if (acessoId) await remover("/acesso/" + acessoId, dono);
        if (avaliacaoId) await remover("/avaliacao/" + avaliacaoId, cliente);
        if (reservaId) await remover("/reserva/" + reservaId, dono);
        if (carroId) await remover("/carro/" + carroId, cliente);
        if (valorId) await remover("/valor/" + valorId, dono);
        if (unidadeId) await remover("/estacionamento/" + unidadeId, dono);
        if (cliente) await remover("/cliente/" + cliente.usuario.id, dono);
        if (dono) await remover("/dono/" + dono.usuario.id, dono);
        console.log(
          JSON.stringify({
            run,
            etapas,
            registrosDesativados: limpezas,
            aviso:
              "DELETE da API é desativação lógica; registros técnicos permanecem no histórico do Oracle.",
          }),
        );
      }
      expect(limpezas).toHaveLength(8);
      expect((await catalogo.listar()).some((u) => u.id === unidadeId)).toBe(
        false,
      );
    }, 600_000);
  },
);
