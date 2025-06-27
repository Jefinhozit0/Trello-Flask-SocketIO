# Plataforma de Gestão de Projetos Colaborativa em Tempo Real

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-blue?logo=python&logoColor=white" alt="Python Version">
  <img src="https://img.shields.io/badge/Flask-3.0+-black?logo=flask&logoColor=white" alt="Flask Version">
  <img src="https://img.shields.io/badge/Socket.IO-4.7-black?logo=socketdotio&logoColor=white" alt="Socket.IO">
  <img src="https://img.shields.io/badge/Deployed%20on-Render-46E3B7?logo=render" alt="Deployed on Render">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
</p>

<p align="center">
  Um clone completo da ferramenta Trello, desenvolvido com Flask e JavaScript, focado em colaboração e atualizações instantâneas com WebSockets.
</p>

<p align="center">
  <a href="https://trello-jefferson.onrender.com/"><strong>➥ Ver Aplicação Ao Vivo</strong></a>
</p>

---

## 🚀 Funcionalidades Principais

Este projeto vai além de um simples CRUD, implementando funcionalidades complexas para criar uma experiência de usuário rica e moderna.

* **👥 Sistema de Autenticação Completo:**
    * Cadastro de novos usuários com e-mail e senha.
    * Login seguro com sessões persistentes (`Flask-Login`).
    * Hashing de senhas para segurança (`Werkzeug`).

* **🗂️ Gestão de Quadros (Boards) e Times:**
    * Criação, renomeação e exclusão de múltiplos quadros por usuário.
    * **Sistema de Convites:** O dono de um quadro pode convidar outros usuários cadastrados por e-mail para colaborar.
    * **Controle de Permissão:** Apenas o dono do quadro pode gerenciá-lo (renomear, excluir, convidar).

* **📝 Gestão Completa de Tarefas (Cards):**
    * Criação e exclusão de tarefas dentro de colunas específicas.
    * **Modal de Edição:** Clique em uma tarefa para abrir um modal e editar seu título e descrição.
    * **Atribuição de Tarefas:** Designe tarefas para membros específicos do quadro através de um menu dropdown no modal.

* **✨ A Mágica do Tempo Real com WebSockets:**
    * Quando um usuário move uma tarefa, a mudança é refletida **instantaneamente** na tela de todos os outros membros do time.
    * Novas tarefas, edições de título, atribuições e exclusões também aparecem em tempo real para todos, sem a necessidade de recarregar a página.

## 🛠️ Tecnologias Utilizadas

<table align="center">
  <tr>
    <td align="center"><strong>Back-end</strong></td>
    <td align="center"><strong>Front-end</strong></td>
    <td align="center"><strong>Banco de Dados & Deploy</strong></td>
  </tr>
  <tr>
    <td>
      • Python<br>
      • Flask<br>
      • Flask-SocketIO<br>
      • Flask-SQLAlchemy<br>
      • Flask-Login<br>
      • Gunicorn & Eventlet
    </td>
    <td>
      • HTML5 & CSS3<br>
      • JavaScript (ES6+)<br>
      • Fetch API<br>
      • Socket.IO Client<br>
      • Sortable.js<br>
      • Jinja2
    </td>
    <td>
      • PostgreSQL (Produção)<br>
      • SQLite (Desenvolvimento)<br>
      • Render (Hospedagem)
    </td>
  </tr>
</table>

## 🧠 Desafios Técnicos e Aprendizados

* **Arquitetura de Banco de Dados:** Modelar a relação **Muitos-para-Muitos** entre Usuários e Quadros para permitir a colaboração em times.
* **Comunicação em Tempo Real:** Implementar uma arquitetura baseada em eventos com WebSockets para sincronizar o estado da aplicação entre múltiplos clientes, usando "salas" para garantir que as atualizações sejam enviadas apenas para os usuários relevantes.
* **Deploy em Ambiente de Produção:** Migrar de SQLite para PostgreSQL e configurar um servidor WSGI (Gunicorn com worker `eventlet`) para lidar com as conexões persistentes do Socket.IO na plataforma Render.
* **Segurança:** Implementar verificações de permissão em todas as rotas para garantir que um usuário só possa modificar os quadros e tarefas aos quais ele tem acesso.

## ⚙️ Como Executar Localmente

Siga os passos abaixo para rodar o projeto na sua máquina.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/Jefinhozit0/Trello-Flask-SocketIO.git](https://github.com/Jefinhozit0/Trello-Flask-SocketIO.git)
    cd Trello-Flask-SocketIO
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
    Crie um arquivo `.env` na raiz do projeto e adicione uma chave secreta:
    ```
    SECRET_KEY='sua-chave-secreta-forte-e-aleatoria'
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

## 👨‍💻 Autor

**Jefferson**

* **GitHub:** [@Jefinhozit0](https://github.com/Jefinhozit0)
* **LinkedIn:** [Seu Perfil do LinkedIn Aqui](https://www.linkedin.com/)

---
