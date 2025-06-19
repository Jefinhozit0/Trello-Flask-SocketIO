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
            });
        });
    });

    const socket = io();

    // Ouve por eventos de renomeação na página do quadro e no dashboard
    socket.on('board_renamed', function(data) {
        const { board_id, new_name } = data;
        const mainTitle = document.getElementById('main-board-title');
        if (document.body.dataset.boardId == board_id && mainTitle) {
            mainTitle.textContent = new_name;
        }
    });

    socket.on('board_renamed_dashboard', function(data) {
        const { board_id, new_name } = data;
        const titleHeader = document.getElementById(`board-title-${board_id}`);
        if (titleHeader) {
            titleHeader.textContent = new_name;
        }
    });
});