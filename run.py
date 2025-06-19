from project import create_app, socketio, db
from project.models import User, Board, Task # Importe seus modelos

app = create_app()

# --- NOVO COMANDO CLI ---
@app.cli.command("init-db")
def init_db_command():
    """Cria as tabelas do banco de dados."""
    with app.app_context():
        db.create_all()
    print("Banco de dados inicializado e tabelas criadas.")


if __name__ == '__main__':
    socketio.run(app, debug=True)