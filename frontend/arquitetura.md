# Arquitetura do Frontend — GreenER

Este documento define a arquitetura-alvo da aplicação web GreenER e orienta
sua construção. A arquitetura principal do backend está em
[`../backend/arquitetura.md`](../backend/arquitetura.md); os contratos de
comunicação estão em [`../docs/API.md`](../docs/API.md), e o modelo ambiental
está em [`../docs/cálculo.md`](../docs/cálculo.md).

## Estado atual e escopo

O documento distingue a implementação atual das funcionalidades futuras.

- `App.tsx` define início, lista e detalhe dentro de `DashboardLayout`.
- `api/services.ts`, `api/regions.ts` e `api/monitoring.ts` consultam o backend real.
- `useApiQuery` busca ao montar, ao mudar dependências e quando `refreshKey` muda.
- `MonitoringProvider` observa `lastRoundFinishedAt` e solicita novas consultas.
- `ServiceDetailPage` usa detalhe e histórico persistido; os gráficos não usam mocks.
- `MonitoringBar` apresenta estado real, previsão de coleta e horário de atualização.
- `GlobeView` e cards regionais estão integrados; energia e emissões somam amostras
  das últimas 24 horas. Apresentar os serviços associados ao inspecionar uma região
  é o saldo de T15 transferido para a Sprint 2, com Gabriel.
- `AuthProvider` mantém a sessão JWT. `AccountGuard` protege as páginas de Visão
  Geral, Relatórios, Perfil e Configuração do Projeto.
- As APIs de contas, dashboards, projeto e relatórios ficam em `src/api/`. Seus
  tipos ficam em `src/types/` e os componentes de cada tela em `src/components/`.
- As telas usam Tailwind e os estilos compartilhados de `src/styles/workspace.css`,
  carregados em `src/index.css`.
- Arquivos em `mocks/` não comprovam seu uso pelas telas atuais.

## 1. Objetivo do frontend

O frontend é a interface pela qual usuários acompanham os serviços de software
monitorados pelo GreenER e compreendem suas métricas operacionais e seu impacto
ambiental estimado. A arquitetura-alvo prevê uma visão consolidada e detalhada dos
serviços, localização, histórico, classificações, comparações e análises de
cenários, além de atualizar as informações sem recarga manual.

A interface deve apresentar dados rastreáveis, com unidades, contexto temporal
e estado operacional claros. Valores de consumo energético e CO₂e são
apresentados como estimativas somente quando o backend fornecer resultados
produzidos pelo modelo documentado. A interface não inventa nem recalcula
valores ambientais.

## 2. Responsabilidades e limites

Na arquitetura-alvo, o frontend deverá:

- apresenta dashboard, listagens e detalhes de serviços;
- apresenta métricas operacionais, estado, região e momento da última
  atualização;
- oferece visualizações para histórico, classificação, comparação de serviços
  e regiões e simulação de cenários;
- executa a atualização periódica da interface sem recarregar a página;
- gerencia a experiência de autenticação e o envio de credenciais ou token nas
  operações protegidas;
- representa carregamento, sucesso, ausência de dados, dados desatualizados e
  falhas de comunicação.

O frontend comunica-se exclusivamente com a API do backend GreenER. O backend
integra as APIs externas, valida e processa seus dados, calcula os indicadores
ambientais, aplica as regras de negócio e consulta o PostgreSQL. O navegador
não acessa diretamente as APIs externas ou o banco e não é responsável por
autorização de acesso ou regras de negócio.

## 3. Fluxo e camadas da interface

```text
Usuário
   ↓
Rotas e páginas React
   ↓
Componentes de apresentação
   ↓
Hooks de consulta e estado de interface
   ↓
Serviços HTTP do frontend
   ↓
API REST do backend GreenER
   ↓
Services / Integrations / Repositories do backend
   ↓
APIs externas e PostgreSQL
```

