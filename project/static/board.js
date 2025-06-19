document.addEventListener('DOMContentLoaded', function () {
    const boardId = document.body.dataset.boardId;
    const socket = io();

    // --- Lógica do Modal ---
    const modal = document.getElementById('task-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const taskEditForm = document.getElementById('task-edit-form');
    const modalTaskId = document.getElementById('modal-task-id');
    const modalTaskTitle = document.getElementById('modal-task-title');
    const modalTaskDescription = document.getElementById('modal-task-description');
    const modalTaskAssignee = document.getElementById('modal-task-assignee');
    const deleteTaskBtn = document.getElementById('delete-task-btn');

    function openTaskModal(taskId) {
        fetch(`/api/task/${taskId}`)
            .then(response => response.json())
            .then(task => {
                modalTaskId.value = task.id;
                modalTaskTitle.value = task.title;
                modalTaskDescription.value = task.description;

                // Limpa e popula o dropdown de membros
                modalTaskAssignee.innerHTML = '<option value="None">Ninguém</option>';
                task.members.forEach(member => {
                    const option = document.createElement('option');
                    option.value = member.id;
                    option.textContent = member.username;
                    if (member.id === task.assignee_id) {
                        option.selected = true;
                    }
                    modalTaskAssignee.appendChild(option);
                });

                modal.style.display = 'flex';
            });
    }

    function closeTaskModal() {
        modal.style.display = 'none';
    }

    // Event listener para abrir o modal ao clicar em um card
    document.querySelector('.kanban-board-container').addEventListener('click', function(e) {
        const taskCard = e.target.closest('.task-card');
        if (taskCard) {
            openTaskModal(taskCard.dataset.taskId);
        }
    });

    closeModalBtn.addEventListener('click', closeTaskModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeTaskModal();
    });

    // Salvar alterações da tarefa (agora com o assignee)
    taskEditForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const taskId = modalTaskId.value;
        const data = {
            title: modalTaskTitle.value,
            description: modalTaskDescription.value,
            assignee_id: modalTaskAssignee.value
        };
        fetch(`/api/task/${taskId}/update`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(() => closeTaskModal());
    });

    // Deletar tarefa
    deleteTaskBtn.addEventListener('click', function() {
        const taskId = modalTaskId.value;
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            fetch(`/api/task/${taskId}/delete`, { method: 'POST' })
                .then(() => closeTaskModal());
        }
    });

    // --- Lógica do Socket.IO ---
    socket.on('connect', () => {
        if (boardId) socket.emit('join', { room: `board-${boardId}` });
    });

    socket.on('task_created', (data) => {
        const { task_id, title, status, assignee } = data;
        const targetColumnList = document.querySelector(`.task-list[data-status="${status}"]`);
        
        // Só cria o card se ele ainda não existir na tela
        if (targetColumnList && !document.querySelector(`[data-task-id="${task_id}"]`)) {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.dataset.taskId = task_id;
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'task-card-title';
            titleDiv.textContent = title;
            
            const assigneeDiv = document.createElement('div');
            assigneeDiv.className = 'task-card-assignee';
            assigneeDiv.id = `assignee-for-task-${task_id}`;
            if (assignee) {
                assigneeDiv.textContent = `👤 ${assignee.username}`;
            } else {
                assigneeDiv.style.display = 'none';
            }
            
            taskCard.appendChild(titleDiv);
            taskCard.appendChild(assigneeDiv);
            targetColumnList.appendChild(taskCard);
        }
    });
    
    socket.on('task_updated', (data) => {
        const { task_id, new_status } = data;
        const taskCard = document.querySelector(`[data-task-id="${task_id}"]`);
        const targetColumnList = document.querySelector(`.task-list[data-status="${new_status}"]`);
        if (taskCard && targetColumnList) {
            targetColumnList.appendChild(taskCard);
        }
    });
    
    socket.on('task_modified', (data) => {
        const { task_id, new_title, assignee } = data;
        const taskCard = document.querySelector(`[data-task-id="${task_id}"]`);
        if (taskCard) {
            taskCard.querySelector('.task-card-title').textContent = new_title;
            const assigneeDiv = taskCard.querySelector('.task-card-assignee');
            if (assignee) {
                assigneeDiv.textContent = `👤 ${assignee.username}`;
                assigneeDiv.style.display = 'block';
            } else {
                assigneeDiv.textContent = '';
                assigneeDiv.style.display = 'none';
            }
        }
    });

    socket.on('task_deleted', (data) => {
        const { task_id } = data;
        const taskCard = document.querySelector(`[data-task-id="${task_id}"]`);
        if (taskCard) {
            taskCard.remove();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (boardId) socket.emit('leave', { room: `board-${boardId}` });
    });

    // --- Lógica do Drag and Drop (SortableJS) ---
    document.querySelectorAll('.task-list').forEach(column => {
        new Sortable(column, {
            group: 'kanban', 
            animation: 150, 
            ghostClass: 'task-ghost',
            onEnd: (evt) => {
                updateTaskStatus(evt.item.dataset.taskId, evt.to.dataset.status);
            }
        });
    });
});

function updateTaskStatus(taskId, newStatus) {
    fetch(`/update-task-status/${taskId}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: newStatus })
    }).then(response => response.json()).then(data => {
        if (!data.success) {
            alert('Não foi possível salvar a alteração.');
            window.location.reload();
        }
    });
}