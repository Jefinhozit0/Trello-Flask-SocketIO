document.addEventListener('DOMContentLoaded', function() {
    // Adiciona um listener para todos os botões 'Editar'
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const boardId = this.dataset.boardId;
            const boardCard = document.getElementById(`board-card-${boardId}`);
            const titleView = boardCard.querySelector('.board-title-view');
            const editForm = boardCard.querySelector('.edit-board-form');

            if (titleView && editForm) {
                titleView.style.display = 'none';
                editForm.style.display = 'flex';
            }
        });
    });

    // Adiciona um listener para todos os formulários de edição
    document.querySelectorAll('.edit-board-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const boardId = this.dataset.boardId;
            const newNameInput = this.querySelector('input[name="new_board_name"]');
            const newName = newNameInput.value;

            fetch(`/api/board/${boardId}/rename`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const boardCard = document.getElementById(`board-card-${boardId}`);
                    const titleView = boardCard.querySelector('.board-title-view');
                    const titleHeader = titleView.querySelector('h3');
                    
                    if (titleHeader) titleHeader.textContent = newName;
                    
                    titleView.style.display = 'block';
                    this.style.display = 'none';
                } else {
                    alert('Erro ao renomear o quadro: ' + (data.message || 'Erro desconhecido'));
                }
            }).catch(err => {
                console.error("Fetch error:", err);
                alert("Ocorreu um erro de comunicação.");
            });
        });
    });

    // --- Lógica de Socket.IO para o Dashboard ---
    const socket = io();

    // Ouve por eventos de renomeação de quadros na página do dashboard
    socket.on('board_renamed', function(data) {
        const { board_id, new_name } = data;
        const titleHeader = document.querySelector(`#board-card-${board_id} .board-title-view h3`);
        if (titleHeader) {
            titleHeader.textContent = new_name;
        }
    });
});