- **Rotas** identificam as áreas da aplicação e os parâmetros de navegação,
  incluindo identificadores de serviços e regiões.
- **Páginas** coordenam os dados necessários à tela e compõem componentes
  reutilizáveis.
- **Componentes** exibem dados e controles da interface sem executar chamadas
  diretas à rede ou incorporar regras de negócio.
- **Hooks** encapsulam consultas, atualização periódica, filtros e outros
  comportamentos reutilizados pela interface.
- **Serviços HTTP** concentram a comunicação com os endpoints internos e a
  conversão das respostas em tipos utilizados pelo frontend.
- **Contexts e providers** compartilham somente estado que seja comum a
  diferentes áreas, como a sessão autenticada.

Na integração atual, os dados percorrem backend → frontend. Arquivos de mocks são demonstrativos e não alimentam as páginas integradas. As respostas e operações
seguem [`../docs/API.md`](../docs/API.md); o frontend não depende dos contratos
das APIs externas.

## 4. Tecnologias e padrões

A stack do frontend é:

- React e TypeScript;
- Vite;
- Tailwind CSS;
- shadcn/ui e Radix UI para componentes acessíveis;
- Lucide React para ícones;
- Geist Variable como tipografia;
- ESLint e Prettier para análise e formatação.

O código usa TypeScript estrito, JSX e o alias `@/` para importações a partir
de `src/`. O CSS global centraliza tokens de tema, tipografia, cores, bordas e
raios. Componentes derivados de shadcn/ui seguem esse sistema visual e devem
ser reutilizados em vez de duplicados.

O roteamento, o estado de consultas e o cache da API são infraestrutura
compartilhada da aplicação. A camada de serviços encapsula as consultas, e as
páginas não duplicam transporte HTTP nem lógica de sessão.

## 5. Estrutura de diretórios

### Estrutura implementada

```text
src/
├── App.tsx, main.tsx, index.css
├── api/                 # services.ts, regions.ts, monitoring.ts
├── components/          # 3d, landing, charts, services, ui, MonitoringBar
├── contexts/            # MonitoringProvider.tsx, monitoring.ts
├── hooks/               # useApiQuery, useMonitoringStatus, useServices, useServiceDetail
├── layouts/             # DashboardLayout.tsx
├── lib/
├── mocks/               # arquivos demonstrativos; não alimentam as páginas atuais
├── pages/               # LandingPage, DashboardPage, ServiceDetailPage
└── types/
```

O transporte atual está em `api/`, e o layout em `layouts/`. Não há migração
para `services/` ou `components/layout/` implementada. A árvore a seguir é uma proposta.

### Estrutura-alvo

```text
frontend/
├── arquitetura.md
├── .env.example
├── components.json
├── Dockerfile
├── index.html
├── package.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── app/
    │   ├── router.tsx
    │   └── providers.tsx
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   ├── services/
    │   ├── metrics/
    │   └── analytics/
    ├── pages/
    │   ├── DashboardPage.tsx
    │   ├── ServiceDetailPage.tsx
    │   ├── HistoryPage.tsx
    │   ├── RankingPage.tsx
    │   ├── ComparisonPage.tsx
    │   ├── ScenarioPage.tsx
    │   ├── RegionsPage.tsx
    │   └── LoginPage.tsx
    ├── services/
    │   ├── api-client.ts
    │   ├── auth-api.ts
    │   ├── services-api.ts
    │   ├── collections-api.ts
    │   ├── regions-api.ts
    │   └── analytics-api.ts
    ├── hooks/
    ├── contexts/
    ├── types/
    └── lib/
        └── utils.ts
```

Esta estrutura é a organização-alvo. Diretórios e módulos descritos são
responsabilidades arquiteturais: eles serão criados e preenchidos conforme as
telas e integrações forem construídas, sem manter pastas vazias ou adicionar
camadas sem uso.

### 5.1. Responsabilidades por área

