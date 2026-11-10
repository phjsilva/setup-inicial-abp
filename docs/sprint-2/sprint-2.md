# 🚀 Sprint 2 — Entregas e Acompanhamento

## Situação da entrega

As 28 tarefas registradas abaixo constam como concluídas. A inspeção regional
associada à #32 foi entregue nesta sprint. As seis histórias selecionadas
têm entrega registrada.

## 🎯 Sprint Goal

O objetivo é ampliar a análise ambiental com rankings e comparação entre
serviços, registrar falhas e recuperação das coletas e evoluir o dashboard e as
visualizações regionais.

---

## 📅 Período

- **Início:** 20/10/2026
- **Término:** 09/11/2026

---

## 👥 User Stories Contempladas

| ID | User Story | Relação com a sprint |
|---|---|---|
| **US04** | Identificação de indisponibilidade | Concluída nesta sprint |
| **US05** | Identificação de ausência de métricas | Concluída nesta sprint |
| **US07** | Indicadores ambientais consolidados | Issue fechada; [validação registrada](./evidencias-dod.md#validação-da-us07) |
| **US08** | Dashboard operacional | Continuidade da Sprint 1; concluída nesta sprint |
| **US13** | Ranking de impacto | Concluída nesta sprint |
| **US14** | Comparação entre serviços | Concluída nesta sprint |

---

## 📋 Sprint Backlog — Sprint 2

| ID | Tarefa | Responsável | Status | Pontos |
|---|---|---|:---:|---:|
| **T01** | Implementar componentes e interações da comparação (#83) | henrique | ✅ | 8 |
| **T02** | Implementação da listagem de serviços e integração com o globo na landing page (#80) | gabriel | ✅ | 8 |
| **T03** | Criar componente de visualização das métricas (#32) | gabriel | ✅ | 3 |
| **T04** | Criar componente para exibição das regiões (#97) | vitor | ✅ | 3 |
| **T05** | Criar componente para exibição de carbono por região (#98) | vitor | ✅ | 3 |
| **T06** | Criar componente para exibição do mapa 2D com as regiões (#99) | vitor | ✅ | 8 |
| **T07** | Criar estrutura da tela de ranking (#102) | paulo | ✅ | 3 |
| **T08** | Implementar filtros de critério e período do ranking (#103) | paulo | ✅ | 3 |
| **T09** | Integrar a tela de ranking ao backend (#104) | paulo | ✅ | 5 |
| **T10** | Implementar gráfico de barras do ranking (#105) | paulo | ✅ | 5 |
| **T11** | Implementar tabela de classificação do ranking (#106) | paulo | ✅ | 3 |
| **T12** | Atualizar diagrama de casos de uso (#77) | henrique | ✅ | 2 |
| **T13** | Elaborar diagramas de sequência (#78) | henrique | ✅ | 5 |
| **T14** | Criar estrutura da tela de comparação (#82) | henrique | ✅ | 2 |
| **T15** | Criar tabela de histórico de status das coletas (#89) | pedro | ✅ | 3 |
| **T16** | Implementar registro do histórico de status das coletas (#90) | pedro | ✅ | 3 |
| **T17** | Criar componente de visualização das métricas (#63) | gabriel | ✅ | 3 |
| **T18** | Implementação das funcionalidades do globo (#79) | gabriel | ✅ | 8 |
| **T19** | Atualização da Header do projeto (#81) | gabriel | ✅ | 3 |
| **T20** | Integrar a tela de comparação ao backend (#84) | henrique | ✅ | 5 |
| **T21** | Implementar a visualização dos resultados comparativos (#85) | henrique | ✅ | 5 |
| **T22** | Implementar cálculos e resumo comparativo (#86) | henrique | ✅ | 2 |
| **T23** | Criar endpoint para consultar o histórico de status das coletas (#91) | pedro | ✅ | 5 |
| **T24** | Criar endpoints para a tela de ranking (#92) | pedro | ✅ | 5 |
| **T25** | Criar endpoints para a tela de comparação entre serviços (#93) | pedro | ✅ | 8 |
| **T26** | Validar endpoint de serviços por região (#94) | Vitor | ✅ | 2 |
| **T27** | Realizar testes das funcionalidades do backend (#95) | pedro | ✅ | 5 |
| **T28** | Atualizar documentação do backend e do banco de dados (#96) | pedro | ✅ | 3 |

**Resultado: 28 tarefas registradas como concluídas, somando 121 pontos de esforço.**
Os pontos e responsáveis estão no [backlog por issue](./evidencias-dod.md#sprint-backlog).

---

## 📈 Burndown da Sprint

<p align="center">
    <img src="./BurndownSprint2.svg" alt="Gráfico de Burndown">
</p>

O total de **121 pontos** também aparece no campo `Estimate` da coluna
**Done**, com o filtro da Sprint 2 no
[GitHub Projects](https://github.com/orgs/Team-Zero-DSM/projects/3).

---

## Evidências e rastreabilidade

| História | Tarefas vinculadas | Entrega registrada |
|---|---|---|
| US04 e US05 | #89–#91 | Tabela, registro e consulta do histórico de falhas e recuperação das coletas. PRs #101, #107 e #108. |
| US07 | [#75](https://github.com/Team-Zero-DSM/GreenER/issues/75) | Cards de energia e CO₂e por região. Os quatro indicadores do ambiente foram conferidos no banco. [Detalhes da validação](./evidencias-dod.md#validação-da-us07) |
| US08 | #32, #79–#81, #94 e #97–#99 | Inspeção de serviços por região, globo e mapa 2D, listagem, navegação e indicadores regionais. PRs #110, #115, #118, #120, #124, #125 e #128. |
| US13 | #92 e #102–#106 | Ranking integrado ao backend, filtros de critério e período, gráfico e tabela de classificação. PRs #109, #112, #114, #116, [#122](https://github.com/Team-Zero-DSM/GreenER/pull/122) e #126. |
| US14 | #82–#86 e #93 | Comparação integrada ao backend, seleção de serviços, visualização, cálculos e resumo comparativo. PRs #100, #111, #113, #121, #123 e #129. |

Documentação e validação do backend foram concluídas nas tarefas #95 e #96,
vinculadas aos PRs #127 e #130. Diagramas foram atualizados em #77 e #78,
com os PRs #87 e #88.

Os PRs e os resultados dos testes constam no
[registro de evidências](./evidencias-dod.md#evidências-e-limites-de-conclusão).

## Participação da equipe

| Integrante | Presença nas sete dailies registradas | Atividades registradas |
|---|---:|---|
| Henrique | 7 | Diagramas de casos de uso e sequência. Planejamento da integração da comparação. |
| Paulo | 5 | Desenvolvimento e entrega da estrutura da página de ranking. |
| Gabriel | 5 | Visualização das métricas e ajustes da página inicial. |
| Pedro | 7 | Planejamento dos endpoints e entrega do histórico de status de coleta. |
| Vitor | 7 | Tags da tela de regiões e ajustes para dispositivos móveis e tablets. |

A contagem cobre os registros de 20 a 28/10. O planejamento em equipe de 20/10
e o ajuste a partir do feedback do cliente em 21/10 também estão nas [dailies](./dailies.md).

## Verificações e Definition of Done

O fechamento da issue registra o estado do trabalho no GitHub. A aplicação da
[DoD geral](../../README.md#-definition-of-done--geral) é conferida pelas evidências
de integração, teste e aceite da história.

| Critério | Resultado registrado |
|---|---|
| Código integrado | Os PRs de histórico, ranking, comparação e regiões estão vinculados às tarefas no [registro de evidências](./evidencias-dod.md#evidências-e-limites-de-conclusão). |
| Testes e integração | PRs #128 e #127 e [validação com PostgreSQL e Compose](./evidencias-dod.md#evidências-e-limites-de-conclusão), com resultados de instalação, API, migração e testes do backend. |
| Critérios de aceite | A [validação da US07](./evidencias-dod.md#validação-da-us07) indica onde cada resultado foi observado e explicita a cobertura da interface. |
| Documentação | #96 fechada, com PR #130; diagramas entregues em #77 e #78. |

## 🔎 Sprint Review

O escopo proposto foi entregue: histórico de status das coletas, ranking de
impacto ambiental, comparação entre serviços e ampliação do dashboard e das
visualizações regionais. As integrações com o backend, os testes previstos e a
documentação também foram concluídos.

As seis histórias selecionadas (US04, US05, US07, US08, US13 e US14) estão
fechadas no GitHub. A inspeção dos serviços por região associada à #32 foi
concluída nesta sprint. O período planejado permanece de 20/10 a 09/11/2026;
a situação acima foi consolidada em 06/11/2026.

Feedback da apresentação e aceite formal do cliente: sem registro disponível
para esta atualização.

---

## 🔄 Sprint Retrospective

### O que funcionou?

> A organização e a divisão das tarefas funcionaram muito bem. Cada integrante teve clareza sobre suas responsabilidades e pôde trabalhar nas áreas em que tinha mais afinidade. Isso facilitou o acompanhamento das entregas e permitiu concluir todas as tarefas previstas, representando uma evolução em relação à Sprint anterior.

### O que não funcionou?

> Feriados, finais de semana e atividades acadêmicas impactaram um pouco o ritmo de desenvolvimento e fizeram com que o progresso se afastasse temporariamente do Burndown planejado. Apesar disso, os imprevistos não comprometeram o resultado final, e a equipe conseguiu concluir todas as entregas previstas.

### O que melhorar na próxima Sprint?

> Manter o formato atual de organização e divisão das tarefas, aprimorando-o conforme a experiência da equipe. Como a próxima Sprint será mais curta, será importante antecipar as entregas e manter um ritmo de desenvolvimento constante para evitar acúmulo de tarefas no final.

---

## 🎥 Demonstração da Sprint

Link da apresentação da sprint: 

<p align="left">
  <a href="https://www.youtube.com/watch?v=jaLqoq2bONs" target="_blank">
    <img 
      src="GreenER-Thumbnail-Sprint_2.png" 
      alt="GreenER - Sprint 2"
      width="600"
      style="border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.25);"
    />
  </a>
</p>

