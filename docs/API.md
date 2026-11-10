# APIs e Contratos — GreenER

Este documento define as fronteiras de comunicação do GreenER. Na arquitetura-alvo, o frontend
consome exclusivamente a API interna do backend; o backend integra as APIs
externas e disponibiliza ao frontend os dados validados e processados.
Responsabilidades e camadas do backend estão em
[`../backend/arquitetura.md`](../backend/arquitetura.md).

## 1. Fluxo de comunicação

```text
Frontend GreenER
    ↓ HTTP
API REST do backend GreenER
    ├── PostgreSQL
    ├── Greener Metrics Aggregator API
    └── Greener Carbon Intensity API
```

O frontend não chama diretamente os serviços externos. Os contratos externos
ficam isolados nas integrações do backend, que validam as respostas antes de
fornecê-las ao restante da aplicação.

## 2. API REST do GreenER

A implementação atual oferece listagem e detalhe de serviços, histórico de métricas,
resultados das tentativas de coleta, estado do monitoramento, dados regionais e
comparação de serviços e ranking ambiental. O dashboard e o
detalhe de serviço da interface consomem a lista, o detalhe e o histórico de
serviços, sem dados simulados. Essas telas buscam a API ao abrir, ao trocar
filtro, serviço ou período e depois de cada rodada de coleta do backend
(quando `lastRoundFinishedAt` muda), sem recarregar a página; a barra mostra
a data e a hora da última atualização da tela. A barra de
monitoramento consulta `/monitoring/status` 1 segundo depois de cada
`nextCollectionAt` (nunca em intervalo menor que 1 segundo).

### 2.1. Operações implementadas

Base local: `http://localhost:3000`. As rotas de negócio usam o prefixo
`/api/v1`. O recurso principal é `/services`; `/service` permanece como alias
para listagem, detalhe, histórico de métricas e histórico de tentativas.

| Método | Caminho real | Responsabilidade | Autenticação |
|---|---|---|---|
| `GET` | `/health` | Informar que o processo HTTP está disponível. | Não exige. |
| `GET` | `/api/v1/services` | Listar serviços, localização e última coleta, com filtros opcionais. | Não exige. |
| `GET` | `/api/v1/services/:externalId` | Entregar identificação, estado, localização e última coleta válida. | Não exige. |
| `GET` | `/api/v1/services/:externalId/collections` | Entregar pontos agrupados e totais do período. | Não exige. |
| `GET` | `/api/v1/services/:externalId/collection-status` | Listar as últimas observações de coleta do serviço. | Não exige. |
| `GET` | `/api/v1/collections/status` | Listar serviços pelo resultado da última tentativa, com busca, filtro, resumo e paginação. | Não exige. |
| `GET` | `/api/v1/regions` | Entregar as regiões, dados ambientais, contadores atuais e totais do período. | Não exige. |
| `GET` | `/api/v1/monitoring/status` | Informar horários, contadores e resultados observados pelo job. | Não exige. |
| `GET` | `/api/v1/rankings` | Classificar serviços por energia ou CO₂e no período. | Não exige. |
| `POST` | `/api/v1/comparisons` | Comparar os totais e 120 pontos por seleção, com simulação opcional de região. | Não exige. |

`externalId` é o identificador da API externa salvo em `servico.external_id`,
por exemplo `billing-api`; não é o BIGINT interno. O parâmetro aceita de 1 a
100 caracteres, usando letras, números, ponto, sublinhado e hífen.

#### Listagem de serviços

```http
GET /api/v1/services?regionCode=br-sudeste&active=true
```

Filtros opcionais: `regionCode` (string de 1 a 100 caracteres) e `active`
(`true` ou `false`). O schema rejeita parâmetros extras, repetidos e valores
inválidos com 400. Sem filtros, retorna todos os serviços cadastrados.
Resposta: `{ generatedAt, filters: { regionCode, active }, services }`;
filtros ausentes aparecem como `null`. Cada item contém `id` externo, `name`,
`active`, `status`, `statusUpdatedAt`, `lastSeenAt`, `location` e
`latestCollection` (ou `null` sem coleta). Lista sem resultados retorna 200
com `services: []`. `active` indica presença na descoberta, não sucesso da coleta.

