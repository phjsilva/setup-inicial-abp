# 🏗️ Arquitetura e Modelagem

Esta seção reúne os artefatos de modelagem desenvolvidos para o projeto **GreenER**.

Os diagramas servem como apoio para análise, implementação e evolução da solução ao longo das sprints, permitindo visualizar os principais elementos e comportamentos da plataforma.

Além da visualização em imagem, os diagramas possuem seus respectivos arquivos editáveis no Lucidchart, possibilitando consulta detalhada e navegação pelos elementos modelados.

---

## 🛠️ Ferramenta Utilizada

<a href="https://www.lucidchart.com/" target="_blank">
    <img
        src="https://upload.wikimedia.org/wikipedia/commons/a/ae/Lucidchart-Primary3D-Logo-Default-TypeCG100-onClear-np-RGB-L.png"
        alt="Lucidchart"
        height="50"
    >
</a>

Ferramenta utilizada para a criação e manutenção dos diagramas UML do projeto.

Por meio dela são desenvolvidos os diagramas utilizados na documentação da aplicação, permitindo representar visualmente os principais aspectos da solução.

---

## 📋 Diagramas Disponíveis

| Diagrama      | Descrição                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------- |
| Caso de Uso   | Representa os atores envolvidos e os principais objetivos disponíveis na plataforma         |
| Classes       | Representa a estrutura do sistema, suas entidades, atributos, métodos e relacionamentos     |
| Sequência     | Representa a interação entre os participantes do sistema ao longo do tempo                  |

---

# 🎯 Diagrama de Caso de Uso

## Visualização

<p align="center">
    <img src="./images/caso-de-uso.svg" alt="Diagrama de Caso de Uso">
</p>

## Arquivo Original

🔗 Lucidchart: [Acessar diagrama](https://lucid.app/lucidchart/547778f4-32b2-4cc9-9630-ae5ce0b6e4be/view)

## Objetivo

Representar os atores envolvidos no sistema e os principais objetivos que podem ser realizados dentro da plataforma GreenER.

---

# 🧩 Diagrama de Classes

## Visualização

<p align="center">
    <img src="./images/diagrama-de-classes.svg" alt="Diagrama de Classes">
</p>

## Arquivo Original

🔗 Lucidchart: [Acessar diagrama](https://lucid.app/lucidchart/37acad31-54dc-4cac-aff9-a3d7c1721d7a/view)

## Objetivo

Representar a estrutura estática do sistema, evidenciando as principais entidades do domínio, seus atributos, métodos e relacionamentos, servindo como base para implementação e evolução da aplicação.

---

# 🔄 Diagramas de Sequência

Os arquivos SVG dos diagramas de sequência devem ser adicionados à pasta `./images/diagramas-de-sequencia/`.

Duplique o molde abaixo para documentar cada diagrama:

## Consulta de serviços

### Visualização

<p align="center">
    <img src="./images/diagramas-de-sequencia/diagrama_tela_inicial_para_consulta_de_servicos_disponiveis.svg" alt="Diagrama de Sequência: Nome do Diagrama">
</p>

### Arquivo Original

🔗 [Acessar diagrama](https://lucid.app/lucidchart/c8a01b5a-88b4-4b01-a1e9-4492dd0211bf/view)

### Objetivo

Exibir os serviços disponíveis e seus status no mapa da tela inicial, com atualização periódica das informações.

## Dashboard de serviço

### Visualização

<p align="center">
    <img src="./images/diagramas-de-sequencia/diagrama_para_detalhamento_de_servivo.svg" alt="Diagrama de Sequência: Nome do Diagrama">
</p>

### Arquivo Original

🔗 [Acessar diagrama](https://lucid.app/lucidchart/37409460-c872-42ef-85f5-821b911c639b/view)

### Objetivo

Permitir que o usuário selecione um serviço e visualize suas métricas e informações detalhadas.

## Análise de ranking

### Visualização

<p align="center">
    <img src="./images/diagramas-de-sequencia/Diagrama_analise_de_ranking.svg" alt="Diagrama de Sequência: Nome do Diagrama">
</p>

### Arquivo Original

🔗 [Acessar diagrama](https://lucid.app/lucidchart/0d8a9485-9648-4c4b-a320-cb80d819d560/view)

### Objetivo

Permitir que o usuário visualize os serviços ordenados por critérios de priorização e configure critérios para gerar novas classificações.