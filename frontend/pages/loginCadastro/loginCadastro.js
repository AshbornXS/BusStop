// Configuração da API Backend
const API_URL = 'https://busstop-b9ov.onrender.com';

/**
 * Gera os cabeçalhos de autenticação para requisições.
 * @param {string} token - Token JWT do usuário.
 */
function getAuthHeader(token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
}

/**
 * Busca e persiste o perfil do usuário no LocalStorage.
 * Gerencia também flags administrativas.
 */
async function fetchAndStoreUser(token) {
    if (!token) return false;

    try {
        // Requisição para obter dados do perfil completo
        const res = await fetch(`${API_URL}/user/profile`, {
            headers: getAuthHeader(token)
        });

        if (!res.ok) {
            throw new Error('Token inválido ou expirado.');
        }
        
        const { user } = await res.json(); 
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Persistência de permissão administrativa
            if (user.role === 'admin') {
                localStorage.setItem('isAdmin', 'true');
            } else {
                localStorage.removeItem('isAdmin');
            }
            return true;
        }
        return false;

    } catch (error) {
        console.error("Erro ao buscar perfil:", error.message);
        // Limpeza de dados inválidos ou expirados
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAdmin');
        return false;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Referências DOM para containers e botões de navegação
    const mainContainer = document.querySelector('.main-container');
    const toggleBtn = document.getElementById('toggleBtn');
    const proceedBtn = document.getElementById('proceedBtn');
    const backBtn = document.getElementById('backBtn');
    
    // Referências DOM para formulários e mensagens
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const personalInfoForm = document.getElementById('personalInfoForm');
    const successMessage = document.getElementById('successMessage');
    
    const overlayTitle = document.getElementById('overlay-title');
    const overlayText = document.getElementById('overlay-text');

    // Inputs de Autenticação
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const registerConfirmPasswordInput = document.getElementById('register-confirm-password');

    // Inputs de Dados Pessoais (Passo 2)
    const nomeInput = document.getElementById('nome');
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const cepInput = document.getElementById('cep');
    const enderecoInput = document.getElementById('endereco');
    const numeroInput = document.getElementById('numero');
    const complementoInput = document.getElementById('complemento');
    const bairroInput = document.getElementById('bairro');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado');

    // Elementos de feedback de erro
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const personalInfoError = document.getElementById('personalInfoError');

    // Reset de formulários ao trocar de estado
    function resetAllForms() {
        if (registerForm) registerForm.reset();
        if (personalInfoForm) personalInfoForm.reset();
    }
    
    // Validação básica de formato de e-mail
    function isValidEmail(email) {
        if (!email) return false;
        const parts = email.split('@');
        return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
    }

    // Gerenciamento de estado da UI baseado na URL (Hash Routing Simples)
    function updateUIBasedOnHash() {
        const hash = window.location.hash;
        mainContainer.classList.remove('step-two-active');
        if (personalInfoForm) personalInfoForm.style.display = '';
        if (successMessage) successMessage.classList.remove('visible');

        if (hash === '#cadastro') {
            mainContainer.classList.add('panel-active');
            loginForm.classList.remove('visible');
            registerForm.classList.add('visible');
            overlayTitle.textContent = 'Bem-vindo de Volta!';
            overlayText.textContent = 'Já possui uma conta? Faça login para continuar.';
            toggleBtn.textContent = 'Entrar';
        } else {
            mainContainer.classList.remove('panel-active');
            loginForm.classList.add('visible');
            registerForm.classList.remove('visible');
            overlayTitle.textContent = 'Olá!';
            overlayText.textContent = 'Ainda não tem uma conta? Cadastre-se agora.';
            toggleBtn.textContent = 'Cadastrar';
        }
    }

    updateUIBasedOnHash();
    toggleBtn.addEventListener('click', () => { window.location.hash = (window.location.hash === '#cadastro') ? '#login' : '#cadastro'; });
    window.addEventListener('hashchange', updateUIBasedOnHash);

    // Handler de submissão do Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (loginError) loginError.textContent = '';

            if (loginEmailInput.value.trim() === '' || loginPasswordInput.value.trim() === '') {
                if (loginError) loginError.textContent = 'Por favor, preencha todos os dados.';
                return;
            }
            if (!isValidEmail(loginEmailInput.value)) {
                if (loginError) loginError.textContent = 'Por favor, insira um e-mail válido.';
                return;
            }
            login(loginEmailInput.value, loginPasswordInput.value);
        });
    }

    // Handler de validação do Passo 1 do Cadastro
    proceedBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        registerError.textContent = '';

        if (registerEmailInput.value.trim() === '' || registerPasswordInput.value.trim() === '' || registerConfirmPasswordInput.value.trim() === '') {
            registerError.textContent = 'Por favor, preencha todos os dados.'; return;
        }
        if (!isValidEmail(registerEmailInput.value)) {
            registerError.textContent = 'Por favor, insira um e-mail válido.'; return;
        }
        if (registerPasswordInput.value.length < 4) {
            registerError.textContent = 'A senha deve ter no mínimo 4 caracteres.'; return;
        }
        if (registerPasswordInput.value !== registerConfirmPasswordInput.value) {
            registerError.textContent = 'As senhas não coincidem. Por favor, verifique.'; return;
        }
        
        mainContainer.classList.add('step-two-active');
    });

    backBtn.addEventListener('click', () => {
        mainContainer.classList.remove('step-two-active');
        setTimeout(updateUIBasedOnHash, 50);
    });

    // --- Máscaras e Validações de Input em Tempo Real ---
    
    // Validação de caracteres para Nome
    if(nomeInput) {
        nomeInput.addEventListener('input', (event) => {
            const regex = /[^a-zA-Z\u00C0-\u017F\s]/g;
            event.target.value = event.target.value.replace(regex, '');
        });
    }
    
    // Validação numérica para Número de Endereço
    if(numeroInput) {
        numeroInput.addEventListener('input', (event) => {
            event.target.value = event.target.value.replace(/\D/g, '');
        });
    }
    
    // Sanitização de Complemento
    if(complementoInput) {
        complementoInput.addEventListener('input', (event) => {
            const regex = /[^a-zA-Z0-9\u00C0-\u017F\s]/g; 
            event.target.value = event.target.value.replace(regex, '');
        });
    }
    
    // Máscara dinâmica para CPF
    if(cpfInput) {
        cpfInput.addEventListener('input', (event) => {
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
    
    // Máscara dinâmica para Telefone
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
    
    // Integração com API ViaCEP para autopreenchimento de endereço
     if(cepInput) {
        cepInput.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\D/g, '');
            if (value.length > 8) {
               value = value.substring(0, 8);
            }
            value = value.replace(/^(\d{5})(\d)/, '$1-$2');
            event.target.value = value;
        });
        cepInput.addEventListener('blur', async (event) => {
            const cep = event.target.value.replace(/\D/g, '');
            if (cep.length !== 8) return;
            personalInfoError.textContent = 'Buscando endereço...';
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                if (!response.ok) throw new Error('Falha na requisição');
                const data = await response.json();
                if (data.erro) { 
                    personalInfoError.textContent = 'CEP não encontrado. Verifique e tente novamente.'; 
                    return; 
                }
                personalInfoError.textContent = ''; 
                enderecoInput.value = data.logradouro;
                bairroInput.value = data.bairro;
                cidadeInput.value = data.localidade;
                estadoInput.value = data.uf;
                enderecoInput.disabled = true;
                bairroInput.disabled = true;
                cidadeInput.disabled = true;
                estadoInput.disabled = true;
                
            } catch (error) {
                personalInfoError.textContent = 'Não foi possível buscar o CEP. Tente novamente.';
            }
        });
    }

    // Handler de Finalização do Cadastro (Passo 2)
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', async (e) => { 
            e.preventDefault();
            personalInfoError.textContent = '';
            
            // Validação final dos campos obrigatórios
            if (nomeInput.value.trim() === '') {
                personalInfoError.textContent = 'Por favor, preencha o Nome completo.';
                return;
            }
            
            const cpfValor = cpfInput.value.replace(/\D/g, '');
            if (cpfValor.trim() !== '' && cpfValor.length < 11) { 
                personalInfoError.textContent = 'Por favor, preencha o CPF completo.'; 
                return; 
            }

            const telefoneValor = telefoneInput.value;
            if (telefoneValor !== '' && telefoneValor !== '+55 ' && telefoneValor.length < 19) { 
                personalInfoError.textContent = 'Por favor, preencha o telefone completo.'; 
                return; 
            }
            
            const cepValor = cepInput.value.replace(/\D/g, '');
            if (cepValor.trim() !== '' && cepValor.length < 8) { 
                personalInfoError.textContent = 'Por favor, preencha o CEP completo.'; 
                return; 
            }
            
            // Preparação dos payloads para registro e atualização de perfil
            const registerData = {
                name: nomeInput.value,
                email: registerEmailInput.value,
                password: registerPasswordInput.value,
            };

            const profileData = {
                CPF: cpfValor,
                phone: (telefoneValor !== '+55 ' && telefoneValor !== '') ? telefoneInput.value : '',
                CEP: cepValor,
                street: enderecoInput.value,
                number: numeroInput.value,
                complement: complementoInput.value,
                neighborhood: bairroInput.value,
                city: cidadeInput.value,
                state: estadoInput.value,
            };

            // Ativação da animação de sucesso
            mainContainer.classList.add('registration-complete');
            if (successMessage) {
                successMessage.style.display = 'flex';
                setTimeout(() => successMessage.classList.add('visible'), 50);
            }
            
            // Fluxo: Registrar -> Autenticar -> Atualizar Perfil
            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registerData)
                });
                
                const data = await res.json();
                
                if (!res.ok) {
                    throw new Error(data.message || 'Falha no cadastro (Email já em uso?)');
                }

                const { token, user } = data; 
                localStorage.setItem('token', token);
                
                // Atualização complementar dos dados do usuário
                const profileRes = await fetch(`${API_URL}/user/profile`, {
                    method: 'PUT',
                    headers: getAuthHeader(token),
                    body: JSON.stringify(profileData)
                });
                
                if (!profileRes.ok) {
                    throw new Error('Falha ao completar dados do perfil. Tente logar e editar.');
                }
                
                // Sincronização final e redirecionamento
                const profileUser = await fetchAndStoreUser(token);
                
                if(profileUser) {
                    localStorage.setItem('showWelcomeMessage', 'true');
                    setTimeout(() => {
                        window.location.href = '../../index.html';
                    }, 1000);
                } else {
                    throw new Error('Erro na sincronização após cadastro.');
                }

            } catch (error) {
                console.error("Erro no fluxo de cadastro:", error);
                
                // Reversão de estado em caso de erro
                mainContainer.classList.remove('registration-complete');
                if (successMessage) successMessage.classList.remove('visible');
                
                personalInfoError.textContent = error.message;
                
                setTimeout(() => {
                    mainContainer.classList.remove('step-two-active');
                    updateUIBasedOnHash();
                }, 1000);
            }
        });
    }
    
    // Handler de autenticação
    async function login(email, password) {
        if(loginError) loginError.textContent = 'Verificando...';

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Erro de rede ou servidor.');
            }
            
            const { token } = data;
            
            if (token) {
                localStorage.setItem('token', token);
                
                // Sincronização de perfil pós-login
                const profileLoaded = await fetchAndStoreUser(token); 
                
                if (profileLoaded) {
                    localStorage.setItem('showWelcomeMessage', 'true');
                    window.location.href = '../../index.html';
                } else {
                    throw new Error('Login bem-sucedido, mas falha ao carregar perfil.');
                }
            } else {
                 throw new Error('Resposta do servidor incompleta. Tente novamente.');
            }

        } catch (error) {
            if(loginError) loginError.textContent = error.message;
            console.error("Erro no login:", error);
        }
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

});