- `app/`: composição da aplicação, rotas e providers globais.
- `components/ui/`: primitives e controles visuais reutilizáveis.
- `components/layout/`: navegação, cabeçalho, estrutura lateral e contêineres
  compartilhados.
- `components/services/`: lista, cartão, identificação e estado de serviços.
- `components/metrics/`: indicadores operacionais e componentes para métricas
  individuais ou agregadas.
- `components/analytics/`: elementos de gráficos, tabelas, classificação,
  comparação e simulação.
- `pages/`: composição das telas do produto, sem implementação de transporte
  HTTP ou lógica de domínio.
- `services/`: cliente HTTP e módulos de operações da API GreenER.
- `hooks/`: consultas, atualização automática, filtros e comportamentos
  reutilizáveis.
- `contexts/`: sessão e estado compartilhado necessários à aplicação;
  `app/providers.tsx` compõe os providers globais.
- `types/`: contratos de resposta e modelos de apresentação do frontend,
  sincronizados com a API interna.
- `lib/`: utilitários independentes de domínio, incluindo `cn` para composição
  de classes.

## 6. Áreas do produto e navegação

### 6.1. Dashboard

A tela inicial apresenta o panorama dos serviços: totais e estados operacionais,
métricas recentes, distribuição regional e indicadores ambientais agregados
calculados conforme o modelo documentado. Inclui o horário da última atualização
e permite navegar para o detalhe de um serviço.

### 6.2. Detalhe do serviço

A tela de detalhe identifica o serviço, sua região e estado e apresenta suas
métricas operacionais e ambientais, além da evolução temporal. Todos os valores
exibem unidade, período e indicação de estimativa quando aplicável.

### 6.3. Histórico implementado e ranking planejado

A área de histórico permite acompanhar métricas e indicadores ambientais ao
longo do tempo, por serviço e período. Na Sprint 2, o ranking deverá apresentar classificações
comparáveis calculadas pelo backend e identifica o critério usado.

### 6.4. Comparação e cenários — Sprint 3

A área planejada de comparação permitirá analisar serviços e regiões com o mesmo contexto
temporal e critérios explícitos. A simulação apresenta hipóteses e parâmetros
do cenário, diferenciando resultados simulados de observações históricas.

### 6.5. Regiões

A visualização atual apresenta globo, cards e dados regionais do backend.
Apresentar os serviços associados ao inspecionar uma região é a continuação
de T15 na Sprint 2; ainda não está entregue. Um mapa e outras visualizações geográficas complementam listas e
valores tabulares; a informação permanece acessível sem depender apenas da
representação cartográfica.

### 6.6. Autenticação e configurações — planejadas

Autenticação JWT será entregue na Sprint 3. A autorização será validada pelo
backend; login e proteção de rotas ainda não estão implementados.
A configuração do intervalo pela aplicação fica para etapa posterior, com sprint a definir.

### 6.7. Rotas da aplicação

| Rota implementada | Componente          | Comportamento atual                                   |
| ----------------- | ------------------- | ----------------------------------------------------- |
| `/`               | `LandingPage`       | Globo, cards regionais e totais das últimas 24 horas. |
| `/dashboard`      | `DashboardPage`     | Serviços reais, filtros, status e última coleta.      |
| `/servicos/:id`   | `ServiceDetailPage` | Detalhe, gráficos e totais do histórico persistido.   |

As três rotas usam `DashboardLayout`. `/services/:serviceId` não existe na interface.
Histórico está no detalhe; não há página `/history`. Login, ranking, comparação,
cenários e configurações continuam futuros. Contratos em [API.md](../docs/API.md).

## 7. Atualização e estados de interface