#### Detalhe e última coleta

```http
GET /api/v1/service/billing-api
```

Não recebe corpo nem filtros de período. Resposta 200:

- `service` inclui `id`, `name`, `active`, `status`, `statusUpdatedAt`, `lastSeenAt` e `location`.
- `service.location` inclui código, país, região, cidade, coordenadas e fator de carbono
  atual. Cidade e coordenadas podem ser `null`; a localização também pode
  ser `null`.
- `latestCollection`: horário, intervalo da amostra, métricas e estimativas
  da última coleta válida. Sem coleta, retorna `null`, sem inventar zeros.
- CPU é percentual; recursos usam GB; potência usa W; energia usa kWh; CO₂e
  usa gramas; intensidade usa gCO₂e/kWh.
- `lastSeenAt` é a última aparição na descoberta. `collectedAt` é o horário
  da coleta válida. Falha recente não transforma dados antigos em recentes.

Serviço conhecido, inclusive inativo, retorna 200. Serviço desconhecido
retorna 404; identificador inválido retorna 400; falha interna retorna 500.

#### Histórico e totais

```http
GET /api/v1/service/billing-api/collections?range=6h&maxPoints=120
```

| Query | Regra |
|---|---|
| `range` | Opcional: `1h`, `6h`, `24h`, `7d` ou `30d`; padrão `24h`. |
| `maxPoints` | Opcional: inteiro de 1 a 300; padrão 120. |
| `to` | Opcional: data ISO 8601 com fuso. |

O endpoint atual não recebe `from`: o service o calcula a partir de `range`.
Sem `to`, a referência é a última coleta válida; a implementação acrescenta
1 milissegundo para incluir a fração de microssegundos do PostgreSQL, pois
`Date` tem precisão de milissegundos. Sem qualquer coleta, usa agora como
referência e devolve uma consulta vazia. Com `to` explícito, respeita a data
recebida.

O filtro SQL usa início exclusivo e fim inclusivo: `coletado_em > from` e
`coletado_em <= to`. Os pontos são agrupados por `DATE_BIN`; `timestamp`
representa o início da faixa, não o horário exato de uma medição individual.

Resposta 200:

- `generatedAt`, `serviceId`, `range`, `period.from` e `period.to` em UTC.
- `maxPoints` e `bucketSeconds`, calculado conforme período e resolução.
- `summary`: `sampleCount`, `energyKwh` e `co2eGrams` do período completo.
- `points`: lista ordenada com `timestamp`, `sampleCount`, médias de CPU,
  memória e potência, CO₂e médio por coleta e somas de energia e CO₂e por faixa.
- Sem dados: `points: []`, `sampleCount: 0` e somas `null`.

A quantidade de pontos pode ser menor que `maxPoints`; faixas vazias não
recebem zeros artificiais. Os totais somam as amostras armazenadas, sem
garantir cobertura contínua de todo o período. Quando a referência for uma
coleta antiga, a tela deve informar o período real e a desatualização.

Período sem dados retorna 200. Parâmetros inválidos retornam 400; serviço
desconhecido retorna 404; falha interna retorna 500. Exemplo de erro:

```json
{
  "error": {
    "message": "Serviço nao-existe não foi encontrado"
  }
}
```

O estado do monitoramento está detalhado na seção 7.

#### Status das coletas por serviço

```http
GET /api/v1/collections/status?search=billing&result=failure&page=1&limit=20
```

| Query | Regra |
|---|---|
| `search` | Opcional. Busca por trecho do nome ou do `externalId`, sem distinção entre maiúsculas e minúsculas. Até 100 caracteres após remover espaços nas extremidades. |
| `result` | Opcional. `success`, `failure` ou `pending`. |
| `page` | Inteiro a partir de 1. Padrão `1`. |
| `limit` | Inteiro de 1 a 100. Padrão `20`. |

