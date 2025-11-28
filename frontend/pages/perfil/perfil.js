// Configuração da API Backend
const API_URL = 'https://busstop-b9ov.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
  
  // Referências aos elementos DOM principais
  const profileFormContainer = document.getElementById('logged-in-content');
  const loggedOutMessage = document.getElementById('logged-out-message');
  
  const profileForm = document.getElementById('profile-form');
  const personalMessage = document.getElementById('personal-message');
  const passwordMessage = document.getElementById('password-message');

  // Controles de edição de dados pessoais
  const editPersonalBtn = document.getElementById('edit-personal-btn');
  const savePersonalBtn = document.getElementById('save-personal-btn');
  const cancelPersonalBtn = document.getElementById('cancel-personal-btn');
  const personalInputsGrid = document.getElementById('dados-pessoais-grid');
  
  // Inputs para validação e máscara
  const telefoneInput = document.getElementById('telefone');
  const cpfInput = document.getElementById('cpf');
  const cepInput = document.getElementById('cep'); 
  const numeroInput = document.getElementById('numero'); 
  const complementoInput = document.getElementById('complemento'); 
  
  // Controles de edição de senha
  const editPasswordBtn = document.getElementById('edit-password-btn');
  const savePasswordBtn = document.getElementById('save-password-btn');
  const cancelPasswordBtn = document.getElementById('cancel-password-btn');
  const allPasswordInputs = ['senha-atual', 'nova-senha', 'confirmar-senha']; 
  
  // Elementos de status da carteirinha
  const cardStatusLine = document.getElementById('card-status-line');
  const cardStatusText = document.getElementById('card-status-text');
  const cardValidityText = document.getElementById('card-validity-text');

  // Elementos do modal de confirmação de CPF
  const cpfModal = document.getElementById('cpf-confirm-modal');
  const cpfCancelBtn = document.getElementById('cpf-modal-cancel');
  const cpfConfirmBtn = document.getElementById('cpf-modal-confirm');
  const cpfCloseBtn = document.getElementById('cpf-modal-close');

  // Estado local para reversão de edições
  let originalPersonalData = {};
  let originalPasswordData = {};

  // Geração de headers para requisições autenticadas
  function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Exibição de notificações flutuantes (Toast)
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

  // Exibição de mensagens de feedback no formulário
  function showMessage(element, text, type) {
    element.textContent = text;
    element.className = 'form-message ' + type;
    if (type === 'error' || type === 'success') {
        setTimeout(() => {
           element.className = 'form-message';
           element.textContent = '';
        }, 3000);
    }
  }

  // Validação de formato de e-mail
  function isValidEmail(email) {
      if (!email) return false;
      const parts = email.split('@');
      return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
  }

  // Controle de exibição do modal de CPF
  function openCpfModal() {
    if(cpfModal) cpfModal.style.display = 'flex';
  }
  function closeCpfModal() {
    if(cpfModal) cpfModal.style.display = 'none';
  }
  
  // Alternância de estado dos campos de dados pessoais
  function setPersonalEditMode(isEditing) {
    const personalInputs = personalInputsGrid.querySelectorAll('input:not(#cpf):not(#carteirinha):not(#email)');
    
    personalInputs.forEach(input => {
      if (['endereco', 'cidade', 'estado', 'bairro'].includes(input.id)) {
        input.disabled = true;
      } else {
        input.disabled = !isEditing;
      }
    });

    const cpfInput = document.getElementById('cpf');
    const storedUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    
    // Regra de negócio: CPF preenchido não pode ser alterado
    const cpfIsFilled = storedUser.CPF && storedUser.CPF.trim() !== '';

    if (isEditing) {
        if (cpfIsFilled) {
            cpfInput.disabled = true;
            cpfInput.title = "O CPF não pode ser alterado após ser salvo.";
        } else {
            cpfInput.disabled = false; 
            cpfInput.title = "Insira seu CPF (somente números).";
        }
    } else {
        cpfInput.disabled = true;
        cpfInput.title = "";
        if (cpfIsFilled) {
            cpfInput.title = "O CPF não pode ser alterado após ser salvo.";
        }
    }
    
    document.getElementById('cep').disabled = !isEditing;
    document.getElementById('email').disabled = !isEditing; 

    editPersonalBtn.style.display = isEditing ? 'none' : 'block';
    savePersonalBtn.style.display = isEditing ? 'block' : 'none';
    cancelPersonalBtn.style.display = isEditing ? 'block' : 'none';

    if (isEditing) {
        passwordMessage.className = 'form-message';
        personalMessage.className = 'form-message';
    }
  }
  
  // Alternância de estado dos campos de senha
  function setPasswordEditMode(isEditing) {
    allPasswordInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.disabled = !isEditing;
            if (!isEditing) input.value = '';
        }
    });
    
    editPasswordBtn.style.display = isEditing ? 'none' : 'block';
    savePasswordBtn.style.display = isEditing ? 'block' : 'none';
    cancelPasswordBtn.style.display = isEditing ? 'block' : 'none';

    if (isEditing) {
        personalMessage.className = 'form-message';
        passwordMessage.className = 'form-message';
    }
  }

  // Carregamento inicial e preenchimento dos campos com dados do usuário
  function setPersonalData() {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('currentUser');

    if (token && storedUserData) {
      if (profileFormContainer) profileFormContainer.style.display = 'block';
      if (loggedOutMessage) loggedOutMessage.style.display = 'none';

      let userData;
      try {
          userData = JSON.parse(storedUserData);
      } catch (e) {
          console.error("Erro ao fazer parse dos dados do usuário:", e);
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          window.location.reload();
          return;
      }
      
      // Mapeamento de dados da API para o formulário
      document.getElementById('balance-amount').value = `R$ ${userData.saldo ? userData.saldo.toFixed(2).replace('.', ',') : '0,00'}`;
      document.getElementById('nome').value = userData.name || ''; 
      document.getElementById('email').value = userData.email || '';
      
      document.getElementById('cpf').value = (userData.CPF) 
          ? userData.CPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') 
          : ''; 
          
      document.getElementById('telefone').value = userData.phone || '';
      
      document.getElementById('cep').value = (userData.CEP)
          ? userData.CEP.replace(/(\d{5})(\d{3})/, '$1-$2')
          : '';
          
      document.getElementById('endereco').value = userData.street || '';
      document.getElementById('numero').value = userData.number || '';
      document.getElementById('complemento').value = userData.complement || '';
      document.getElementById('cidade').value = userData.city || '';
      document.getElementById('estado').value = userData.state || '';
      document.getElementById('carteirinha').value = userData.id || ''; 
      document.getElementById('bairro').value = userData.neighborhood || '';

      // Renderização do status da carteirinha
      if (cardStatusLine && cardStatusText && cardValidityText) {
          
          let statusClass = 'status-pendente';
          let statusText = 'Pendente';
          let validityText = 'Status não sincronizado';

          if (userData.role === 'admin') {
              statusClass = 'status-na';
              statusText = 'Admin';
              validityText = 'conta administrativa';
          } else if (userData.isExpired === true) {
              statusClass = 'status-expirado';
              statusText = 'Expirado';
              validityText = 'renovação necessária';
          } else if (userData.isExpired === false) {
              statusClass = 'status-ativo';
              statusText = 'Ativo';
              validityText = `Válido (API V1)`;
          }

          cardStatusLine.className = `card-status-line ${statusClass}`;
          cardStatusText.textContent = statusText;
          cardValidityText.textContent = validityText;
      }

    } else {
        if (profileFormContainer) profileFormContainer.style.display = 'none';
        if (loggedOutMessage) loggedOutMessage.style.display = 'block';
    }

    setPersonalEditMode(false);
    setPasswordEditMode(false);
  }


  editPersonalBtn.addEventListener('click', () => {
    const inputs = personalInputsGrid.querySelectorAll('input');
    originalPersonalData = {};
    inputs.forEach(input => {
        originalPersonalData[input.id] = input.value;
    });
    setPersonalEditMode(true);
  });

  cancelPersonalBtn.addEventListener('click', () => {
    const inputs = personalInputsGrid.querySelectorAll('input');
    inputs.forEach(input => {
        if(originalPersonalData[input.id] !== undefined) {
            input.value = originalPersonalData[input.id];
        }
    });
    setPersonalEditMode(false);
    showMessage(personalMessage, 'Edição cancelada.', 'error');
  });

  // Persistência de dados editados na API
  async function finishSave() {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!storedUser) return;

    const updates = {
      name: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      CPF: document.getElementById('cpf').value.replace(/\D/g, ''),
      phone: document.getElementById('telefone').value,
      CEP: document.getElementById('cep').value.replace(/\D/g, ''),
      street: document.getElementById('endereco').value,
      number: document.getElementById('numero').value,
      complement: document.getElementById('complemento').value,
      neighborhood: document.getElementById('bairro').value,
      city: document.getElementById('cidade').value,
      state: document.getElementById('estado').value
    };

    try {
        const res = await fetch(`${API_URL}/user/profile`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(updates)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Erro ao atualizar perfil.');
        }

        // Atualização do cache local e interface
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        
        setPersonalEditMode(false);
        setPersonalData(); 
        
        showToastNotification('Dados atualizados com sucesso!', 'fa-solid fa-circle-check');

    } catch (error) {
        console.error("Erro ao salvar:", error);
        showMessage(personalMessage, error.message, 'error');
    }
  }


  // Handler de salvamento com validações prévias
  savePersonalBtn.addEventListener('click', () => {
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const cpfInput = document.getElementById('cpf');
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    
    personalMessage.className = 'form-message';
    
    if (!nomeInput.value || !emailInput.value) {
        showMessage(personalMessage, 'Nome e E-mail são campos obrigatórios.', 'error');
        return;
    }
    if (!isValidEmail(emailInput.value)) {
        showMessage(personalMessage, 'Por favor, insira um e-mail válido.', 'error');
        return;
    }
    const telefoneValor = telefoneInput.value;
    if (telefoneValor !== '' && telefoneValor !== '+55 ' && telefoneValor.length < 19) {
        showMessage(personalMessage, 'Por favor, preencha o telefone completo.', 'error');
        return;
    }
    const cepValor = cepInput.value.replace(/\D/g, '');
    if (cepValor.trim() !== '' && cepValor.length < 8) {
         showMessage(personalMessage, 'Por favor, preencha o CEP completo.', 'error'); 
         return;
    }
    
    // Validação específica de CPF novo
    const cpfValor = cpfInput.value.replace(/\D/g, '');
    const cpfWasJustFilled = !cpfInput.disabled && cpfValor.trim() !== '';
    
    if (cpfWasJustFilled) {
        if (cpfValor.length < 11) { 
            showMessage(personalMessage, 'Por favor, preencha o CPF completo (11 dígitos).', 'error'); 
            return; 
        }
        
        openCpfModal();
        return; 
    }
    
    finishSave();
  });

  // Handler de Edição de Senha (Simulação de front-end)
  
  editPasswordBtn.addEventListener('click', () => {
    originalPasswordData = {};
    allPasswordInputs.forEach(id => {
        originalPasswordData[id] = document.getElementById(id).value;
    });
    setPasswordEditMode(true);
    showMessage(passwordMessage, 'Modo de edição de senha ativado.', 'success');
  });

  cancelPasswordBtn.addEventListener('click', () => {
    allPasswordInputs.forEach(id => {
        if(originalPasswordData[id] !== undefined) {
            document.getElementById(id).value = originalPasswordData[id];
        }
    });
    setPasswordEditMode(false);
    showMessage(passwordMessage, 'Edição de senha cancelada.', 'error');
  });


  savePasswordBtn.addEventListener('click', () => {
    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
        showMessage(passwordMessage, 'Por favor, preencha todos os campos.', 'error');
        return;
    }
    if (novaSenha.length < 4) {
        showMessage(passwordMessage, 'A nova senha deve ter no mínimo 4 caracteres.', 'error');
        return;
    }
    if (novaSenha !== confirmarSenha) {
        showMessage(passwordMessage, 'As novas senhas não coincidem.', 'error');
        return;
    }
    
    allPasswordInputs.forEach(id => {
        document.getElementById(id).value = '';
    });
    
    setPasswordEditMode(false);
    
    showToastNotification('Senha alterada com sucesso!', 'fa-solid fa-circle-check');
  });
  

  // Autopreenchimento de endereço via API de CEP
  cepInput.addEventListener('blur', async function() {
      if (this.disabled === false) {
          let cep = this.value.replace(/\D/g, '');
          if (cep.length !== 8) return;
          
          showMessage(personalMessage, 'Buscando CEP...', 'success');
          
          try {
              const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
              const data = await response.json();
              
              if (data.erro) {
                  showMessage(personalMessage, 'CEP não encontrado.', 'error');
                  ['endereco', 'cidade', 'estado', 'bairro'].forEach(id => {
                      const el = document.getElementById(id);
                      el.value = '';
                  });
              } else {
                  personalMessage.className = 'form-message'; 
                  document.getElementById('endereco').value = data.logradouro || '';
                  document.getElementById('cidade').value = data.localidade || '';
                  document.getElementById('estado').value = data.uf || '';
                  document.getElementById('bairro').value = data.bairro || '';
                  
                  document.getElementById('endereco').disabled = true;
                  document.getElementById('cidade').disabled = true;
                  document.getElementById('estado').disabled = true;
                  document.getElementById('bairro').disabled = true;
              }
          } catch (error) {
              showMessage(personalMessage, 'Erro ao buscar o CEP.', 'error');
          }
      }
  });

  // Máscara dinâmica de telefone
  if(telefoneInput) {
      telefoneInput.addEventListener('focus', () => {
          if (telefoneInput.value === '') {
              telefoneInput.value = '+55 ';
          }
      });
      telefoneInput.addEventListener('blur', () => {
          if (telefoneInput.value === '+55 ') {
              telefoneInput.value = ''; 
          }
      });
      
      telefoneInput.addEventListener('input', (event) => {
          let value = event.target.value;
          if (!value.startsWith('+55 ')) {
              value = '+55 ';
          }
          let numbers = value.substring(4).replace(/\D/g, '');
          let maskedNumbers = '';
          if (numbers.length > 0) {
              maskedNumbers = '(' + numbers.substring(0, 2);
          }
          if (numbers.length > 2) {
              maskedNumbers += ') ' + numbers.substring(2, 7);
          }
          if (numbers.length > 7) {
              maskedNumbers += '-' + numbers.substring(7, 11);
          }
          event.target.value = '+55 ' + maskedNumbers;
      });
      telefoneInput.addEventListener('keydown', (event) => {
          if (event.target.selectionStart <= 4 && (event.key === 'Backspace' || event.key === 'Delete')) {
              event.preventDefault();
          }
      });
  }

  // Máscara dinâmica de CPF
  if(cpfInput) {
      cpfInput.addEventListener('input', (event) => {
          if (cpfInput.disabled) return;
          let value = event.target.value.replace(/\D/g, '');
          
          if (value.length > 11) {
             value = value.substring(0, 11);
          }
          
          value = value.replace(/(\d{3})(\d)/, '$1.$2');
          value = value.replace(/(\d{3})(\d)/, '$1.$2');
          value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
          event.target.value = value;
      });
  }

  // Máscara dinâmica de CEP
  if(cepInput) {
      cepInput.addEventListener('input', (event) => {
          if (cepInput.disabled) return;
          let value = event.target.value.replace(/\D/g, '');
          
          if (value.length > 8) {
             value = value.substring(0, 8);
          }
          
          value = value.replace(/^(\d{5})(\d)/, '$1-$2');
          event.target.value = value;
      });
  }
  
  // Validação numérica para número de endereço
  if(numeroInput) {
      numeroInput.addEventListener('input', (event) => {
          if (numeroInput.disabled) return;
          event.target.value = event.target.value.replace(/\D/g, '');
      });
  }
  
  // Sanitização de input para complemento
  if(complementoInput) {
      complementoInput.addEventListener('input', (event) => {
          if (complementoInput.disabled) return;
          const regex = /[^a-zA-Z0-9\u00C0-\u017F\s]/g; 
          event.target.value = event.target.value.replace(regex, '');
      });
  }

  // Toggle de visibilidade de senha
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
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

  // Configuração de listeners para o modal de CPF
  if(cpfCancelBtn) cpfCancelBtn.addEventListener('click', closeCpfModal);
  if(cpfCloseBtn) cpfCloseBtn.addEventListener('click', closeCpfModal);
  if(cpfConfirmBtn) {
    cpfConfirmBtn.addEventListener('click', () => {
        closeCpfModal();
        finishSave(); 
    });
  }
  window.addEventListener('click', function(e) {
      if (e.target === cpfModal) {
          closeCpfModal();
      }
  });


  // Inicialização da página
  setPersonalData();
});