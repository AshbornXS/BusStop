// Configuração da API Backend
const API_URL = 'https://busstop-b9ov.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
      // Referências aos elementos DOM principais
      const renewalFormContainer = document.getElementById('renewal-form-container');
      const loggedOutMessage = document.getElementById('logged-out-message');
      const renewalBlockedMessage = document.getElementById('renewal-blocked-message');
      
      const renewalForm = document.getElementById('renewal-form');
      const submitBtn = document.getElementById('submit-btn');
      const fileInputs = renewalForm.querySelectorAll('input[type="file"]');
      const dataMissingWarning = document.getElementById('data-missing-warning');
      
      let currentUser = null; 
      let allDataFilled = false; 
      let allFilesSelected = false; 

      /**
       * Geração de headers para requisições autenticadas (sem Content-Type fixo para FormData)
       */
      function getAuthHeader() {
        const token = localStorage.getItem('token');
        return {
          'Authorization': `Bearer ${token}`
        };
      }

      /**
       * Exibição de notificações flutuantes (Toast)
       */
      function showToastNotification(message, iconClass = 'fa-solid fa-circle-check') {
          const existingToast = document.querySelector('.toast-notification');
          if (existingToast) {
              existingToast.remove();
          }

          const toast = document.createElement('div');
          toast.className = 'toast-notification';
          toast.innerHTML = `
              <i class="${iconClass}"></i>
              <span>${message}</span>
          `;
          
          document.body.appendChild(toast);
      }

      /**
       * Verificação de validade da carteirinha baseada no estado do usuário
       */
      function checkCardValidity(isExpired, role) {
          if (role === 'admin') return 'N/A';
          
          if (isExpired === true) {
            return 'Expirado';
          } else if (isExpired === false) {
            return 'Ativo';
          }
          
          return 'Pendente'; 
      }


      /**
       * Configuração inicial da página baseada na autenticação e status do usuário
       */
      function setupPageForUser() {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('currentUser');

        if (token && storedUser) {
          try {
            currentUser = JSON.parse(storedUser);
          } catch(e) {
            console.error("Erro ao ler dados do usuário.", e);
            currentUser = null;
          }
        }

        if (currentUser) {
          const status = checkCardValidity(currentUser.isExpired, currentUser.role);

          if (status === 'Ativo') {
              if(renewalFormContainer) renewalFormContainer.style.display = 'none';
              if(loggedOutMessage) loggedOutMessage.style.display = 'none';
              if(renewalBlockedMessage) renewalBlockedMessage.style.display = 'block';
              
              const validityText = document.getElementById('blocked-validity-text');
              if (validityText) {
                  validityText.textContent = `Sua carteirinha está ativa. (API V1)`;
              }

          } else {
              if(renewalFormContainer) renewalFormContainer.style.display = 'block';
              if(loggedOutMessage) loggedOutMessage.style.display = 'none';
              if(renewalBlockedMessage) renewalBlockedMessage.style.display = 'none';
              
              populateUserData(currentUser);
              
              allDataFilled = checkAllDataFilled(currentUser);
              checkFormValidity();
          }

        } else {
          if(renewalFormContainer) renewalFormContainer.style.display = 'none';
          if(loggedOutMessage) loggedOutMessage.style.display = 'block';
          if(renewalBlockedMessage) renewalBlockedMessage.style.display = 'none';
        }
      }

      /**
       * Preenchimento dos campos do formulário com dados da API
       */
      function populateUserData(userData) {
        document.getElementById('nome').value = userData.name || '';
        document.querySelector('input[type="email"]').value = userData.email || '';
        
        document.getElementById('cpf').value = userData.CPF || '';
        document.getElementById('telefone').value = userData.phone || '';
        document.getElementById('cep').value = userData.CEP || '';
        document.getElementById('endereco').value = userData.street || '';
        document.getElementById('bairro').value = userData.neighborhood || '';
        document.getElementById('numero').value = userData.number || '';
        document.getElementById('cidade').value = userData.city || '';
        document.getElementById('estado').value = userData.state || '';
        document.getElementById('carteirinha').value = userData.id || ''; 
        document.getElementById('complemento').value = userData.complement || '';
      }

      /**
       * Validação de preenchimento de todos os campos obrigatórios do perfil
       */
      function checkAllDataFilled(user) {
         const requiredFields = ['name', 'CPF', 'phone', 'CEP', 'street', 'neighborhood', 'number', 'city', 'state'];
         
         for (const field of requiredFields) {
            if (!user[field] || user[field].trim() === '' || user[field].trim() === '+55') {
                return false; 
            }
         }
         return true; 
      }


      // Configuração de inputs de arquivo (validação de tipo e tamanho)
      fileInputs.forEach(input => {
        input.addEventListener('change', function() {
          const display = document.querySelector(`.file-name-display[data-for="${this.id}"]`);
          const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
          const file = this.files[0];

          if (file) {
            if (allowedTypes.includes(file.type)) {
                const MAX_SIZE = 16 * 1024 * 1024; 
                if (file.size > MAX_SIZE) {
                    showToastNotification('Arquivo muito grande! (Máx: 16MB)', 'fa-solid fa-triangle-exclamation');
                    this.value = ''; 
                    display.textContent = 'Arquivo muito grande. Tente novamente.';
                    display.style.color = '#FE0026';
                } else {
                    display.textContent = file.name;
                    display.style.color = ''; 
                }
            } else {
                showToastNotification('Arquivo inválido! (Use JPG, PNG ou PDF)', 'fa-solid fa-triangle-exclamation');
                this.value = ''; 
                display.textContent = 'Arquivo inválido. Tente novamente.';
                display.style.color = '#FE0026';
            }
          } else {
            display.textContent = 'Nenhum arquivo selecionado';
            display.style.color = '';
          }
           checkFormValidity();
        });
      });
      
      /**
       * Verificação de validade geral do formulário (Dados + Arquivos)
       */
      function checkFormValidity() {
        allFilesSelected = true;
        fileInputs.forEach(input => {
          if (input.files.length === 0) {
            allFilesSelected = false;
          }
        });

        if (allDataFilled && allFilesSelected) {
            submitBtn.disabled = false;
            dataMissingWarning.style.display = 'none';
        } else {
            submitBtn.disabled = true;
            if (!allDataFilled) {
                dataMissingWarning.innerHTML = 'Você precisa completar seu perfil para renovar. <a href="../perfil/perfil.html">Ir para o perfil</a>';
                dataMissingWarning.style.display = 'block';
            } else if (!allFilesSelected) {
                 dataMissingWarning.textContent = 'Por favor, anexe os dois documentos necessários.';
                 dataMissingWarning.style.display = 'block';
            }
        }
      }

      /**
       * Handler de envio do formulário de renovação (Uploads sequenciais)
       */
      renewalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        showToastNotification('Enviando arquivos. Isso pode levar um momento...', 'fa-solid fa-spinner fa-spin');

        const declaracaoFile = document.getElementById('declaracao').files[0];
        const comprovanteFile = document.getElementById('comprovante').files[0];

        try {
            // Upload do documento 1
            const formDataDeclaracao = new FormData();
            formDataDeclaracao.append('document', declaracaoFile); 

            const res1 = await fetch(`${API_URL}/files/upload`, {
                method: 'POST',
                headers: getAuthHeader(), 
                body: formDataDeclaracao
            });

            if (!res1.ok) {
                const err = await res1.json();
                throw new Error(err.message || 'Erro ao enviar a declaração.');
            }

            // Upload do documento 2
            const formDataComprovante = new FormData();
            formDataComprovante.append('document', comprovanteFile);

            const res2 = await fetch(`${API_URL}/files/upload`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: formDataComprovante
            });

            if (!res2.ok) {
                 const err = await res2.json();
                throw new Error(err.message || 'Erro ao enviar o comprovante.');
            }
            
            showToastNotification('Documentos enviados para análise!', 'fa-solid fa-file-arrow-up');
            
            renewalForm.reset();
            fileInputs.forEach(input => {
                const display = document.querySelector(`.file-name-display[data-for="${input.id}"]`);
                display.textContent = 'Nenhum arquivo selecionado';
                display.style.color = '';
            });
            
            if (currentUser) {
                populateUserData(currentUser);
            }
            checkFormValidity();

        } catch (error) {
            console.error("Erro no envio:", error);
            showToastNotification(error.message, 'fa-solid fa-triangle-exclamation');
        } finally {
            submitBtn.textContent = 'Enviar para Renovação';
            checkFormValidity(); 
        }
      });

      // Inicialização da página
      setupPageForUser();
});