A consulta inclui serviços ativos e inativos, ordenados por nome. O `result`
vem do registro mais recente de `status_coleta`, ordenado por `observado_em`
e `id` decrescentes. O tipo `success` resulta em `success`, os demais tipos
resultam em `failure`, e a ausência de registro resulta em `pending`.

A resposta 200 contém `summary`, `items` e `pagination`. O `summary` conta os
serviços encontrados pela busca em `totalServices`, `successfulServices`,
`failedServices` e `pendingServices`, antes do filtro `result` e da paginação.
Já `pagination` contém `page`, `limit`, `total` e `totalPages` com base na
lista após os filtros. Páginas sem resultados retornam `items: []`.

Cada item contém `externalId`, `name`, `location` (`regionCode`, `city`,
`country`), `result` e `latestAttempt` (`observedAt`, `type`, `description`,
`httpStatus`) ou `null`. O campo `lastSuccessfulCollectionAt` vem da última
amostra salva em `coleta` e é `null` quando o serviço ainda não tem amostras.
Assim, um serviço pode ter falhado na última tentativa e manter a data de uma
coleta anterior. Parâmetros inválidos ou desconhecidos retornam 400.

#### Histórico de tentativas de um serviço

```http
GET /api/v1/services/billing-api/collection-status
```

A resposta 200 contém `externalId` e `items`, com até 100 observações em ordem
decrescente de `observedAt` e `id`. Cada item tem `id` (UUID), `observedAt`,
`result` (`success` ou `failure`), `type`, `description` e `httpStatus` (código
HTTP de erro ou `null`). Um serviço sem observações retorna `items: []`.
O limite é fixo e a rota não aplica filtros de período ou tipo. Identificador
inválido retorna 400 e serviço desconhecido retorna 404.

#### Regiões — cards e globo

```http
GET /api/v1/regions?from=2026-10-11T19:00:00Z&to=2026-10-12T19:00:00Z
```

Consulta pública, sem corpo. `from` e `to` são opcionais, mas formam um par:
devem ser enviados juntos, com `from` anterior a `to`. Sem o par, a resposta
traz `period: null` e `periodSummary: null`, e os cards entregam apenas o
estado atual.

| Query | Regra |
|---|---|
| `from` | Opcional (junto com `to`): data ISO 8601 com fuso; início exclusivo do período. |
| `to` | Opcional (junto com `from`): data ISO 8601 com fuso; fim inclusivo do período. |

Resposta 200:

- `generatedAt` em UTC; `period` identifica a janela quando o par é enviado.
- `regions[]` lista todas as regiões cadastradas, mesmo sem serviços.
- `serviceCounts` representa o estado **atual** dos serviços da região:
  `totalServices`; `listedServices` e `unlistedServices` por `ativo`;
  `availableServices`, `metricsMissingServices` e `unavailableServices`
  por `status`.
- `periodSummary` existe apenas com o par `from`/`to` e soma as coletas
  armazenadas no período (`basis: "sum_of_stored_samples"`). Sem amostras
  na região: `sampleCount: 0` e somas `null`, sem métricas fabricadas.
- `city`, `latitude` e `longitude` podem ser `null`; a região continua
  listada — apenas o globe não cria marcador para ela.

Limitação histórica: os totais do período agrupam as coletas pela região
**atual** de `servico.regiao_id`, pois `coleta` não armazena a região da
coleta. Após uma mudança de região do serviço, as coletas antigas passam a
contar na nova região; os totais não representam a localização histórica
da amostra.

Regiões ausentes retornam 200 com `regions: []`. Par inválido (incompleto,
`from >= to` ou formato incorreto) retorna 400; falha interna retorna 500.

#### Comparação de serviços

```http
POST /api/v1/comparisons
Content-Type: application/json
```