`useMonitoringStatus` consulta `/api/v1/monitoring/status`. A próxima consulta é
agendada para `nextCollectionAt` mais 1 segundo; durante uma rodada, verifica de
novo em 1 segundo. Sem previsão ou após erro, tenta em 30 segundos.
`MonitoringProvider` detecta nova conclusão de rodada e incrementa `refreshKey`;
`useApiQuery` recarrega os dados da página sem navegação ou recarga manual.
O relógio da barra é atualizado a cada segundo, mas não substitui as consultas.
`screenUpdatedAt` indica a conclusão de uma consulta da interface; `collectedAt`
identifica a amostra de cada serviço. Uma resposta bem-sucedida não implica que
todos os serviços tiveram coleta recente.

Os estados abaixo orientam a apresentação; responsividade, acessibilidade e
cenários completos de falha ainda exigem validações próprias.

Cada consulta apresenta estados distintos:

- carregamento inicial;
- dados disponíveis;
- resposta válida sem registros;
- falha de rede ou erro retornado pelo backend;
- dados existentes cuja última atualização não é recente;
- atualização em andamento sem ocultar dados já apresentados.

Filtros e seleção de serviço, região e período permanecem coerentes durante as
atualizações. Uma falha de atualização não substitui dados válidos por zeros ou
por uma resposta com aparência de sucesso.

## 8. Dados ambientais e transparência

O backend é a fonte dos resultados calculados. O frontend apresenta consumo
energético e CO₂e quando o backend os fornecer, junto das unidades, período,
região e caráter estimado. A intensidade de carbono e a participação renovável
são exibidas com a região e o contexto temporal correspondentes.

As métricas operacionais não são, por si só, consumo energético. Portanto, a
interface não converte CPU, memória, disco ou rede em energia ou emissão. Se o
backend não puder fornecer um resultado válido, a interface informa que o
indicador não está disponível e, quando fornecida, apresenta a razão. Regras,
fórmulas, parâmetros e limitações estão em
[`../docs/cálculo.md`](../docs/cálculo.md).

## 9. Responsividade e acessibilidade

As telas devem ser verificadas em desktop, tablet e dispositivos móveis, usando os
protótipos do GreenER como referência visual. Navegação, tabelas e gráficos se
adaptam aos tamanhos de tela e preservam acesso às informações essenciais.

A implementação adota HTML semântico, rótulos acessíveis, navegação por teclado,
foco visível e contraste adequado. Estados e classificações não são
comunicados apenas por cor; valores incluem unidades e textos de apoio.

## 10. Configuração, segurança e qualidade

`VITE_API_URL` define a origem da API do backend. As páginas atuais usam HTTP real;
`VITE_USE_MOCKS` não controla esse fluxo. Variáveis `VITE_*` são
incorporadas ao bundle e, portanto, contêm somente configuração pública; tokens,
senhas e segredos não são armazenados nelas.

O cliente HTTP concentra a formação de URLs, cabeçalhos, tratamento de respostas
e erros. A sessão autenticada segue o contrato do backend; controles de rota
melhoram a experiência, mas não substituem autorização no servidor.

Os scripts de qualidade do frontend são:

```text
npm run build        verificar tipos e gerar o build
npm run lint         executar ESLint
npm run format:check verificar formatação com Prettier
```

Cada tela deve ser validada nos estados de carregamento, sucesso, ausência de dados e
erro, em larguras desktop, tablet e mobile. A integração deve ser validada contra a API
do GreenER, e não por chamadas diretas às APIs externas.

## 11. Construção do produto

O frontend segue o [plano de entregas](../docs/plano-de-entregas.md):

1. **Sprint 1:** monitoramento, persistência, histórico, dashboard, mapa/globo,
   integração real e atualização automática.
2. **Sprint 2:** rankings e continuação de T15: serviços associados à região inspecionada.
3. **Sprint 3:** autenticação JWT, comparação e simulação de cenários regionais.

Configuração do intervalo pela aplicação: etapa futura, com sprint ainda a definir.

As etapas organizam a implementação; não reduzem o escopo final do produto. As
telas descritas nesta arquitetura são parte da experiência GreenER e devem ser
integradas às capacidades correspondentes do backend, conforme
[`../backend/arquitetura.md`](../backend/arquitetura.md).
