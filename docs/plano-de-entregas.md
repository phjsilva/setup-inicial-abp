# Plano de Entregas

O plano organiza as funcionalidades do GreenER conforme suas dependências: primeiro o monitoramento e os dados atuais, depois o histórico e os rankings e, por fim, as análises comparativas.

## Sprint 1 — Fundação, métricas e impacto ambiental
**28/09/2026 a 19/10/2026**

- Preparar a aplicação e integrar as APIs externas para descoberta e monitoramento dinâmico dos serviços.
- Coletar métricas, identificar indisponibilidades e calcular consumo energético e emissões de CO₂e.
- Disponibilizar dashboard com atualização periódica, localização dos serviços e visualização em mapa.
- Implementar autenticação e tolerância a falhas no monitoramento.

**Entrega:** plataforma básica funcional para acompanhar serviços e visualizar suas métricas e estimativas ambientais atuais.

## Sprint 2 — Persistência e ranking
**20/10/2026 a 09/11/2026**

- Armazenar as coletas no PostgreSQL e permitir consultas históricas por período.
- Apresentar rankings de consumo energético e emissões de CO₂e.

**Entrega:** consulta da evolução dos serviços e comparação de suas posições no ranking por período.

## Sprint 3 — Comparação e análises avançadas
**10/11/2026 a 23/11/2026**

- Comparar métricas e impacto ambiental de diferentes serviços em períodos equivalentes.
- Simular o impacto de um serviço em diferentes regiões.

**Entrega:** recursos de análise para apoiar a comparação entre serviços e cenários regionais para análises mais precisas.
