# Sprint 2 — Evidências das entregas

**Período planejado:** 20/10/2026 a 09/11/2026.
**Fontes:** [GitHub Projects — GreenER-ABP2](https://github.com/orgs/Team-Zero-DSM/projects/3)
e [milestone Sprint 2, incluindo fechadas](https://github.com/Team-Zero-DSM/GreenER/milestone/2?closed=1).

O backlog registra 28 tarefas concluídas. Os estados das issues e as
evidências de aceite das histórias estão descritos separadamente abaixo.

## Histórias selecionadas

| História | Issue | Requisito | Situação |
|---|---|---|---|
| US04 — Identificação de indisponibilidade | [#72](https://github.com/Team-Zero-DSM/GreenER/issues/72) | RF05, RNF04 | Concluída; issue fechada |
| US05 — Identificação de ausência de métricas | [#73](https://github.com/Team-Zero-DSM/GreenER/issues/73) | RF06, RNF04 | Concluída; issue fechada |
| US07 — Indicadores ambientais consolidados | [#75](https://github.com/Team-Zero-DSM/GreenER/issues/75) | RF08 | Issue fechada. Indicadores regionais exibidos na interface e totais do ambiente conferidos no banco. [Detalhes da validação](#validação-da-us07) |
| US08 — Dashboard operacional | [#3](https://github.com/Team-Zero-DSM/GreenER/issues/3) | RF09, RNF01, RNF03 | Concluída nesta sprint; issue fechada |
| US13 — Ranking de impacto | [#74](https://github.com/Team-Zero-DSM/GreenER/issues/74) | RF14 | Concluída; issue fechada |
| US14 — Comparação entre serviços | [#76](https://github.com/Team-Zero-DSM/GreenER/issues/76) | RF15 | Concluída; issue fechada |

## Sprint Backlog

O backlog da Sprint 2 reúne 28 tarefas, de T01 a T28.
A issue #32 registra o saldo da inspeção regional. O
[PR #63](https://github.com/Team-Zero-DSM/GreenER/pull/63) foi integrado na
Sprint 1 e está no milestone da Sprint 2 como item de apoio, com os 3 pontos
registrados na T17.

As estimativas do backlog somam **121 pontos**, também exibidos no campo
`Estimate` da coluna **Done** do Projects com o filtro da Sprint 2.

| ID | Tarefa / issue | Responsável | Status | Pontos |
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

As 28 tarefas concluídas somam **121 pontos**. A coluna **Responsável** reúne
as atribuições do planejamento da sprint e do GitHub.

A #40 reúne a manutenção do README e das dailies e fica fora da pontuação
do backlog da sprint.

## Evidências e limites de conclusão

| Entrega | Issues | PRs vinculados |
|---|---|---|
| Diagramas de casos de uso e sequência | #77, #78 | [#87](https://github.com/Team-Zero-DSM/GreenER/pull/87), [#88](https://github.com/Team-Zero-DSM/GreenER/pull/88) |
| Histórico de status: tabela, gravação e consulta | #89–#91 | [#101](https://github.com/Team-Zero-DSM/GreenER/pull/101), [#107](https://github.com/Team-Zero-DSM/GreenER/pull/107), [#108](https://github.com/Team-Zero-DSM/GreenER/pull/108) |
| Inspeção regional e globo | #32, #79, #80 | [#118](https://github.com/Team-Zero-DSM/GreenER/pull/118), [#120](https://github.com/Team-Zero-DSM/GreenER/pull/120) |
| Header e navegação | #81 | [#124](https://github.com/Team-Zero-DSM/GreenER/pull/124) |
| Cards, carbono regional e mapa 2D | #97–#99 | [#110](https://github.com/Team-Zero-DSM/GreenER/pull/110), [#115](https://github.com/Team-Zero-DSM/GreenER/pull/115), [#125](https://github.com/Team-Zero-DSM/GreenER/pull/125) |
| Ranking: estrutura, filtros, endpoint, gráfico, tabela e integração | #92, #102–#106 | [#109](https://github.com/Team-Zero-DSM/GreenER/pull/109), [#112](https://github.com/Team-Zero-DSM/GreenER/pull/112), [#114](https://github.com/Team-Zero-DSM/GreenER/pull/114), [#116](https://github.com/Team-Zero-DSM/GreenER/pull/116), [#122](https://github.com/Team-Zero-DSM/GreenER/pull/122), [#126](https://github.com/Team-Zero-DSM/GreenER/pull/126) |
| Comparação: estrutura, interações, endpoint, resultados, cálculos e integração | #82–#86, #93 | [#100](https://github.com/Team-Zero-DSM/GreenER/pull/100), [#111](https://github.com/Team-Zero-DSM/GreenER/pull/111), [#113](https://github.com/Team-Zero-DSM/GreenER/pull/113), [#121](https://github.com/Team-Zero-DSM/GreenER/pull/121), [#123](https://github.com/Team-Zero-DSM/GreenER/pull/123), [#129](https://github.com/Team-Zero-DSM/GreenER/pull/129) |
| Validação de serviços por região | #94 | [#128](https://github.com/Team-Zero-DSM/GreenER/pull/128) |
| Testes do backend | #95 | [#127](https://github.com/Team-Zero-DSM/GreenER/pull/127) |
| Documentação do backend e banco | #96 | [#130](https://github.com/Team-Zero-DSM/GreenER/pull/130) |

Os PRs vinculados documentam a implementação das tarefas. A validação da
#95 está no [PR #127](https://github.com/Team-Zero-DSM/GreenER/pull/127).
Os testes de instalação, API e migração rodaram em uma cópia limpa do commit
`0401658`, com PostgreSQL 17 em um projeto Compose isolado.

| Verificação | Resultado |
|---|---|
| Instalação limpa | Frontend, backend e PostgreSQL subiram juntos com `docker compose up --build`. O schema criou `status_coleta` e o frontend respondeu HTTP 200. |
| Consulta HTTP de histórico | A API retornou HTTP 200 com uma observação sintética gravada no PostgreSQL. A resposta permitiu a origem do frontend no cabeçalho CORS. |
| Migração da Sprint 1 | Um banco criado com o schema da Sprint 1 (`f686e6c`) recebeu a [migração](../../database/migrations/001_status_coleta.sql) duas vezes. Após reiniciar o PostgreSQL, a coleta original e o novo status vinculado permaneceram acessíveis, com o índice presente. |
| Suíte do backend | 30 testes passaram, incluindo três de integração com PostgreSQL, executados a partir do repositório contra o banco isolado. |

As verificações usaram dados sintéticos e dispensaram as APIs externas de
métricas e carbono. O aceite do cliente é registrado separadamente.

### Validação da US07

O [teste com dados sintéticos](https://github.com/Team-Zero-DSM/GreenER/issues/75#issuecomment-6751580199)
usou duas regiões e uma janela de 24 horas. Em `/regioes`, os cards exibiram
2 kWh e 200 g de CO₂e para a primeira região e 3 kWh e 300 g de CO₂e para a segunda.

| Critério da issue #75 | Resultado para todo o ambiente | Onde foi conferido |
|---|---:|---|
| Consumo energético total | 5 kWh | PostgreSQL |
| Emissão total | 500 g de CO₂e | PostgreSQL |
| Serviços ativos | 3 | PostgreSQL |
| Serviços indisponíveis | 1 | PostgreSQL |

A evidência da interface cobre os valores por região. A exibição conjunta dos
quatro indicadores do ambiente em uma tela fica sem evidência neste teste. A
[demonstração da Sprint 2](https://www.youtube.com/watch?v=jaLqoq2bONs&t=280s)
apresenta a tela de visão geral no plano da próxima sprint.

## Dependências e pendências para o encerramento

As dependências de implementação previstas foram concluídas: histórico de status
(#89 → #90 → #91), ranking (#92 e #102–#106), comparação (#82–#86 e #93)
e visualizações regionais (#32, #79–#81, #94 e #97–#99).

O registro de feedback e aceite formal, a retrospectiva e o link da
demonstração seguem na [página da sprint](./sprint-2.md).
Autenticação e simulação avançada continuam fora do escopo desta entrega.

## Acompanhamento

As [dailies](./dailies.md) registram as atividades da sprint. A
[página da Sprint 2](./sprint-2.md) reúne o burndown e a participação de 20 a 28/10.
