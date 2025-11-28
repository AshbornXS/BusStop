document.addEventListener('DOMContentLoaded', function() {

    // Referências aos elementos do DOM
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const resetError = document.getElementById('resetError');
    const toggleButtons = document.querySelectorAll('.password-toggle-btn');

    /**
     * Renderiza uma notificação visual temporária na tela (Toast).
     * @param {string} message - Conteúdo da mensagem.
     * @param {string} type - Categoria da mensagem ('success' ou 'error').
     */
    function showToastNotification(message, type = 'success') {
        // Limpeza de notificações anteriores
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        
        const iconClass = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark';
        
        toast.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);

        // Timer para remoção automática
        setTimeout(() => {
            toast.remove();
        }, 3000); 
    }

    // Configuração de alternância de visibilidade de senha
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetInputId = this.dataset.target;
            const targetInput = document.getElementById(targetInputId);
            const icon = this.querySelector('i');

            if (targetInput && icon) {
                if (targetInput.type === 'password') {
                    targetInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    targetInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    });

    // Handler de submissão do formulário de redefinição
    resetPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        resetError.textContent = ''; 

        const novaSenha = newPasswordInput.value;
        const confirmarSenha = confirmPasswordInput.value;

        // Validações de entrada
        if (novaSenha === '' || confirmarSenha === '') {
            resetError.textContent = 'Por favor, preencha todos os campos.';
            showToastNotification('Por favor, preencha todos os campos.', 'error');
            return;
        }

        if (novaSenha.length < 4) {
             resetError.textContent = 'A senha deve ter no mínimo 4 caracteres.';
             showToastNotification('A senha deve ter no mínimo 4 caracteres.', 'error');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            resetError.textContent = 'As senhas não coincidem.';
            showToastNotification('As senhas não coincidem.', 'error');
            return;
        }

        // Simulação de sucesso (Front-end only por enquanto)
        showToastNotification('Senha alterada com sucesso!', 'success');
        resetPasswordForm.reset();
        
        // Redirecionamento automático
        setTimeout(() => {
            window.location.href = '../loginCadastro/loginCadastro.html#login';
        }, 2000);
    });
});