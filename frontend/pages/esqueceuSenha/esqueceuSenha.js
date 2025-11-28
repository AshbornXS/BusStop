document.addEventListener('DOMContentLoaded', function() {

    /**
     * Exibe notificações flutuantes na interface do usuário
     * Utiliza estilos definidos em global.css
     * @param {string} message - Texto da mensagem
     * @param {string} type - Tipo de alerta: 'success' (padrão) ou 'error'
     */
    function showToastNotification(message, type = 'success') {
        // Limpeza de notificações anteriores
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        
        // Configuração visual baseada no tipo de alerta
        if (type === 'error') {
            toast.style.backgroundColor = '#dc3545'; 
            toast.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <span>${message}</span>`;
        } else {
            toast.style.backgroundColor = '#28a745'; 
            toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
        }
        
        document.body.appendChild(toast);

        // Timer de segurança para remoção do elemento DOM
        setTimeout(() => {
            if (toast) {
                toast.remove();
            }
        }, 4000); 
    }

    // --- Limites de input definidos diretamente no HTML ---

    // Gerenciamento do envio do formulário de recuperação
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email-forgot').value;
            
            if (email) {
                // Feedback visual de sucesso para o usuário
                const message = `Se o e-mail ${email} estiver cadastrado, você receberá um link em breve.`;
                showToastNotification(message, 'success');
                
                this.reset();
            } else {
                // Tratamento de erro para campo vazio
                showToastNotification('Por favor, digite seu e-mail.', 'error');
            }
        });
    }
});