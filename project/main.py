from flask import Blueprint, render_template, request, flash, redirect, url_for, abort, jsonify
from flask_login import login_required, current_user
from . import socketio
from flask_socketio import join_room, leave_room
from .models import db, Board, Task, User

main = Blueprint('main', __name__)

@main.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return redirect(url_for('auth.login'))

@main.route('/dashboard')
@login_required
def dashboard():
    # Esta consulta agora busca tanto os quadros do usuário quanto os compartilhados com ele
    user_boards = current_user.boards 
    return render_template('main/dashboard.html', user=current_user, boards=user_boards)

@main.route('/create-board', methods=['POST'])
@login_required
def create_board():
    board_name = request.form.get('board_name')
    if not board_name:
        flash('O nome do quadro não pode ser vazio.', 'error')
    else:
        new_board = Board(name=board_name, owner=current_user)
        new_board.members.append(current_user) # O criador já vira membro
        db.session.add(new_board)
        db.session.commit()
        flash('Quadro criado com sucesso!', 'success')
    return redirect(url_for('main.dashboard'))

@main.route('/board/<int:board_id>')
@login_required
def view_board(board_id):
    board = Board.query.get_or_404(board_id)
    # Segurança: usuário só pode ver se for membro
    if current_user not in board.members:
        abort(403)
    tasks = {
        'pending': [task for task in board.tasks if task.status == 'pending'],
        'inprogress': [task for task in board.tasks if task.status == 'inprogress'],
        'completed': [task for task in board.tasks if task.status == 'completed']
    }
    return render_template('main/board.html', board=board, tasks=tasks)

# --- NOVAS ROTAS DE GERENCIAMENTO ---

@main.route('/board/<int:board_id>/delete', methods=['POST'])
@login_required
def delete_board(board_id):
    board = Board.query.get_or_404(board_id)
    # Segurança: Apenas o dono pode excluir
    if board.user_id != current_user.id:
        abort(403)
    db.session.delete(board)
    db.session.commit()
    flash('Quadro excluído com sucesso!', 'success')
    return redirect(url_for('main.dashboard'))

@main.route('/api/board/<int:board_id>/rename', methods=['POST'])
@login_required
def rename_board(board_id):
    board = Board.query.get_or_404(board_id)
    # Segurança: Apenas o dono pode renomear
    if board.user_id != current_user.id:
        abort(403)
    data = request.get_json()
    new_name = data.get('name')
    if not new_name:
        return jsonify({'success': False, 'message': 'O nome não pode ser vazio.'}), 400
    board.name = new_name
    db.session.commit()
    event_data = {'board_id': board.id, 'new_name': new_name}
    socketio.emit('board_renamed', event_data, room=f'board-{board.id}')
    socketio.emit('board_renamed_dashboard', event_data)
    return jsonify({'success': True, 'message': 'Quadro renomeado.'})

@main.route('/board/<int:board_id>/add_member', methods=['POST'])
@login_required
def add_member(board_id):
    board = Board.query.get_or_404(board_id)
    # Segurança: Apenas o dono pode convidar
    if current_user.id != board.user_id:
        abort(403)
    email = request.form.get('email')
    user_to_add = User.query.filter_by(email=email).first()
    if not user_to_add:
        flash('Usuário não encontrado com este email.', 'error')
    elif user_to_add in board.members:
        flash('Este usuário já é membro do quadro.', 'warning')
    else:
        board.members.append(user_to_add)
        db.session.commit()
        flash(f'{user_to_add.username} foi adicionado ao quadro!', 'success')
    return redirect(url_for('main.view_board', board_id=board.id))

# ... (O resto das rotas de tarefas e eventos de socket.io permanecem os mesmos) ...

# --- ROTAS PARA GERENCIAR UMA TAREFA ESPECÍFICA ---

@main.route('/api/task/<int:task_id>')
@login_required
def get_task_details(task_id):
    task = Task.query.get_or_404(task_id)
    if current_user not in task.board.members:
        abort(403)
    
    members = [{'id': member.id, 'username': member.username} for member in task.board.members]
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description or '',
        'assignee_id': task.assignee_id,
        'members': members
    })

@main.route('/api/task/<int:task_id>/update', methods=['POST'])
@login_required
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    if current_user not in task.board.members:
        abort(403)
    
    data = request.get_json()
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    
    assignee_id = data.get('assignee_id')
    if assignee_id and str(assignee_id).lower() != 'none':
        task.assignee_id = int(assignee_id)
    else:
        task.assignee_id = None
        
    db.session.commit()
    
    assignee_info = {'id': task.assignee.id, 'username': task.assignee.username} if task.assignee else None
    
    event_data = {'task_id': task.id, 'new_title': task.title, 'assignee': assignee_info}
    socketio.emit('task_modified', event_data, room=f'board-{task.board_id}')
    
    return jsonify({'success': True})

@main.route('/api/task/<int:task_id>/delete', methods=['POST'])
@login_required
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    if current_user not in task.board.members:
        abort(403)
        
    board_id = task.board_id
    db.session.delete(task)
    db.session.commit()
    
    event_data = {'task_id': task_id}
    socketio.emit('task_deleted', event_data, room=f'board-{board_id}')
    
    return jsonify({'success': True})

# --- EVENTOS DO SOCKET.IO ---

@socketio.on('join')
def on_join(data):
    if current_user.is_authenticated:
        username = current_user.username
        room = data['room']
        join_room(room)
        print(f'Usuário {username} entrou na sala {room}')

@socketio.on('leave')
def on_leave(data):
    if current_user.is_authenticated:
        username = current_user.username
        room = data['room']
        leave_room(room)
        print(f'Usuário {username} saiu da sala {room}')