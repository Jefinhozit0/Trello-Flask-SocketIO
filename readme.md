# Plataforma de Gestão de Projetos Colaborativa (Trello Clone)

![Badge de Licença](https://img.shields.io/badge/license-MIT-blue.svg)

Uma aplicação web full-stack completa, inspirada no Trello, que permite a gestão de projetos de forma colaborativa e em tempo real. Desenvolvida com Flask e JavaScript, a plataforma inclui autenticação de usuários, criação de quadros, sistema de convites e atualizações instantâneas via WebSockets.

## Demonstração Visual

**DICA:** Grave um GIF rápido da tela mostrando o fluxo completo: login, criação de um quadro, convite de um segundo usuário e a movimentação de tarefas atualizando em tempo real para ambos. Isso é extremamente poderoso para um portfólio.

![GIF da Aplicação](caminho/para/seu/gif_ou_imagem.gif)

## Funcionalidades Principais

-   **Autenticação de Usuários:** Sistema completo e seguro de cadastro, login e logout (`Flask-Login`).
-   **Dashboard Pessoal:** Cada usuário possui um painel que exibe todos os quadros que ele criou e também os quadros para os quais foi convidado.
-   **Gerenciamento de Quadros (Boards):**
    -   Criação de múltiplos quadros para diferentes projetos.
    -   Edição do nome do quadro (com atualização em tempo real para membros).
    -   Exclusão de quadros (ação restrita apenas ao dono).
-   **Sistema de Colaboração por Times:**
    -   O dono de um quadro pode convidar outros usuários cadastrados por e-mail.
    -   Membros convidados podem visualizar e interagir com as tarefas do quadro.
-   **Gestão de Tarefas (Cards):**
    -   Criação de tarefas dentro de colunas específicas ("Pendente", "Em Andamento", "Concluída").
    -   Edição de título e descrição das tarefas através de um modal interativo.
    -   Exclusão de tarefas.
-   **✨ Atualizações em Tempo Real (WebSockets):**
    -   Quando um usuário move uma tarefa, a mudança é refletida **instantaneamente** na tela de todos os outros membros que estão visualizando o mesmo quadro, sem a necessidade de recarregar a página.
    -   Novas tarefas, edições e exclusões também aparecem em tempo real para todos os colaboradores.

## Tecnologias Utilizadas

#### **Back-end**

-   **Python 3**
-   **Flask:** Microframework web para a API e rotas.
-   **Flask-SocketIO:** Para comunicação em tempo real com WebSockets.
-   **Flask-SQLAlchemy:** ORM para interação com o banco de dados.
-   **Flask-Login:** Gerenciamento de sessões de usuário.
-   **Gunicorn / Eventlet:** Servidor de aplicação WSGI para produção.

#### **Front-end**

-   **HTML5 / CSS3**
-   **JavaScript (ES6+):** Manipulação do DOM, requisições (`fetch`) e lógica do cliente Socket.IO.
-   **Jinja2:** Engine de templates para renderização dinâmica.
-   **Sortable.js:** Biblioteca para a funcionalidade de arrastar e soltar.

#### **Banco de Dados**

-   **SQLite:** Para desenvolvimento local.
-   **PostgreSQL:** Para o ambiente de produção.

## Como Executar Localmente

1.  **Clone o repositório**:
    ```bash
    git clone [https://github.com/Jefinhozit0/Trello-Flask-SocketIO.git]
    cd seu-repositorio
    ```

2.  **Crie e ative um ambiente virtual:**
    ```bash
    # Windows
    python -m venv .venv
    .\.venv\Scripts\activate
    ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione sua chave secreta:
    ```
    SECRET_KEY='uma-chave-secreta-forte-e-aleatoria'
    ```

5.  **Crie o banco de dados local:**
    Execute este comando **uma vez** para criar o arquivo `db.sqlite` com todas as tabelas.
    ```bash
    flask --app run.py init-db
    ```

6.  **Inicie a aplicação:**
    ```bash
    python run.py
    ```

7.  Acesse `http://127.0.0.1:5000` no seu navegador.

## Autor

**Jefferson**

-   GitHub: [@Jefinhozit0](https://github.com/Jefinhozit0)