```json
{
  "range": "1h",
  "selections": [
    { "selectionId": "original", "externalId": "billing-api", "simulatedRegionCode": null },
    { "selectionId": "simulado", "externalId": "billing-api", "simulatedRegionCode": "br-sudeste" }
  ]
}
```

O body exige `range` (`1h`, `6h`, `24h`, `7d` ou `30d`) e de 2 a 5 seleções.
Cada seleção exige `selectionId`, `externalId` e `simulatedRegionCode` (código
da região ou `null` para usar as emissões armazenadas).

A resposta 200 contém `range`, `period: { from, to }` e `series`. Todas as
seleções usam o mesmo período, encerrado imediatamente após a última coleta
disponível entre os serviços selecionados e dividido em 120 faixas iguais.
O limite final inclui 1 milissegundo adicional para preservar coletas com
precisão de microssegundos do PostgreSQL. Sem coletas em nenhum dos serviços,
o período termina no momento da requisição. Sem novas coletas, os horários
das faixas permanecem iguais entre consultas. Cada série contém
`selectionId`, `summary` e `points`.
O resumo contém `sampleCount`, `energyKwh` e `co2eGrams`; cada ponto também
contém `timestamp`, que identifica o início da faixa. Uma faixa inclui
coletas posteriores ao início e até o fim, inclusive.

Faixas sem coletas retornam quantidade zero e métricas `null`. Na simulação,
a energia é preservada e as emissões são calculadas como energia em kWh
vezes o fator atual da região em gCO₂e/kWh, tanto no resumo como nos pontos.
Os totais representam as amostras disponíveis; faixas vazias não comprovam
falhas de coleta. A tela de comparação carrega os serviços e as regiões da
API e consulta este endpoint ao clicar em Comparar, mantendo o resultado
anterior durante o carregamento ou em caso de falha.

Body inválido retorna 400; serviço ou região simulada inexistente retorna
404; falha interna retorna 500.

### 2.2. Ranking — implementado

```http
GET /api/v1/rankings?criterion=co2eGrams&range=24h
```

Rota pública registrada em [`backend/src/index.ts`](../backend/src/index.ts).

| Query | Regra |
| --- | --- |
| `criterion` | Opcional: `co2eGrams` (padrão) ou `energyKwh`. |
| `range` | Opcional: `1h`, `6h`, `24h` (padrão), `7d` ou `30d`. |

Parâmetros desconhecidos, repetidos ou inválidos retornam 400. A resposta 200
contém `criterion`, `range`, `period: { from, to }` e `items`.

O período termina na última coleta global acrescida de 1 milissegundo para
incluir a precisão de microssegundos do PostgreSQL. Sem coletas, usa o horário
atual. O início é calculado a partir de `range`; o SQL usa `coletado_em > from`
e `coletado_em <= to`.

Cada item contém `position`, `externalId`, `name`, `region: { code, city }`,
`energyKwh`, `co2eGrams` e `sampleCount`. A consulta inclui serviços ativos e
inativos, usando a região atual do cadastro. Os totais somam as amostras do
período, sem garantir cobertura contínua.

Os itens são ordenados pelo critério escolhido, do maior para o menor;
empates são desfeitos por `externalId` com `localeCompare`. Serviços com
amostras recebem posições sequenciais a partir de 1. Serviços sem amostras
ficam no final, com totais e `position` iguais a `null` e `sampleCount: 0`.
Sem serviços cadastrados, retorna `items: []`. Falha interna retorna 500.

### 2.3. Operações planejadas

Os caminhos abaixo descrevem contratos propostos.

| Método | Caminho | Responsabilidade |
|---|---|---|
| `POST` | `/auth/login` | Validar as credenciais do usuário e emitir um JWT. |
| `POST` | `/scenarios` | Calcular uma simulação com serviço, região e hipóteses explicitamente informados. |
| `GET` | `/monitoring-settings` | Consultar as configurações de monitoramento. |
| `PATCH` | `/monitoring-settings` | Atualizar as configurações de monitoramento. |

