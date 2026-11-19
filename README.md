# ParkWise · front-end integrado à API Java

React + TypeScript + Vite + Tailwind CSS + React Router + Fetch API. Esta versão utiliza a API publicada por padrão e não troca falhas do servidor por dados fictícios.

## Executar

Use Node.js 24.15+ da linha 24 (ou uma versão compatível com `engines`) e npm. Na pasta que contém `package.json`:

```bash
npm ci
npm run dev
```

API padrão: https://gerenciamentoestacionamento-ru6m.onrender.com

Swagger: https://gerenciamentoestacionamento-ru6m.onrender.com/swagger-ui/index.html

Sem `.env`, o aplicativo já consulta essa API. Para outro serviço, copie `.env.example` para `.env.local`, altere `VITE_API_BASE_URL` e reinicie o Vite. A URL não possui `/api/v1` e os recursos do Java são singulares. Nunca coloque credenciais Oracle em variáveis `VITE_*`.

## Fluxo completo

1. Crie uma conta de **proprietário** em Criar conta. Nome, nascimento, e-mail e senha são enviados para `POST /dono`; o login usa JWT.
2. Em **Minhas unidades**, publique um estacionamento com endereço, CEP, alvará, funcionamento e capacidade. Depois cadastre as tarifas.
3. Saia e crie uma conta de **motorista**. Busque a unidade, abra os detalhes e envie uma reserva para uma data futura.
4. Consulte **Minhas reservas**. A situação inicial é Pendente. O cadastro de veículos é independente: a reserva atual do Java não recebe ID do veículo.
5. Entre novamente como proprietário e confirme ou recuse as solicitações em **Gerenciar reservas**. O motorista acompanha a situação atualizada ao abrir ou atualizar sua lista.
6. O proprietário também registra entradas e saídas e os valores da operação. Esses registros não efetuam cobrança financeira.

O banco pode estar vazio. Nesse caso, a busca mostra um estado vazio real; cadastre sua primeira unidade para preencher a lista. Fotografias de substituição são identificadas como ilustrativas.

## Integração e responsabilidades

| Fluxo                    | Rotas reais utilizadas                                                   |
| ------------------------ | ------------------------------------------------------------------------ |
| Cadastro e login         | `POST /cliente`, `POST /dono`, `POST /auth/login`, `POST /auth/me`       |
| Busca e detalhe          | `GET /estacionamento`, `GET /estacionamento/{id}`                        |
| Veículos                 | `GET/POST /cliente/{id}/carros`, `PUT/DELETE /carro/{id}`                |
| Reservar                 | `POST /estacionamento/{id}/reservas`                                     |
| Reservas do motorista    | `GET /cliente/{id}/reservas`                                             |
| Unidades do proprietário | `GET/POST /dono/{id}/estacionamentos`, `PUT/DELETE /estacionamento/{id}` |
| Gerenciar reservas       | `GET /estacionamento/{id}/reservas`, `PUT /reserva/{id}`                 |
| Tarifas                  | `GET/POST /estacionamento/{id}/valores`, `DELETE /valor/{id}`            |
| Movimentação             | `GET/POST /estacionamento/{id}/acessos`, `PUT /acesso/{id}`              |
| Avaliações               | `GET/POST /estacionamento/{id}/avaliacoes`                               |

O front envia as chaves exatas `CEP`, `clienteId`, `estacioId`, `dataDaReserva`, `horaDaReserva` e as enumerações `PENDENTE`, `ACEITA`, `RECUSADA`, `ENCERRADA`. Datas usam ISO com fuso explícito; horários recebem segundos. Busca textual e ordenação são realizadas sobre a lista pública retornada pelo Java.

O token fica em `sessionStorage`, separado por endereço de API. A sessão é validada por `POST /auth/me` ao recarregar; respostas 401 invalidam a sessão. A resposta de perfil do Java contém um campo `senha`: o front descarta esse campo e mantém somente id, nome, e-mail e papel. A leitura do papel do JWT serve para navegação; a autorização de verdade continua sendo responsabilidade do servidor.

O serviço grátis pode precisar iniciar na primeira consulta. O cliente aguarda até 90 segundos, oferece nova tentativa e não repete automaticamente operações de escrita.

## Escopo desta versão

A API atual não oferece pagamentos, planos recorrentes, cotas empresariais, conciliação financeira ou disponibilidade por intervalo. As telas anteriores que pressupunham esses contratos foram substituídas pelos fluxos reais acima. Capacidade total não é apresentada como disponibilidade garantida; uma solicitação começa pendente.

O motorista não recebe um botão de cancelamento que chamaria uma rota proibida: o Java atual permite a exclusão de reservas apenas aos perfis operacionais. A confirmação, recusa ou conclusão é feita pelo proprietário.

Os perfis implementados e verificados neste front são CLIENTE e DONO. Usuários GERENTE/ADMIN continuam sendo perfis do backend, sem painel administrativo específico nesta versão.

## Verificações

```bash
npm run check
```

Executa lint, testes isolados, TypeScript e build. Os testes isolados usam respostas controladas para verificar validações, erros, carregamento, sessão e contratos sem depender da rede. O app normal continua utilizando a API real.

```bash
npm run test:api
```

Este comando é **opt-in e grava na API configurada**. Cria contas e registros QA próprios, autentica dois perfis, cria unidade, tarifa, veículo, reserva, movimentação e avaliação, relê os dados e os desativa no `finally`. A exclusão do Java é lógica: o histórico técnico permanece no Oracle. O comando nunca modifica registros existentes de outros usuários. O teste é ignorado em `npm test` normal.

## Publicar na Vercel

Importe o repositório do front, selecione Vite, use `npm run build` e saída `dist`. O `vercel.json` permite abrir diretamente as rotas da SPA. A URL padrão do Java já está no código; para outra API, configure `VITE_API_BASE_URL` na Vercel e publique novamente. O backend deve autorizar a origem do front via CORS.

| Informação da entrega        | Estado                                                           |
| ---------------------------- | ---------------------------------------------------------------- |
| API Java e Swagger           | Links reais acima                                                |
| Repositório do backend       | https://github.com/pedrohcnascimento/GerenciamentoEstacionamento |
| Repositório do front         | Preencher após publicar o novo projeto                           |
| URL Vercel                   | Preencher após publicar                                          |
| Vídeo YouTube, até 3 minutos | Preencher após gravar                                            |
| Integrantes, RM e turma      | Completar `integrantes.txt` e `src/config/equipe.ts`             |

As cinco páginas institucionais são `/`, `/integrantes`, `/sobre`, `/faq` e `/contato`. A solução contém busca, detalhe dinâmico, autenticação, veículos, reservas e área do proprietário. A página Contato prepara uma mensagem; só abre e-mail quando `VITE_CONTATO_EMAIL` estiver configurado. Não afirma ter enviado mensagens.

Para o vídeo, demonstre validação de formulário, GET real, cadastro de unidade ou veículo com releitura, reserva pendente e confirmação, responsividade, GitHub e deploy. O guia HTML separado reconstrói este projeto em 25 etapas com verificação de arquivos e testes. Cada integrante deve revisar, entender e executar sua contribuição antes de apresentar.

## Estrutura e uso de IA

`components`: interface reutilizável; `pages`: rotas; `services`: Fetch e contratos Java; `contexts`: sessão e feedback; `types`: DTOs; `utils`: validação e datas; `test`: verificações; `scripts`: teste real opt-in.

Foi utilizado ChatGPT/Codex para adaptação dos contratos, implementação, organização do roteiro e execução de testes. A equipe deve revisar o código e compreender os fluxos e limitações para a apresentação presencial.
