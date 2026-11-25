# ETISC

## Como rodar o projeto:

### 1° Passo: possuir o node js instalado em sua máquina (comando "node -v" no terminal para verificar)

### 2° Passo: digitar "npm install" no diretório raiz do projeto, para instalar as dependências do projeto

### 3° Passo: após instalar as dependências, digitar o comando "node ./backend/server.js", para rodar o servidor do projeto

### 4° Passo: abrir o frontend do projeto, via live server ou abrindo o arquivo "index.html" no navegador

## Rotas da API:

### Visíveis por URL

#### /empresas (MÉTODO GET) -> Retorna todas as empresas do sistema 

#### /vagas (MÉTODO GET) -> Retorna todas as vagas do sistema 

### Internas do backend

#### /empresas/cadastro (MÉTODO POST) -> Cria uma empresa no banco de dados do servidor

#### /empresas/login (MÉTODO POST) -> Permite a empresa manipular suas vagas, se os dados estiverem de acordo com os dados cadastrados

#### /vagas (MÉTODO POST) -> Cria uma vaga no banco de dados do servidor

#### /vagas/:id (MÉTODO PUT) -> Atualiza uma vaga já existente

#### /vagas/:id (MÉTODO DELETE) -> Deleta uma vaga já existente