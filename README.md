<p align ="center">
<img width="800" src="./.github/logo.png" alt="GreenER">
</p>

<p align="center">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=for-the-badge&logo=JavaScript&logoColor=black">
  <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white">
  <img src="https://img.shields.io/badge/React-61DAFB.svg?style=for-the-badge&logo=React&logoColor=black">
  <img src="https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=Vite&logoColor=white">
  <img src="https://img.shields.io/badge/Node.js-5FA04E.svg?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img src="https://img.shields.io/badge/Express-000000.svg?style=for-the-badge&logo=Express&logoColor=white">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1.svg?style=for-the-badge&logo=PostgreSQL&logoColor=white">
  <img src="https://img.shields.io/badge/Docker-2496ED.svg?style=for-the-badge&logo=Docker&logoColor=white">
  <img src="https://img.shields.io/badge/Docker%20Compose-2496ED.svg?style=for-the-badge&logo=Docker&logoColor=white">
  <img src="https://img.shields.io/badge/HTML5-E34F26.svg?style=for-the-badge&logo=HTML5&logoColor=white">
  <img src="https://img.shields.io/badge/CSS3-1572B6.svg?style=for-the-badge&logo=CSS3&logoColor=white">
  <img src="https://img.shields.io/badge/Figma-F24E1E.svg?style=for-the-badge&logo=Figma&logoColor=white">
  <img src="https://img.shields.io/badge/Git-F05032.svg?style=for-the-badge&logo=Git&logoColor=white">
  <img src="https://img.shields.io/badge/GitHub-181717.svg?style=for-the-badge&logo=GitHub&logoColor=white">
  <img src="https://img.shields.io/badge/UML-FABD14.svg?style=for-the-badge&logoColor=black">
</p>

---

## 📋 Índice

<details open>
  <summary><b>Sumário do Projeto</b></summary>

  <ul>
    <li>
      <details open>
        <summary><a href="#-descrição-do-projeto">1. Descrição do projeto</a></summary>
        <ul>
          <li><a href="#-relevância-do-projeto">1.1. Relevância do projeto</a></li>
          <li><a href="#-organização-de-pastas">1.2. Organização de pastas</a></li>
          <li><a href="#-como-iniciar-a-aplicação">1.3. Como iniciar a aplicação</a></li>
          <li><a href="#como-executar">1.4. Como executar</a></li>
          <li><a href="#-cronograma-de-evolução">1.5. Cronograma de evolução</a></li>
          <li><a href="#-funcionalidades">1.6. Funcionalidades</a></li>
          <li><a href="#-equipe">1.7. Equipe</a></li>
          <li><a href="#sprints">1.8. Sprints</a></li>
          <li><a href="#-especificações-do-projeto">1.9. Especificações do projeto</a></li>
        </ul>
      </details>
    </li>
  </ul>
</details>

## 📌 Descrição do Projeto

O greenER é uma aplicação web que monitora o consumo de CPU, memória, armazenamento e rede, estimando o impacto ambiental de serviços digitais com base na intensidade de carbono da região.

## 🌱 Relevância do Projeto

A plataforma relaciona o uso de recursos computacionais à eficiência energética e às emissões de CO₂ equivalente, apoiando análises sobre sustentabilidade e Green Computing. Os valores apresentados são estimativas para comparação entre serviços e não substituem medições físicas da infraestrutura.

---

## 📁 Organização de pastas

A estrutura atual do projeto está organizada assim:

```text
GreenER/
├── backend/
│   ├── arquitetura.md
│   ├── .env.example
│   ├── Dockerfile
│   ├── src/
│   │   ├── app.ts, server.ts, index.ts
│   │   ├── db/
│   │   ├── integrations/
│   │   ├── jobs/
│   │   ├── modules/       # Domínios de monitoramento, contas, dashboards, projeto e relatórios
│   │   ├── scripts/
│   │   └── shared/
│   └── tests/             # Testes unitários e de integração
├── frontend/
│   ├── arquitetura.md
│   ├── .env.example
│   ├── Dockerfile
│   └── src/
│       ├── App.tsx, main.tsx, index.css
│       ├── api/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── styles/
│       ├── types/
│       └── lib/
├── database/
│   ├── arquitetura.md
│   ├── migrations/
│   └── schema.sql
├── docs/
│   ├── API.md
│   ├── cálculo.md
│   ├── plano-de-entregas.md
│   ├── arquitetura/
│   ├── prototipo/
│   ├── sprint-1/         # planejamento, dailies, DoD e burndown
│   └── sprint-2/         # planejamento, dailies, DoD e burndown
├── docker-compose.yml
└── README.md
```

Detalhes nas arquiteturas do [backend](./backend/arquitetura.md) e do
[frontend](./frontend/arquitetura.md), no [contrato da API](./docs/API.md) e na
[documentação do banco](./database/arquitetura.md).

