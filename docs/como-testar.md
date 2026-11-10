# Como testar esta versão do GreenER

Este roteiro cobre o acesso ao site, os painéis da Visão Geral, a exportação de relatórios, a edição do perfil e a configuração administrativa.

## 1. Subir o ambiente local

Com o Docker aberto, execute na raiz do projeto pelo PowerShell. Os comandos copiam os exemplos de configuração apenas quando o arquivo correspondente ainda não existe.

```powershell
if (-not (Test-Path backend/.env)) {
    Copy-Item backend/.env.example backend/.env
}
if (-not (Test-Path frontend/.env)) {
    Copy-Item frontend/.env.example frontend/.env
}
```

Em um banco novo, o Compose carrega o schema. Se o banco já existe, siga a seção [Banco já existente](#banco-já-existente) antes de iniciar o backend.

```powershell
docker compose up -d --build --wait
docker compose ps
Invoke-RestMethod http://localhost:3000/health
```

A API deve responder com `status: ok`. Abra o [Início do GreenER](http://localhost:5173/). Se ainda não houver administrador no banco, siga a [instrução do README](../README.md#contas-e-telas-da-sprint-3) para criar o primeiro.

Use uma conta nova para testar o papel **Visualizador** e uma conta **Admin** para testar a Configuração. Para validar gráficos com valores reais, aguarde uma coleta bem-sucedida e escolha um período que inclua a rodada. As telas sinalizam quando o período está sem amostras. Faça alterações de intervalo, coeficientes e permissões em um banco de teste.

### Banco já existente

Use o mesmo banco para manter contas e histórico de coletas. Para atualizar a estrutura, use os arquivos de `database/migrations/`. Reserve o `database/schema.sql` para bancos vazios.

**Se o banco já roda pelo Docker Compose**, execute na raiz do projeto usando o mesmo projeto Compose que criou o volume. Faça o backup antes de aplicar as migrações.

```powershell
docker compose up -d --wait database
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível iniciar o banco.' }

$backupName = "greener-$(Get-Date -Format yyyyMMdd-HHmmss).dump"
$backupFile = Join-Path $env:TEMP $backupName
docker compose exec -T database pg_dump -U postgres -d greener -Fc -f "/tmp/$backupName"
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível gerar o backup.' }
docker compose cp "database:/tmp/$backupName" $backupFile
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível copiar o backup.' }
Write-Output $backupFile

foreach ($migration in @(
    'database/migrations/001_status_coleta.sql',
    'database/migrations/002_contas_e_dashboards.sql'
)) {
    Get-Content -Raw -LiteralPath $migration |
        docker compose exec -T database psql -X -v ON_ERROR_STOP=1 -U postgres -d greener
    if ($LASTEXITCODE -ne 0) { throw "Falha ao aplicar $migration. Confira a mensagem do PostgreSQL." }
}
```

As duas migrações podem ser reaplicadas. Depois delas, volte aos comandos de inicialização do Compose no início desta seção. Use `docker compose down` ao encerrar. A opção `-v` remove os volumes e deve ficar fora desse fluxo.

**Se o PostgreSQL foi instalado diretamente na máquina**, mantenha o serviço local ativo e configure `backend/.env` com `DATABASE_HOST=localhost` e os valores de `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER` e `DATABASE_PASSWORD` da instalação. Use os clientes `pg_dump` e `psql` do PostgreSQL na raiz do projeto.

Se a pessoa criou o banco, mas ele ainda está vazio, ajuste a porta, o usuário e o nome do banco neste comando e execute-o uma vez. Depois, siga para a inicialização do backend e do frontend.

```powershell
psql -X -h localhost -p 5432 -U postgres -d greener -v ON_ERROR_STOP=1 -f database/schema.sql
```

Se o banco já tem as tabelas do GreenER, ajuste os três valores abaixo e rode o backup e as migrações.

```powershell
$dbPort = 5432
$dbName = 'greener'
$dbUser = 'postgres'
$backupFile = Join-Path $env:TEMP "greener-$(Get-Date -Format yyyyMMdd-HHmmss).dump"

pg_dump -h localhost -p $dbPort -U $dbUser -d $dbName -Fc -f $backupFile
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível gerar o backup.' }

foreach ($migration in @(
    'database/migrations/001_status_coleta.sql',
    'database/migrations/002_contas_e_dashboards.sql'
)) {
    psql -X -h localhost -p $dbPort -U $dbUser -d $dbName -v ON_ERROR_STOP=1 -f $migration
    if ($LASTEXITCODE -ne 0) { throw "Falha ao aplicar $migration. Confira a mensagem do PostgreSQL." }
}
```

Nesse caso, execute o backend e o frontend na própria máquina com Node.js 24. Em um terminal, rode `npm.cmd ci` e `npm.cmd run dev` dentro de `backend/`. Em outro terminal, repita os comandos dentro de `frontend/`. Se precisar criar o primeiro administrador, use as variáveis do [README](../README.md#contas-e-telas-da-sprint-3) e execute `npm.cmd run bootstrap:admin` dentro de `backend/`.

## 2. Início, login e cadastro

| Passo | Resultado esperado |
| --- | --- |
| Abra o Início em uma janela privativa. | A apresentação do GreenER abre sem sessão e mostra **Entrar ou criar conta**. |
| Clique em **Serviços** no menu ou abra [Relatórios](http://localhost:5173/relatorios) pelo endereço direto. | A tela de acesso abre. Depois de entrar ou criar uma conta, o site volta à página solicitada. |
| Alterne entre **Entrar** e **Cadastrar**. | Os dois formulários usam a mesma rota e o seletor mantém a posição. **Esqueci minha senha** aparece ao lado do campo de senha no login. |
| No cadastro, preencha duas senhas diferentes de pelo menos 8 caracteres e tente criar a conta. Depois corrija a confirmação e envie novamente. | A divergência aparece junto à confirmação e impede o envio. Com os dados válidos, a conta é criada como **Visualizador** e a sessão é aberta. |
| Use **Sair** e tente abrir uma página protegida. | O site volta a pedir login ou cadastro. |
| Como visualizador, abra [Configuração do projeto](http://localhost:5173/configuracao) diretamente. | O site redireciona para a Visão Geral. |

Para testar a recuperação por e-mail, configure o SMTP conforme o [README](../README.md#contas-e-telas-da-sprint-3) e use um endereço que você possa consultar. Solicite o link em **Esqueci minha senha**, redefina a senha e entre com a nova. Tente reutilizar o mesmo link. Ele deve ser recusado após o primeiro uso.

## 3. Visão Geral

1. Abra a [Visão Geral](http://localhost:5173/visao-geral). Alterne entre **Energia estimada** e **Emissões estimadas**. O gráfico deve acompanhar a métrica selecionada. A última coleta aparece quando há amostras no período.
2. Em **Novo painel**, selecione o modelo **Saúde dos serviços**. Confira que **Status dos serviços** e **Últimas coletas** mostram todas as linhas na página, sem barras internas.
3. Entre em **Personalizar painel**, selecione a categoria **Gráficos**, adicione um widget e altere sua ordem. A tela deve indicar **Alterações pendentes**. Clique em **Salvar painel** e recarregue para conferir a persistência.
4. Com dois painéis criados, edite um e tente selecionar o outro antes de salvar. Cancele a confirmação para manter o rascunho no painel atual.
5. No modo de acompanhamento, mude **Período** e recarregue. O painel deve voltar ao período padrão salvo.

## 4. Relatórios e PDF

1. Abra [Relatórios](http://localhost:5173/relatorios), informe um título e selecione serviços, período e métricas. Clique em **Gerar prévia**. A tela deve avançar de **Selecionar dados** para **Revisar e exportar**.
2. Na prévia, alterne entre **Linha**, **Barras** e **Tabela**. Confira o título, o período e os totais de serviços e amostras. Use **Editar seleção** para voltar com os filtros preenchidos.
3. Volte à prévia, selecione **Barras** e clique em **Exportar PDF**. Abra o arquivo baixado. Com amostras no período, os gráficos horizontais por métrica devem aparecer antes da tabela de resultados.
4. Repita a exportação nos modos **Linha** e **Tabela**. Em relatórios com mais de uma página, confira a numeração e a repetição do cabeçalho da tabela quando ela continua na página seguinte.

## 5. Perfil e Configuração

| Cenário | Resultado esperado |
| --- | --- |
| Abra o [Perfil](http://localhost:5173/perfil) e altere apenas o nome. | **Salvar alterações** habilita quando o nome muda. O novo nome aparece no resumo após salvar. |
| Altere o e-mail de uma conta de teste. | O campo **Senha atual** aparece. Uma senha incorreta impede a alteração e a senha correta permite salvar. |
| Entre como Admin, abra [Configuração](http://localhost:5173/configuracao) e mude o intervalo da **Coleta**. | A tela distingue o intervalo em uso do salvo enquanto o próximo agendamento ainda não aplicou a mudança. |
| Em **Estimativas**, altere um coeficiente e clique em **Simular cálculo**. | A prévia compara potência, energia e emissões atuais e propostas. Abra **Detalhamento do cálculo** para consultar CPU, RAM, disco e rede. |
| Altere novamente um valor depois de simular. Em seguida, simule e ative a nova proposta. | Editar invalida a prévia anterior. A ativação fica disponível após simular os valores preenchidos e aplica os coeficientes às próximas coletas. |
| Em **Usuários**, altere o papel de uma conta de teste. Depois clique em **Desvincular** e cancele a confirmação. | **Salvar papel** habilita quando o papel muda. A confirmação identifica a pessoa afetada e o cancelamento preserva o acesso. |

Em um banco novo, mudar apenas a potência máxima da CPU de **100 W para 200 W** deve levar a simulação de **51,72 W para 101,72 W**, de **0,05172 kWh para 0,10172 kWh** e de **5,172 g CO₂e para 10,172 g CO₂e**. Os valores dependem dos demais coeficientes ativos.

## 6. Conferência no navegador

Use o modo responsivo das ferramentas do navegador em **320 × 640 px**, **390 × 844 px** e em desktop. Confira se o botão **Criar conta** aparece na tela de 320 × 640 px com o formulário vazio. Na largura intermediária de **963 px**, abra o menu compacto e navegue até a Visão Geral. O menu e as listas de status e coletas devem aparecer sem barras de rolagem internas.

## 7. Verificações automatizadas

Com Node.js 24, execute o build e o lint de cada pacote a partir da raiz.

```powershell
npm.cmd --prefix frontend ci
npm.cmd --prefix frontend run build
npm.cmd --prefix frontend run lint

npm.cmd --prefix backend ci
npm.cmd --prefix backend run build
npm.cmd --prefix backend run lint
```

Para rodar a suíte completa do backend, use um PostgreSQL descartável. O usuário da URL de teste precisa poder criar bancos. A suíte cria bancos separados para os testes de integração.

```powershell
docker run --rm -d --name greener-qa-db -p 127.0.0.1:55432:5432 -e POSTGRES_USER=greener_test -e POSTGRES_PASSWORD=greener_test -e POSTGRES_DB=greener_test postgres:17-bookworm
docker exec greener-qa-db pg_isready -U greener_test -d greener_test
```

Quando o PostgreSQL aceitar conexões, rode a suíte.

```powershell
$env:TEST_DATABASE_URL = 'postgresql://greener_test:greener_test@127.0.0.1:55432/greener_test'
npm.cmd --prefix backend test
Remove-Item Env:TEST_DATABASE_URL
docker stop greener-qa-db
```

Para encerrar a aplicação local preservando os dados do Compose, use `docker compose down`.
