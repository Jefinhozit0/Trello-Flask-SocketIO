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
    const deleteTaskBtn = document.getElementById('delete-task-btn');

    function openTaskModal(taskId) {
        fetch(`/api/task/${taskId}`)
            .then(response => response.json())
            .then(task => {
                modalTaskId.value = task.id;
                modalTaskTitle.value = task.title;
                modalTaskDescription.value = task.description;
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
            const taskId = taskCard.dataset.taskId;
            openTaskModal(taskId);
        }
    });

    closeModalBtn.addEventListener('click', closeTaskModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeTaskModal();
    });

    // Salvar alterações da tarefa
    taskEditForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const taskId = modalTaskId.value;
        const data = {
            title: modalTaskTitle.value,
            description: modalTaskDescription.value
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
        const { task_id, title, status } = data;
        const targetColumnList = document.querySelector(`.task-list[data-status="${status}"]`);
        if (targetColumnList && !document.querySelector(`[data-task-id="${task_id}"]`)) {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.dataset.taskId = task_id;
            taskCard.textContent = title;
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
        const { task_id, new_title } = data;
        const taskCard = document.querySelector(`[data-task-id="${task_id}"]`);
        if (taskCard) {
            taskCard.textContent = new_title;
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
            group: 'kanban', animation: 150, ghostClass: 'task-ghost',
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