---

### 🚀 Como iniciar a aplicação

Pré-requisitos: [Git](https://git-scm.com/) e [Docker](https://www.docker.com/) com Compose.

## Como executar

No PowerShell:

```powershell
git clone https://github.com/Team-Zero-DSM/GreenER.git
cd GreenER
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
docker compose up --build
```

Confira os valores dos arquivos `.env`. No Docker, o backend acessa o banco por
`database:5432`; no computador, use `localhost:5433`.

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/health

Para encerrar: `docker compose down`.

#### Contas e telas da Sprint 3

Um banco novo recebe as tabelas pelo `database/schema.sql`. Se o volume do
PostgreSQL já existe, aplique a migração abaixo antes de iniciar o backend.
Ela acrescenta os campos de conta e as tabelas de dashboards e redefinição de senha.

```powershell
docker compose up -d --wait database
Get-Content -Raw database/migrations/002_contas_e_dashboards.sql |
    docker compose exec -T database psql -U postgres -d greener -v ON_ERROR_STOP=1
```

Em uma instalação sem administrador, configure temporariamente
`BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` e, se desejar,
`BOOTSTRAP_ADMIN_NAME` em `backend/.env`. Com o backend em execução, rode
`docker compose exec backend npm run bootstrap:admin`. Depois, remova essas
variáveis do arquivo e recrie o container do backend. Contas criadas pela
tela de cadastro recebem o papel Visualizador.

Para **Esqueci minha senha**, configure `APP_PUBLIC_URL` com a URL do frontend
e preencha `SMTP_HOST`, `SMTP_PORT` e `SMTP_FROM` no backend. Preencha
`SMTP_USER` e `SMTP_PASSWORD` quando o servidor exigir autenticação. Em
produção, use HTTPS no frontend e uma chave `JWT_SECRET` com pelo menos
32 bytes. O link de redefinição expira em 30 minutos.

---

## ⏳ Cronograma de Evolução

As entregas seguem o calendário das sprints registrado abaixo.

```mermaid
graph TD
    S1[Sprint 1: Monitoramento, Persistência, Histórico e Interface] --> S2[Sprint 2: Ranking, Comparação, Histórico de Status e Regiões]
    S2 --> S3[Sprint 3: JWT e Cenários Avançados]
```

---

### ✨ Funcionalidades

Disponíveis na versão integrada:

- Descoberta e coleta periódica das métricas de serviços.
- Estimativas de potência, energia e CO₂e com parâmetros documentados.
- Persistência no PostgreSQL, histórico de métricas por período e histórico de tentativas por serviço.
- Lista, detalhe, gráficos e indicadores de status com dados reais.
- Globo, serviços por região e cards com totais das amostras das últimas 24 horas.
- Comparação de serviços com simulação de emissões em outra região.
- Atualização automática após as rodadas de coleta, sem recarregar a página.
- Execução de frontend, backend e banco com Docker Compose.

O ranking de impacto ambiental já possui rota pública no backend
(`GET /api/v1/rankings`) e integração com a página de ranking da interface.

Pendências e entregas futuras:

- **Sprint 2:** apresentar os serviços associados ao inspecionar uma região,
  como continuação da T15, que permanece parcialmente entregue.
- **Sprint 2:** ranking de impacto ambiental, comparação entre serviços,
  histórico de status das coletas e ampliação das visualizações regionais.
  Escopo e acompanhamento no [registro da Sprint 2](./docs/sprint-2/sprint-2.md)
  e no [plano de entregas](./docs/plano-de-entregas.md).
- **Sprint 3:** autenticação JWT e simulação de cenários avançados,
  com delimitação em relação às opções regionais previstas na comparação da Sprint 2.
- **Proposta para a Sprint 3:** configuração do intervalo de coleta pela área
  autenticada. O [plano de entregas](./docs/plano-de-entregas.md) registra o
  critério de aceite.

Somente **US01, US03, US08 e US09** foram selecionadas para a Sprint 1.
Persistência, histórico e globo não acrescentam automaticamente outras histórias.
Implementação não equivale a aceite formal; consultar as [evidências da DoD](./docs/sprint-1/evidencias-dod.md).
Parâmetros e limitações das estimativas estão em [cálculo.md](./docs/cálculo.md).

---

### 👥 Equipe

<body>
      <table>
         <thead>
            <th>Product Owner</th>
            <th>Scrum Master</th>
            <th>Dev Team</th>
            <th>Dev Team</th>
            <th>Dev Team</th>
         </thead>
         <tbody>
            <tr>
               <th><a href="https://github.com/henri-bueno"><img src="https://github.com/henri-bueno.png" width="75px" height="75px"></a></th>
               <th><a href="https://github.com/pauloolivetti"><img src="https://github.com/pauloolivetti.png" width="75px" height="75px"/></a></th>
               <th><a href="https://github.com/gabrielgomesfernandes"><img src="https://github.com/gabrielgomesfernandes.png/" width="75px" height="75px"/></a></th>
               <th><a href="https://github.com/vitorreis-dev"><img src="https://github.com/vitorreis-dev.png" width="75px" height="75px"/></a></th>
               <th><a href="https://github.com/phjsilva"><img src="https://github.com/phjsilva.png" width="75px" height="75px"/></a></th>
            </tr>
         </tbody>
      </table>
</body>

---

### Sprints

| Sprint | Link                                                                                                | Início     | Entrega    | Status |
| ------ | --------------------------------------------------------------------------------------------------- | ---------- | ---------- | ------ |
| 01     | [sprint 1](./docs/sprint-1/sprint-1.md)                                                             | 28/09/2026 | 19/10/2026 | ✅     |
| 02     | [sprint 2](./docs/sprint-2/sprint-2.md)                                                             | 20/10/2026 | 09/11/2026 |✅     |
| 03     | [planejamento da sprint 3](./docs/plano-de-entregas.md#sprint-3--autenticação-e-cenários-avançados) | 10/11/2026 | 23/11/2026 | ❌     |

#### Legenda

✅ - Sprint concluída <br>
🔄 - Sprint em andamento <br>
❌ - Sprint não iniciada

---

## 📋 Especificações do Projeto

<details>
<summary><b>📌 Requisitos</b></summary>
<br>

<details>
<summary><b>Requisitos Funcionais</b></summary>
<br>

| **Código** | **Requisito Funcional**          | **Descrição**                                                                                                                                               |
| ---------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF01       | Descoberta de serviços           | O sistema deve consultar o Agregador de Métricas para identificar os serviços disponíveis.                                                                  |
| RF02       | Monitoramento dinâmico           | O sistema deve se adaptar à inclusão, remoção, indisponibilidade ou restabelecimento de serviços durante a execução.                                        |
| RF03       | Coleta de métricas por serviço   | O sistema deve consultar periodicamente o endpoint `/metrics/{id_servico}` para cada serviço disponível.                                                    |
| RF04       | Variação das métricas            | O sistema deve considerar que os valores retornados pela API podem apresentar valores distintos entre requisições.                                          |
| RF05       | Detecção de indisponibilidade    | O sistema deve identificar quando um serviço estiver indisponível ou não responder às requisições.                                                          |
| RF06       | Detecção de ausência de métricas | O sistema deve identificar quando um serviço estiver ativo, mas deixar de exportar métricas.                                                                |
| RF07       | Cálculo individual               | O sistema deve calcular consumo energético e emissão de CO₂e para cada serviço monitorado.                                                                  |
| RF08       | Indicadores agregados            | O sistema deve calcular indicadores consolidados, como consumo total, emissão total, serviços ativos e serviços indisponíveis.                              |
| RF09       | Dashboard operacional            | O sistema deve exibir, em um dashboard operacional, o status, as métricas, a localização e o impacto ambiental de cada serviço monitorado.                  |
| RF10       | Histórico de coletas             | O sistema deve armazenar o histórico das coletas realizadas para permitir análise temporal.                                                                 |
| RF11       | Atualização contínua             | A interface deve atualizar periodicamente os dados apresentados, refletindo as alterações identificadas nas informações dos serviços monitorados.           |
| RF12       | Localização dos serviços         | O sistema deve exibir país, região e, quando disponível, cidade onde o serviço está hospedado.                                                              |
| RF13       | Visualização geográfica          | O sistema poderá apresentar a posição aproximada dos serviços em um mapa. A ausência de coordenadas não deve impedir a visualização das demais informações. |
| RF14       | Ranking de impacto               | O sistema deve apresentar ranking dos serviços por maior consumo energético ou maior emissão de CO₂e.                                                       |
| RF15       | Comparação entre serviços        | O sistema deve permitir comparar métricas e impacto ambiental entre dois ou mais serviços.                                                                  |

O mapa é opcional no desafio original. A Sprint 1 entregou a primeira versão
do globo. A lista de serviços ao inspecionar uma região entrou na Sprint 2,
como continuação de T15. O aceite integral da US08 tem avaliação própria.

</details>

<br>

<details>
<summary><b>Requisitos Não Funcionais</b></summary>
<br>

Os códigos desta tabela são os identificadores internos usados no backlog da
equipe e não reproduzem integralmente a numeração do PDF do desafio. No PDF,
existem RNF01 a RNF05, e **RNF05 significa documentação técnica**, correspondente
ao RNF08 interno abaixo. Autenticação JWT é a restrição **RP06**, persistência
relaciona-se a **RF10/RP03** e Docker a **RP04**. Nas evidências de avaliação,
informar essa correspondência para não confundir requisitos do desafio com
decisões técnicas da equipe.

| **Código** | **Requisito Não Funcional**  | **Descrição**                                                                                                                                         |
| ---------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF01      | Usabilidade e responsividade | A interface deve ser clara, intuitiva e adaptável para desktop e dispositivos móveis.                                                                 |
| RNF02      | Atualização periódica        | As informações exibidas devem ser atualizadas automaticamente em intervalos configurados pela aplicação, sem necessidade de recarregamento da página. |
| RNF03      | Desempenho                   | O dashboard deve apresentar tempo de resposta compatível com a navegação e consulta contínua dos dados monitorados.                                   |
| RNF04      | Tolerância a falhas          | A indisponibilidade temporária de serviços monitorados ou APIs externas não deve interromper o funcionamento geral do sistema.                        |
| RNF05      | Segurança                    | O acesso às áreas protegidas do sistema deve ser controlado por autenticação JWT implementada no backend.                                             |
| RNF06      | Persistência de dados        | O histórico de coletas deve ser armazenado em PostgreSQL, garantindo a integridade e a persistência das informações.                                  |
| RNF07      | Containerização              | Toda a aplicação deve ser executável através de containers Docker conforme as restrições do projeto.                                                  |
| RNF08      | Documentação técnica         | O projeto deve possuir documentação de arquitetura, banco de dados, endpoints, instalação e execução.                                                 |
| RNF09      | Manutenibilidade             | O código deve seguir organização modular, separando responsabilidades entre frontend, backend, serviços e banco de dados.                             |
| RNF10      | Adaptabilidade               | A solução deve ser capaz de monitorar novos serviços identificados pela API sem necessidade de alteração manual no sistema.                           |
| RNF11      | Rastreabilidade              | User Stories, tarefas e entregas devem estar vinculadas aos requisitos definidos no backlog do projeto.                                               |
| RNF12      | Gestão Ágil                  | O projeto deve manter backlog priorizado, registro das sprints, reviews e planejamento contínuo conforme a metodologia Scrum adotada pela equipe.     |

</details>

</details>

<details>
<summary><b>👥 User Stories</b></summary>
<br>

<details>
<summary><b>📡 Épico 1 — Monitoramento dos Serviços</b></summary>
<br>

#### US01 — Descoberta de serviços

**Como** usuário da plataforma,  
**quero** que o sistema identifique automaticamente os serviços disponíveis,  
**para** acompanhar os serviços monitorados sem necessidade de cadastrá-los manualmente.

**Prioridade:** Alta

**Requisitos relacionados:** RF01, RNF10

**Critérios de aceitação:**

- O sistema deve consultar o Agregador de Métricas para obter os serviços disponíveis.
- Os serviços retornados devem ser identificados pela aplicação.
- Novos serviços disponibilizados pelo agregador devem ser reconhecidos automaticamente.

#### US02 — Monitoramento dinâmico dos serviços

**Como** usuário da plataforma,  
**quero** que o sistema reconheça alterações na disponibilidade dos serviços,  
**para** que o monitoramento represente o estado atual do ambiente.

**Prioridade:** Alta

**Requisitos relacionados:** RF02, RNF10

**Critérios de aceitação:**

- Novos serviços devem ser identificados durante a execução.
- Serviços removidos devem deixar de ser considerados disponíveis.
- Serviços indisponíveis devem ter seu estado atualizado.
- Serviços restabelecidos devem voltar a ser considerados disponíveis.

#### US03 — Coleta periódica de métricas

**Como** usuário da plataforma,  
**quero** que as métricas dos serviços sejam coletadas periodicamente,  
**para** acompanhar o comportamento dos serviços monitorados.

**Prioridade:** Alta

**Requisitos relacionados:** RF03, RF04

**Critérios de aceitação:**

- O sistema deve consultar o endpoint `/metrics/{id_servico}` para cada serviço disponível.
- As consultas devem ocorrer periodicamente.
- Os valores retornados em cada coleta devem ser processados pela aplicação.
- Alterações nos valores das métricas devem ser consideradas nas novas coletas.

</details>

<details>
<summary><b>⚠️ Épico 2 — Detecção de Problemas</b></summary>
<br>

#### US04 — Identificação de indisponibilidade

**Como** usuário da plataforma,  
**quero** identificar quando um serviço estiver indisponível,  
**para** saber quais serviços não estão respondendo normalmente.

**Prioridade:** Alta

**Requisitos relacionados:** RF05, RNF04

**Critérios de aceitação:**

- Falhas ou ausência de resposta nas consultas devem ser identificadas.
- O serviço deve ser sinalizado como indisponível.
- A indisponibilidade de um serviço não deve interromper o monitoramento dos demais.

#### US05 — Identificação de ausência de métricas

**Como** usuário da plataforma,  
**quero** identificar quando um serviço estiver ativo, mas não disponibilizar métricas,  
**para** diferenciar ausência de dados de indisponibilidade do serviço.

**Prioridade:** Alta

**Requisitos relacionados:** RF06, RNF04

**Critérios de aceitação:**

- O sistema deve verificar se o serviço permanece disponível no Agregador de Métricas.
- O sistema deve identificar quando o serviço não estiver disponibilizando métricas.
- A ausência de métricas deve possuir uma identificação distinta da indisponibilidade do serviço.

</details>

<details>
<summary><b>🌱 Épico 3 — Impacto Ambiental</b></summary>
<br>

#### US06 — Cálculo do impacto individual

**Como** usuário da plataforma,  
**quero** visualizar o consumo energético e a emissão estimada de CO₂e de cada serviço,  
**para** compreender seu impacto ambiental individual.

**Prioridade:** Alta

**Requisitos relacionados:** RF07

**Critérios de aceitação:**

- Cada serviço monitorado deve possuir um cálculo de consumo energético.
- Cada serviço monitorado deve possuir um cálculo de emissão de CO₂e.
- Os cálculos devem utilizar os dados obtidos durante o monitoramento.

#### US07 — Indicadores ambientais consolidados

**Como** usuário da plataforma,  
**quero** visualizar indicadores consolidados do ambiente monitorado,  
**para** compreender sua situação geral.

**Prioridade:** Média

**Requisitos relacionados:** RF08

**Critérios de aceitação:**

- O sistema deve apresentar o consumo energético total.
- O sistema deve apresentar a emissão total de CO₂e.
- O sistema deve apresentar a quantidade de serviços ativos.
- O sistema deve apresentar a quantidade de serviços indisponíveis.

</details>

<details>
<summary><b>📊 Épico 4 — Dashboard e Visualização</b></summary>
<br>

#### US08 — Dashboard operacional

**Como** usuário da plataforma,  
**quero** visualizar as principais informações dos serviços em um dashboard,  
**para** acompanhar o ambiente monitorado em um único local.

**Prioridade:** Alta

**Requisitos relacionados:** RF09, RNF01, RNF03

**Critérios de aceitação:**

- O dashboard deve apresentar o status dos serviços.
- O dashboard deve apresentar as métricas disponíveis.
- O dashboard deve apresentar a localização dos serviços.
- O dashboard deve apresentar os indicadores de impacto ambiental.

#### US09 — Atualização automática do dashboard

**Como** usuário da plataforma,  
**quero** que os dados do dashboard sejam atualizados automaticamente,  
**para** acompanhar as alterações do ambiente sem recarregar a página.

**Prioridade:** Alta

**Requisitos relacionados:** RF11, RNF02

**Critérios de aceitação:**

- Os dados devem ser atualizados periodicamente.
- A atualização não deve exigir recarregamento manual da página.
- O intervalo de atualização deve ser definido pela aplicação.
- O dashboard deve refletir os dados obtidos na atualização mais recente.

</details>

<details>
<summary><b>📈 Épico 5 — Histórico e Localização</b></summary>
<br>

#### US10 — Consulta do histórico de coletas

**Como** usuário da plataforma,  
**quero** consultar o histórico das coletas realizadas,  
**para** analisar a evolução das métricas e indicadores ao longo do tempo.

**Prioridade:** Média

**Requisitos relacionados:** RF10, RNF06

**Critérios de aceitação:**

- As coletas realizadas devem ser armazenadas.
- Os dados devem permanecer associados ao respectivo serviço.
- Deve ser possível consultar dados referentes a diferentes momentos de coleta.

#### US11 — Visualização da localização dos serviços

**Como** usuário da plataforma,  
**quero** visualizar a localização dos serviços monitorados,  
**para** relacionar sua localização aos dados apresentados.

**Prioridade:** Média

**Requisitos relacionados:** RF12

**Critérios de aceitação:**

- O sistema deve apresentar o país do serviço.
- O sistema deve apresentar a região do serviço.
- O sistema deve apresentar a cidade quando essa informação estiver disponível.

#### US12 — Visualização geográfica dos serviços

**Como** usuário da plataforma,  
**quero** visualizar os serviços em um mapa,  
**para** compreender sua distribuição geográfica.

**Prioridade:** Média

**Requisitos relacionados:** RF13

**Critérios de aceitação:**

- O sistema deve apresentar os serviços que possuírem latitude e longitude disponíveis.
- A posição apresentada deve utilizar as coordenadas fornecidas pela API.
- A ausência de coordenadas de um serviço não deve impedir a visualização das demais informações.

</details>

<details>
<summary><b>🔎 Épico 6 — Análise e Comparação</b></summary>
<br>

#### US13 — Ranking de impacto

**Como** usuário da plataforma,  
**quero** ordenar os serviços por consumo energético ou emissão de CO₂e,  
**para** analisar os diferentes níveis de impacto ambiental.

**Prioridade:** Média

**Requisitos relacionados:** RF14

**Critérios de aceitação:**

- Deve ser possível ordenar os serviços por consumo energético.
- Deve ser possível ordenar os serviços por emissão de CO₂e.
- Os valores utilizados no ranking devem corresponder ao período analisado.

#### US14 — Comparação entre serviços

**Como** usuário da plataforma,  
**quero** comparar dois ou mais serviços,  
**para** analisar suas métricas e indicadores ambientais.

**Prioridade:** Média

**Requisitos relacionados:** RF15

**Critérios de aceitação:**

- O usuário deve conseguir selecionar dois ou mais serviços.
- Os serviços devem ser comparados considerando o mesmo período.
- A comparação deve apresentar métricas e indicadores ambientais relevantes.

</details>

<details>
<summary><b>🔐 Épico 7 — Acesso e Segurança</b></summary>
<br>

#### US15 — Autenticação de usuários

**Como** usuário autorizado,  
**quero** me autenticar na plataforma,  
**para** acessar os recursos que exigem autorização.

**Prioridade:** Alta

**Requisitos relacionados:** RNF05

**Critérios de aceitação:**

- A autenticação deve ser realizada pelo backend.
- O sistema deve utilizar JWT após uma autenticação válida.
- Recursos protegidos não devem ser acessíveis por usuários não autenticados.
- O controle de acesso deve ser realizado no backend, não apenas na interface.

#### US16 — Continuidade do monitoramento diante de falhas

**Como** usuário da plataforma,  
**quero** que uma falha isolada não interrompa o funcionamento do sistema,  
**para** continuar acompanhando os demais serviços monitorados.

**Prioridade:** Alta

**Requisitos relacionados:** RNF04

**Critérios de aceitação:**

- A indisponibilidade de um serviço não deve interromper o monitoramento dos demais.
- Falhas em APIs externas não devem encerrar a aplicação.
- Falhas identificadas devem ser tratadas e sinalizadas adequadamente.
- O sistema deve permanecer disponível para as demais funcionalidades não afetadas.

</details>

<br>

### ✅ Definition of Done — Geral

Uma User Story será considerada concluída quando:

- A funcionalidade estiver implementada.
- Todos os critérios de aceitação da história forem atendidos.
- Os testes necessários tiverem sido realizados.
- A integração com os componentes envolvidos estiver validada.
- Não houver erros conhecidos que impeçam o funcionamento da funcionalidade.
- O código estiver integrado à versão correspondente do projeto.
- A documentação for atualizada quando a alteração exigir documentação.
- A implementação estiver disponível para validação pela equipe.

</details>

<details>
<summary><b>📦 Product Backlog</b></summary>
<br>

| **ID** | **Épico**                  | **Item / Nome**                                | **Prioridade** | **RF/RNF vinculados** | **Implementação / validação**                 |
| ------ | -------------------------- | ---------------------------------------------- | -------------- | --------------------- | --------------------------------------------- |
| US01   | Monitoramento dos Serviços | Descoberta de serviços                         | Alta           | RF01, RNF10           | ✅ Concluída na Sprint 1                       |
| US03   | Monitoramento dos Serviços | Coleta periódica de métricas                   | Alta           | RF03, RF04            | ✅ Concluída na Sprint 1                       |
| US04   | Detecção de Problemas      | Identificação de indisponibilidade             | Alta           | RF05, RNF04           | ✅ Concluída na Sprint 2                      |
| US05   | Detecção de Problemas      | Identificação de ausência de métricas          | Alta           | RF06, RNF04           | ✅ Concluída na Sprint 2                      |
| US02   | Monitoramento dos Serviços | Monitoramento dinâmico dos serviços            | Alta           | RF02, RNF10           | ✅ Implementada na Sprint 1                    |
| US06   | Impacto Ambiental          | Cálculo do impacto individual                  | Alta           | RF07                  | ✅ Implementada na Sprint 1                    |
| US07   | Impacto Ambiental          | Indicadores ambientais consolidados            | Média          | RF08                  | Issue fechada na Sprint 2; [validação registrada](./docs/sprint-2/evidencias-dod.md#validação-da-us07) |
| US08   | Dashboard e Visualização   | Dashboard operacional                          | Alta           | RF09, RNF01, RNF03    | ✅ Concluída na Sprint 2                      |
| US09   | Dashboard e Visualização   | Atualização automática do dashboard            | Alta           | RF11, RNF02           | ✅ Concluída na Sprint 1                       |
| US10   | Histórico e Localização    | Consulta do histórico de coletas               | Média          | RF10, RNF06           | ✅ Implementada na Sprint 1                    |
| US11   | Histórico e Localização    | Visualização da localização dos serviços       | Média          | RF12                  | ✅ Implementada na Sprint 1                    |
| US12   | Histórico e Localização    | Visualização geográfica dos serviços           | Média          | RF13                  | ✅ Implementada na Sprint 1                    |
| US13   | Análise e Comparação       | Ranking de impacto                             | Média          | RF14                  | ✅ Concluída na Sprint 2                      |
| US14   | Análise e Comparação       | Comparação entre serviços                      | Média          | RF15                  | ✅ Concluída na Sprint 2                      |
| US15   | Acesso e Segurança         | Autenticação de usuários                       | Alta           | RNF05                 | ❌                                            |
| US16   | Acesso e Segurança         | Continuidade do monitoramento diante de falhas | Alta           | RNF04                 | 🔄 Base implementada; ampliar validação       |

<br>

**Legenda**

A matriz abaixo detalha a rastreabilidade de oito histórias relacionadas às
entregas da Sprint 1. A US02 ainda exige validação completa das transições de
descoberta, ausência e restabelecimento. As entregas da Sprint 2 têm seu próprio
[registro de evidências](./docs/sprint-2/evidencias-dod.md).

US04 registra falhas e recuperação no histórico. A US16 tem tratamento de
falhas implementado e requer validação de cenários adicionais.
A US05 usa `metrics_missing` para HTTP 500 da consulta de métricas, que significa
serviço indisponível ou exportador de métricas indisponível; HTTP 404 significa
serviço removido ou métricas inexistentes e resulta em `unavailable`.
Erros da Cloudflare, como HTTP 530, são identificados separadamente no histórico,
preservando o status anterior do serviço. A [issue #75](https://github.com/Team-Zero-DSM/GreenER/issues/75)
registra os critérios de aceite da US07. O [teste da Sprint 2](./docs/sprint-2/evidencias-dod.md#validação-da-us07)
documenta os indicadores exibidos por região e os totais do ambiente conferidos no banco.

- ❌ — Não iniciada
- 🔄 — Parcialmente implementada ou com validação de falhas pendente
- ✅ — História concluída ou implementação registrada na documentação da sprint

### Rastreabilidade das oito histórias implementadas

Os IDs abaixo correspondem às tarefas existentes no
[Sprint Backlog da Sprint 1](./docs/sprint-1/sprint-1.md). A matriz registra a
cobertura encontrada na implementação dessas tarefas, inclusive funcionalidades
que não estavam explícitas em seus títulos originais. Não cria tarefas concluídas
retroativamente, não acrescenta pontos e não altera responsáveis ou estimativas.

Somente **US01, US03, US08 e US09** foram selecionadas originalmente para a
Sprint 1. Relacionar as entregas às demais histórias do produto não altera essa
seleção nem representa seu aceite.

| User Story                                          | Tarefas relacionadas e contribuição implementada                                                                                                                                                                                           | Código e evidências                                                                                                                                                                                                                                                                                                                                                                           | Validação / aceite pendente                                                                                                                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **US01 — Descoberta de serviços**                   | **T03:** integração com descoberta; **T04:** modelo e mapper dos serviços; **T05:** endpoint interno de listagem.                                                                                                                          | [MetricsClient](./backend/src/integrations/metrics-api.ts), [sincronização](./backend/src/modules/collections/collections.service.ts), [rotas de serviços](./backend/src/modules/services/services.routes.ts); evidências de T03–T05 no [registro da DoD](./docs/sprint-1/evidencias-dod.md).                                                                                                 | Aceite formal; a descoberta real já possui evidência registrada.                                                                                                                               |
| **US02 — Monitoramento dinâmico**                   | **T03:** redescoberta dos serviços; **T08:** execução recorrente da sincronização e coleta; **T16:** apresentação do status; **T17:** integração dos estados com a interface.                                                              | `syncServices`, `collectService` e `statusFromError` em [CollectionsService](./backend/src/modules/collections/collections.service.ts); `updateDiscoveredService`, `deactivateMissingServices` e `updateStatus` no [repository](./backend/src/modules/collections/collections.repository.ts); [job](./backend/src/jobs/collections.job.ts).                                                   | Validar o ciclo completo de novo serviço, remoção, reaparição e recuperação, inclusive falha da descoberta; aceite formal. Reaparição na descoberta e sucesso da coleta são eventos distintos. |
| **US03 — Coleta periódica de métricas**             | **T06:** integração de métricas; **T07:** processamento; **T08:** rotina periódica; **T09:** disponibilização no backend; **T10:** testes da atualização periódica.                                                                        | [CollectionsService](./backend/src/modules/collections/collections.service.ts), [job](./backend/src/jobs/collections.job.ts); verificações de T06–T10 e V06 no [registro da DoD](./docs/sprint-1/evidencias-dod.md).                                                                                                                                                                          | Aceite formal; os testes existentes e a recorrência observada não cobrem todos os cenários de falha.                                                                                           |
| **US06 — Cálculo do impacto individual**            | **T07:** cálculo de potência, energia e CO₂e; **T09:** exposição dos resultados; **T13:** detalhe do serviço; **T17:** integração com dados reais.                                                                                         | `calculateEmissions` em [CollectionsService](./backend/src/modules/collections/collections.service.ts), [detalhe](./frontend/src/pages/ServiceDetailPage.tsx), [fórmulas e unidades](./docs/cálculo.md); reprocessamento V05 e evidências de T07/T13/T17 no [registro da DoD](./docs/sprint-1/evidencias-dod.md).                                                                             | Aceite formal; os valores são estimativas do modelo simplificado, não medições físicas.                                                                                                        |
| **US09 — Atualização automática do dashboard**      | **T18:** atualização automática; **T19:** verificação sem recarregar a página; **T08:** rotina de coleta que fornece novas informações.                                                                                                    | [MonitoringProvider](./frontend/src/contexts/MonitoringProvider.tsx), [useApiQuery](./frontend/src/hooks/useApiQuery.ts); observações de dados e horários em T18–T19 no [registro da DoD](./docs/sprint-1/evidencias-dod.md).                                                                                                                                                                 | Aceite formal; a atualização da interface é diferente da frequência do job e do intervalo energético de cada amostra.                                                                          |
| **US10 — Consulta do histórico de coletas**         | **T07:** processamento e gravação das coletas; **T09:** consultas de histórico e totais no backend; **T13:** gráficos e seleção de período no detalhe; **T17:** integração real; **T20/T21/T30:** suporte de estrutura, banco e modelagem. | [Gravação das coletas](./backend/src/modules/collections/collections.repository.ts), [AnalyticsRepository](./backend/src/modules/analytics/analytics.repository.ts), [rotas de histórico](./backend/src/modules/analytics/analytics.routes.ts), [detalhe](./frontend/src/pages/ServiceDetailPage.tsx); conferência HTTP × SQL em V11 no [registro da DoD](./docs/sprint-1/evidencias-dod.md). | Aceite formal; a retenção após reinicialização deve ser sustentada por evidência específica, sem confundir volume configurado com verificação executada.                                       |
| **US11 — Visualização da localização dos serviços** | **T04:** representação da localização; **T05:** disponibilização dos serviços e localização; **T13/T14:** apresentação no detalhe e listagem; **T17:** integração com o backend.                                                           | [Mapper](./backend/src/integrations/metrics-api.mapper.ts), [repository de serviços](./backend/src/modules/services/services.repository.ts), [listagem](./frontend/src/components/services/ServiceList.tsx), [detalhe](./frontend/src/pages/ServiceDetailPage.tsx); evidências de T04/T13/T14/T17 no [registro da DoD](./docs/sprint-1/evidencias-dod.md).                                    | Aceite formal; cidade e coordenadas ausentes devem continuar sendo tratadas como opcionais.                                                                                                    |
| **US12 — Visualização geográfica dos serviços**     | **T04/T05:** coordenadas recebidas pela API; **T12:** página inicial; **T15:** parcela do globo e dos marcadores já implementada; **T17:** integração com os serviços reais.                                                               | [LandingPage](./frontend/src/pages/LandingPage.tsx) filtra serviços sem coordenadas ao montar os marcadores; [GlobeView](./frontend/src/components/globe/GlobeView.tsx) posiciona os pins; evidências de T12/T17 e decisão de T15 no [registro da DoD](./docs/sprint-1/evidencias-dod.md).                                                                                                    | Aceite formal. A parcela geográfica implementada não conclui toda a T15: apresentar os serviços ao inspecionar uma região permanece para a Sprint 2.                                           |

A matriz foi conferida com o código e as evidências já registradas. Esta atualização
documental não representa uma nova execução de testes nem uma homologação das histórias.

</details>

<details>
<summary><b>📝 Padrão de Commits</b></summary>

Para garantir a rastreabilidade com o **GitHub Projects** e as **Issues**, adotamos os seguintes padrões:

### Commits

As mensagens devem referenciar o ID da Issue com `#`:

- `tipo(#id_issue): descrição clara`
- _Exemplo:_ `feat(#1): implementar hash de senha no cadastro`

**Tipos permitidos:**

| Tipo           | Descrição                                                      |
| :------------- | :------------------------------------------------------------- |
| **`feat`**     | Adição de um novo recurso ou funcionalidade.                   |
| **`fix`**      | Correção de um erro ou bug.                                    |
| **`docs`**     | Alterações apenas na documentação (ex: README).                |
| **`refactor`** | Mudanças na estrutura do código sem alterar seu comportamento. |
| **`cleanup`**  | Limpeza de código (remover comentários ou trechos inúteis).    |

</details>
