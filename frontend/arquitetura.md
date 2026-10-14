# Arquitetura do Frontend — GreenER

Este documento define a arquitetura-alvo da aplicação web GreenER e orienta
sua construção. A arquitetura principal do backend está em
[`../backend/arquitetura.md`](../backend/arquitetura.md); os contratos de
comunicação estão em [`../docs/API.md`](../docs/API.md), e o modelo ambiental
está em [`../docs/cálculo.md`](../docs/cálculo.md).

## 1. Objetivo do frontend

O frontend é a interface pela qual usuários acompanham os serviços de software
monitorados pelo GreenER e compreendem suas métricas operacionais e seu impacto
ambiental estimado. O produto oferece uma visão consolidada e detalhada dos
serviços, localização, histórico, classificações, comparações e análises de
cenários, além de atualizar as informações sem recarga manual.

A interface deve apresentar dados rastreáveis, com unidades, contexto temporal
e estado operacional claros. Valores de consumo energético e CO₂e são
apresentados como estimativas somente quando o backend fornecer resultados
produzidos pelo modelo documentado. A interface não inventa nem recalcula
valores ambientais.

## 2. Responsabilidades e limites

O frontend:

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

O caminho da informação é sempre backend → frontend. As respostas e operações
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

### 6.3. Histórico e ranking

A área de histórico permite acompanhar métricas e indicadores ambientais ao
longo do tempo, por serviço e período. O ranking apresenta classificações
comparáveis calculadas pelo backend e identifica o critério usado.

### 6.4. Comparação e cenários

A área de comparação permite analisar serviços e regiões com o mesmo contexto
temporal e critérios explícitos. A simulação apresenta hipóteses e parâmetros
do cenário, diferenciando resultados simulados de observações históricas.

### 6.5. Regiões

A visualização regional apresenta os serviços associados a cada região e os
dados de intensidade de carbono e participação renovável fornecidos pelo
backend. Um mapa e outras visualizações geográficas complementam listas e
valores tabulares; a informação permanece acessível sem depender apenas da
representação cartográfica.

### 6.6. Autenticação e configurações

A interface inclui fluxo de login e área de configurações do monitoramento. As
operações protegidas enviam a credencial JWT de acordo com o contrato do
backend. A autorização efetiva é sempre validada pelo backend.

### 6.7. Rotas da aplicação

| Rota | Tela |
|---|---|
| `/` | Dashboard |
| `/services/:serviceId` | Detalhe do serviço |
| `/history` | Histórico |
| `/ranking` | Classificação ambiental |
| `/comparison` | Comparação de serviços e regiões |
| `/scenarios` | Simulação de cenário |
| `/regions` | Visão regional |
| `/login` | Autenticação |
| `/settings` | Configurações de monitoramento |

## 7. Atualização e estados de interface

As páginas que exibem dados operacionais consultam periodicamente a API do
GreenER e atualizam seus dados sem recarregar o documento. O horário da última
atualização é exibido ao usuário. A frequência de consulta da interface e o
intervalo de execução do Collection Job são parâmetros separados.

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

Todas as telas funcionam em desktop, tablet e dispositivos móveis, usando os
protótipos do GreenER como referência visual. Navegação, tabelas e gráficos se
adaptam aos tamanhos de tela e preservam acesso às informações essenciais.

A implementação adota HTML semântico, rótulos acessíveis, navegação por teclado,
foco visível e contraste adequado. Estados e classificações não são
comunicados apenas por cor; valores incluem unidades e textos de apoio.

## 10. Configuração, segurança e qualidade

`VITE_API_URL` define a origem da API do backend. Variáveis `VITE_*` são
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

Cada tela é validada nos estados de carregamento, sucesso, ausência de dados e
erro, em larguras desktop, tablet e mobile. A integração é validada contra a API
do GreenER, e não por chamadas diretas às APIs externas.

## 11. Construção do produto

O frontend é construído incrementalmente em torno desta arquitetura-alvo:

1. **Monitoramento:** dashboard, lista de serviços, detalhe, indicadores de
   estado, métricas e comunicação com o backend.
2. **Persistência e ranking:** histórico por período, consulta de tendências e
   classificação de serviços.
3. **Análise avançada:** comparação entre serviços e regiões e simulação de
   cenários.
4. **Consolidação:** autenticação e configurações integradas, atualização
   automática, experiência responsiva e validação ponta a ponta.

As etapas organizam a implementação; não reduzem o escopo final do produto. As
telas descritas nesta arquitetura são parte da experiência GreenER e devem ser
integradas às capacidades correspondentes do backend, conforme
[`../backend/arquitetura.md`](../backend/arquitetura.md).