No contrato planejado, `POST /auth/login` recebe `username` e `password` e
retorna um `accessToken` JWT. O token será enviado nas chamadas autenticadas pelo cabeçalho
`Authorization: Bearer <accessToken>`. Operações que alteram configurações ou
iniciam simulações exigem autenticação JWT; o backend autentica e autoriza cada
chamada.

No contrato planejado, `POST /scenarios` recebe `serviceId`, `targetRegionCode`, `from` e `to`. A
resposta identifica o cenário como simulação e inclui as hipóteses e parâmetros
utilizados, distinguindo-o de resultados observados.

### 2.4. Configuração de monitoramento — planejada

O corpo usado para atualizar o intervalo de coleta é:

```json
{
  "collectionIntervalSeconds": 30
}
```

Esta alteração por HTTP ainda não está implementada. Hoje o job lê
`COLLECTION_INTERVAL_SECONDS`; a linha de `configuracao_sistema` não controla
o job. Na entrega dessa funcionalidade, o valor deverá configurar o intervalo
do Collection Job. Ele é independente da
frequência com que o frontend atualiza o dashboard e do intervalo que a API de
métricas associa aos dados de uma coleta.

### 2.5. Respostas e falhas

As respostas dos endpoints implementados são JSON e representam dados preparados pelo backend para o
recurso solicitado. As rotas validam `body`, `params` e `query parameters`
antes de executar os controllers. Dados inválidos de requisição resultam em
`400`. A resposta `401` está prevista para as futuras rotas protegidas; JWT
ainda não está implementado. Falhas de negócio e de integração são retornadas como erros explícitos,
sem respostas com aparência de sucesso ou métricas substituídas por zero.

O frontend deverá apresentar carregamento, sucesso, ausência de dados,
desatualização e falha ao integrar estas rotas. Os horários reais retornados
pelo backend não devem ser substituídos pelo horário da requisição.

## 3. Greener Metrics Aggregator API

Base: `https://metrics.unilaunch.org`.

O backend usa esta API para descobrir serviços monitorados e obter métricas de
um serviço. A operação de métricas documentada é:

| Método | Caminho | Uso |
|---|---|---|
| `GET` | `/services` | Descobrir serviços e obter sua identificação, localização e caminho de métricas. |
| `GET` | `/metrics/{id_servico}` | Obter as métricas operacionais do serviço identificado. |

O identificador `checkout-worker` é um exemplo de `id_servico`. A integração de
descoberta lista os serviços disponíveis conforme a operação definida pelo
OpenAPI da Metrics Aggregator API. A integração respeita esse contrato, sem
inferir um caminho de descoberta não confirmado.

O exemplo abaixo representa os campos de métricas usados no projeto:

```json
{
  "collection_interval_seconds": 27,
  "metrics": {
    "cpu_percent": 62.67,
    "memory_gb": 3.17,
    "disk_gb": 19.26,
    "network_gb": 0.45
  }
}
```

O backend valida a resposta externa e converte os dados para os tipos internos
de domínio antes de armazená-los ou apresentá-los ao frontend. O
`collection_interval_seconds` descreve o período das métricas recebidas e não
configura o Collection Job.

Na consulta de **métricas**, a classificação segue a regra do projeto e o
[contrato OpenAPI do agregador](https://metrics.unilaunch.org/openapi.json),
conferido em 25/10/2026:

| Resposta / falha | Significado registrado | Status do serviço | Tipo no histórico |
|---|---|---|---|
| Ausente em uma lista de serviços consultada com sucesso | Coleta não realizada porque o serviço não está na lista de serviços monitorados | `unavailable` | `service_missing` (`http_status = null`) |
| HTTP 404 de métricas | Serviço removido ou métricas inexistentes | `unavailable` | `service_missing` |
| HTTP 500 de métricas | Serviço indisponível ou exportador de métricas indisponível | `metrics_missing` | `metrics_missing` |
| HTTP 530 | Falha de acesso à plataforma externa (Cloudflare) | Preserva o status anterior | `cloudflare_error` |
| HTTP 429 | Limite de consultas atingido | Preserva o status anterior | `bad_status` |
| HTTP 502 / 503 / 504 | Falha de comunicação / plataforma temporariamente indisponível / demora na resposta | Preserva o status anterior | `bad_status` |
| Outro HTTP de erro | Não foi possível concluir a consulta externa; código preservado no histórico | Preserva o status anterior | `bad_status` |
| Timeout local, sem resposta HTTP | Tempo limite excedido | `unavailable` | `timeout` |
| Falha de comunicação, sem resposta HTTP | API de métricas inacessível | `unavailable` | `unavailable` |
| JSON inválido ou resposta fora do contrato | Resposta externa inválida | Preserva o status anterior | `invalid_response` |

`404` e `500` não identificam, isoladamente, qual das duas causas do respectivo
contrato aconteceu; a descrição conserva ambas as possibilidades. O nome
`metrics_missing` é a classificação interna definida para o HTTP 500 dessa
consulta e não comprova que o serviço permanece disponível.

`tipo` identifica a ocorrência para apresentação no gráfico; `http_status`
registra uma resposta HTTP de erro quando ela existe. Por isso, `service_missing`
agrupa ausência na descoberta e HTTP 404 de métricas, mas apenas o segundo tem
`http_status = 404`. O contrato informa que `/services` omite serviços removidos;
não é necessário chamar suas métricas para obter um 404 e confirmar a ausência.
`bad_status` fica reservado para os outros erros HTTP sem tipo específico.

As descrições das falhas de coleta usam linguagem simples para apresentação no
gráfico, sem caminhos internos ou termos como JSON e gateway. Por exemplo:
“A coleta não foi concluída porque a plataforma de métricas demorou demais para
responder.” O código HTTP fica separado em `http_status`; quando não há resposta,
é `null`. `tipo` identifica timeout, conexão, resposta inválida ou erro HTTP.
Falhas nas chamadas de descoberta ou de carbono ficam nos logs e no
monitoramento da rodada. Erros inesperados durante a coleta individual,
incluindo falhas de gravação, podem aparecer como `unexpected_error` sem
código HTTP. Se a gravação da observação falhar, o backend registra o erro
em log e marca a dependência de banco como indisponível.

Quando o serviço não aparece em uma descoberta sincronizada sem falhas, fica com `ativo = false`
e `unavailable`. Cada sincronização que confirmar essa ausência registra
`service_missing` no histórico, mesmo que ele já estivesse inativo. Esse evento
não possui código HTTP, pois a consulta de métricas não foi realizada. Quando
o serviço reaparece na descoberta, volta à rotina normal de coleta.

## 4. Greener Carbon Intensity API

Base: `https://carbon.unilaunch.org`.

O backend consulta a API para associar dados ambientais à região de um serviço.
A operação documentada é:

| Método | Caminho | Uso |
|---|---|---|
| `GET` | `/regions` | Obter as regiões e os indicadores ambientais fornecidos pela API. |

O contrato contém dados como código da região, intensidade de carbono em
`gCO₂e/kWh` e participação renovável. `br-sudeste`, `85 gCO₂e/kWh` e `83%` são
exemplos de referência; não são valores constantes nem garantias de dados
atuais. A integração valida campos regionais e fatores. O schema atual não exige
um timestamp de medição do fornecedor; `regiao.atualizado_em` registra a atualização
local e não comprova que o fator corresponde ao instante físico da amostra.

## 5. Segurança e isolamento

Os itens relativos a JWT e autorização descrevem o contrato planejado; não
comprovam autenticação implementada na versão atual. Sua entrega está prevista para a Sprint 3.

- O navegador comunica-se somente com a API do GreenER.
- Credenciais e segredos das integrações externas permanecem no backend.
- O token JWT acompanha as chamadas autenticadas de acordo com o middleware do
  backend.
- CORS permite somente as origens de frontend configuradas para os ambientes
  do projeto.
- O backend valida entradas e respostas externas antes de utilizá-las.

## 6. Alinhamento entre contrato e implementação

O dashboard consome listagem, detalhe, histórico de métricas e histórico de
tentativas. A comparação usa as rotas de serviços, regiões e comparação,
incluindo a simulação de região. Rotas, schemas Zod e tipos devem evoluir em
conjunto. Consulte as [rotas do frontend](../frontend/arquitetura.md#67-rotas-da-aplicação).

Não existe handler global de rota desconhecida em JSON: um caminho não
registrado pode retornar o 404 padrão do Express em HTML. Isso difere do 404
de serviço desconhecido em uma rota implementada, que passa pelo errorHandler.

## 7. Estado do monitoramento — implementado

No servidor atual, as rotas são montadas sob `/api/v1`. Esta consulta é pública,
não recebe corpo nem parâmetros e não exige JWT:

```http
GET /api/v1/monitoring/status
Accept: application/json
```

Exemplo de resposta HTTP 200:

```json
{
  "serverTime": "2026-10-13T19:00:10Z",
  "running": false,
  "collectionIntervalSeconds": 30,
  "lastRoundStartedAt": "2026-10-13T19:00:00Z",
  "lastRoundFinishedAt": "2026-10-13T19:00:02Z",
  "nextCollectionAt": "2026-10-13T19:00:32Z",
  "lastSuccessfulCollectionAt": "2026-10-13T19:00:01Z",
  "lastRound": {
    "outcome": "partial",
    "attemptedServices": 8,
    "collectedServices": 7,
    "failedServices": 1
  },
  "dependencies": {
    "metricsDiscovery": "available",
    "carbon": "available",
    "database": "available"
  }
}
```

- O estado fica em memória e é reiniciado com o processo. Datas ainda não
  observadas e `lastRound` começam como `null`; dependências começam como
  `unknown`. Não é um histórico persistente de rodadas.
- `running` indica uma rodada em execução. Durante a rodada,
  `nextCollectionAt` é `null`; depois, informa a previsão do próximo início.
  Parar o job também remove essa previsão.
- O intervalo é lido de `COLLECTION_INTERVAL_SECONDS`, com padrão de 30
  segundos. A barra integrada usa `serverTime` e `nextCollectionAt`, ajustando
  a diferença entre o relógio do servidor e o navegador. O valor do ambiente
  pode ser diferente do padrão; prevalece a configuração do ambiente em execução.
- `attemptedServices` conta os serviços selecionados para consultar métricas;
  `collectedServices` conta coletas válidas efetivamente gravadas;
  `failedServices` é a diferença. Uma falha anterior à seleção pode encerrar
  uma rodada com os três contadores em zero e resultado `failed`.
- `outcome` é `success` quando a rodada termina sem falha observada, `partial`
  quando houve falha mas alguma coleta foi gravada e `failed` quando houve
  falha sem nenhuma coleta gravada. Uma descoberta válida sem serviços pode
  terminar com `success` e contadores zerados.
- Falhas na sincronização ou na atualização de status também afetam
  `outcome`, mesmo que os dados de uma coleta tenham sido gravados.
- `lastSuccessfulCollectionAt` usa o horário retornado pelo INSERT de uma
  coleta válida; falhas posteriores não o substituem por horário de tentativa.
- `dependencies` informa o último resultado observado nas operações de
  descoberta, carbono e banco. Não representa uma checagem contínua de saúde.
  Falha de carbono continua visível mesmo quando o cálculo usa fatores antigos.
- A rota retorna 200 mesmo quando o estado informa falha. Um erro interno ao
  servir a resposta passa pelo `errorHandler` e retorna 500.
- A última coleta global não significa que todos os serviços atualizaram.
  A interface exibe `collectedAt` no detalhe e na listagem; o horário de
  atualização da tela não substitui o horário da amostra.
