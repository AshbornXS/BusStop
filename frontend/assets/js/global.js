document.addEventListener('DOMContentLoaded', function() {
    
    // Constante base para endpoints da API Backend
    const API_URL = 'https://busstop-b9ov.onrender.com';
    let isLoggingOut = false; // Flag de controle para evitar múltiplos acionamentos de logout

    // Gerenciamento de eventos para menus dropdown em desktop (Serviços e Usuário)
    function setupDropdowns() {
        const servicosBtn = document.getElementById('servicos-btn');
        const servicosContent = document.getElementById('servicos-content');
        const userBtn = document.getElementById('user-btn');
        const userContent = document.getElementById('user-content');

        function toggleDropdown(button, content) {
            if (button && content) {
                button.classList.toggle('open');
                content.classList.toggle('show');
            }
        }

        function closeAllDropdowns() {
            if (servicosContent && servicosContent.classList.contains('show')) {
                toggleDropdown(servicosBtn, servicosContent);
            }
            if (userContent && userContent.classList.contains('show')) {
                toggleDropdown(userBtn, userContent);
            }
        }

        if(servicosBtn) {
            servicosBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (userContent && userContent.classList.contains('show')) {
                    toggleDropdown(userBtn, userContent);
                }
                toggleDropdown(servicosBtn, servicosContent);
            });
        }

        if(userBtn) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (servicosContent && servicosContent.classList.contains('show')) {
                    toggleDropdown(servicosBtn, servicosContent);
                }
                toggleDropdown(userBtn, userContent);
            });
        }
        
        // Fecha dropdowns ao clicar fora do elemento (desktop)
        window.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                closeAllDropdowns();
            }
        });
    }

    // Lógica de alternância e animação do menu mobile (Off-canvas)
    function setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-nav-menu');
        const overlay = document.getElementById('mobile-menu-overlay');

        if (!mobileMenuBtn || !mobileMenu || !overlay) {
            return;
        }

        function openMenu() {
            overlay.style.display = 'block';
            setTimeout(() => overlay.style.opacity = '1', 10);
            mobileMenu.classList.add('open');
        }

        function closeMenu() {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.style.display = 'none', 300);
            mobileMenu.classList.remove('open');
        }

        mobileMenuBtn.addEventListener('click', openMenu);
        overlay.addEventListener('click', closeMenu);
    }

    // Recuperação e persistência de dados do usuário via token JWT
    // Retorna true/false baseado no sucesso da validação do token
    async function fetchAndStoreUser() {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const res = await fetch(`${API_URL}/user/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                // Tratamento de erro de autenticação e limpeza de sessão
                throw new Error(`Token inválido ou expirado (status: ${res.status})`);
            }
            
            const { user } = await res.json(); // Espera estrutura { user: {...} }
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Verificação de permissões administrativas
                if (user.role === 'admin') {
                    localStorage.setItem('isAdmin', 'true');
                } else {
                    localStorage.removeItem('isAdmin'); // Limpeza preventiva
                }
                return true;
            }
            return false;

        } catch (error) {
            console.error("Erro ao buscar perfil (global):", error.message);
            // Limpeza completa de dados em caso de falha
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isAdmin');
            return false;
        }
    }


    // Procedimento de encerramento de sessão e limpeza de storage
    function performLogout(event) {
        event.preventDefault();
        if (isLoggingOut) return; // Previne duplo clique
        
        isLoggingOut = true;
        
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAdmin');
        
        showLogoutMessage();

        // Redirecionamento após logout
        setTimeout(() => {
            // Redireciona para a página inicial (Index)
            window.location.href = '/index.html';
        }, 2000);
    }

    // Renderização dinâmica dos elementos de menu baseada no estado de autenticação
    // Executa após fetchAndStoreUser
    function updateUserMenu() {
        // Seletores DOM
        const userContentDesktop = document.getElementById('user-content');
        const rightNavDesktop = document.querySelector('.right-nav');
        
        // Referências Mobile
        const mobileMenu = document.getElementById('mobile-nav-menu');

        // Dados recuperados do LocalStorage
        const token = localStorage.getItem('token');
        const currentUserData = localStorage.getItem('currentUser');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        let currentUser = null;
        let firstName = 'Visitante';

        if (token && currentUserData) {
            try {
                currentUser = JSON.parse(currentUserData);
                firstName = currentUser.name.split(' ')[0];
            } catch (e) {
                console.error("Erro ao processar dados do usuário:", e);
                // Logout forçado em caso de corrupção de dados
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('isAdmin');
            }
        }

        // Renderização condicional: Desktop
        if (userContentDesktop && rightNavDesktop) {
            // Remove display anterior se existir
            const existingUserNameDisplay = document.getElementById('user-name-display');
            if (existingUserNameDisplay) {
                existingUserNameDisplay.remove();
            }

            if (currentUser) {
                // Estado: Logado (Desktop)
                const userNameDisplay = document.createElement('span');
                userNameDisplay.id = 'user-name-display';
                userNameDisplay.textContent = `Olá, ${firstName}`;

                const userIconWrapper = rightNavDesktop.querySelector('.user-icon-wrapper');
                if (userIconWrapper) {
                    rightNavDesktop.insertBefore(userNameDisplay, userIconWrapper);
                }
                
                let adminLink = '';
                if (isAdmin) {
                    // Link condicional para Admin
                    adminLink = '<a href="/pages/admin/admin.html">Painel Admin</a>';
                }

                userContentDesktop.innerHTML = `
                    ${adminLink}
                    <!-- Caminhos absolutos mantidos -->
                    <a href="/pages/perfil/perfil.html">Meu Perfil</a>
                    <a href="#" id="logout-link-desktop">Sair</a>
                `;

                // Attach evento de logout desktop
                const logoutLinkDesktop = document.getElementById('logout-link-desktop');
                if (logoutLinkDesktop) {
                    logoutLinkDesktop.addEventListener('click', performLogout);
                }

            } else {
                // Estado: Deslogado (Desktop)
                userContentDesktop.innerHTML = `
                    <!-- Caminhos absolutos mantidos -->
                    <a href="/pages/loginCadastro/loginCadastro.html#login">Login</a>
                    <a href="/pages/loginCadastro/loginCadastro.html#cadastro">Cadastro</a>
                `;
            }
        }

        // Renderização condicional: Mobile
        if (mobileMenu) {
            let userLinksMobile = '';
            let userInfoMobile = `
                <div class="mobile-user-info">
                    <div class="user-icon"><i class="fa-regular fa-user"></i></div>
                    <span>Olá, ${firstName}</span>
                </div>
            `;

            if (currentUser) {
                // Estado: Logado (Mobile)
                let adminLinkMobile = '';
                if (isAdmin) {
                    // Link condicional para Admin Mobile
                    adminLinkMobile = `<a href="/pages/admin/admin.html"><i class="fa-solid fa-user-shield"></i> Painel Admin</a>`;
                }
                userLinksMobile = `
                    <div class="mobile-user-links">
                        <!-- Caminhos absolutos mantidos -->
                        <a href="/pages/perfil/perfil.html"><i class="fa-solid fa-user-pen"></i> Meu Perfil</a>
                        ${adminLinkMobile}
                        <a href="#" id="logout-link-mobile"><i class="fa-solid fa-right-from-bracket"></i> Sair</a>
                    </div>
                `;
            } else {
                // Estado: Deslogado (Mobile)
                userInfoMobile = `
                    <div class="mobile-user-info">
                        <div class="user-icon"><i class="fa-regular fa-user"></i></div>
                        <span>Visitante</span>
                    </div>
                `;
                userLinksMobile = `
                    <div class="mobile-user-links">
                        <!-- Caminhos absolutos mantidos -->
                        <a href="/pages/loginCadastro/loginCadastro.html#login"><i class="fa-solid fa-right-to-bracket"></i> Login</a>
                        <a href="/pages/loginCadastro/loginCadastro.html#cadastro"><i class="fa-solid fa-user-plus"></i> Cadastro</a>
                    </div>
                `;
            }

            // Montagem do HTML do menu mobile
            mobileMenu.innerHTML = `
                ${userInfoMobile}
                <nav>
                    <!-- Caminhos absolutos mantidos -->
                    <a href="/index.html"><i class="fa-solid fa-house"></i> Home</a>
                    <a href="/pages/recarga/recarga.html"><i class="fa-solid fa-wallet"></i> Recarga</a>
                    <a href="/pages/renovacao/renovacao.html"><i class="fa-solid fa-id-card"></i> Renovação</a>
                    <a href="/pages/linhas/linhas.html"><i class="fa-solid fa-map-location-dot"></i> Linhas</a>
                </nav>
                ${userLinksMobile}
            `;

            // Attach evento de logout mobile
            const logoutLinkMobile = document.getElementById('logout-link-mobile');
            if (logoutLinkMobile) {
                logoutLinkMobile.addEventListener('click', performLogout);
            }
        }
    }


    // Utilitário para exibição de toast de logout
    function showLogoutMessage() {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <span>Você saiu da sua conta. Redirecionando...</span>
        `;
        
        document.body.appendChild(toast);
    }

    // Utilitário para exibição de toast de boas-vindas
    function showWelcomeMessage(userName) {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <i class="fa-solid fa-hand-sparkles"></i>
            <span>Bem-vindo(a), ${userName}!</span>
        `;
        
        document.body.appendChild(toast);
    }

    // Verifica flag de boas-vindas no localStorage
    function checkAndShowWelcomeMessage() {
        if (localStorage.getItem('showWelcomeMessage') === 'true') {
            const currentUserData = localStorage.getItem('currentUser');
            if (currentUserData) {
                try {
                    const currentUser = JSON.parse(currentUserData);
                    const firstName = currentUser.name.split(' ')[0];
                    showWelcomeMessage(firstName);
                } catch (e) {
                    console.error("Erro ao processar dados do usuário:", e);
                }
            }
            localStorage.removeItem('showWelcomeMessage');
        }
    }

    // Orquestrador de inicialização da aplicação
    async function initializeApp() {
        // 1. Sincronização de dados do usuário
        await fetchAndStoreUser(); 
        
        // 2. Atualização da interface
        updateUserMenu(); 
        
        // 3. Feedback ao usuário
        checkAndShowWelcomeMessage(); 
    }

    // Inicialização de componentes de UI estáticos
    setupDropdowns();
    setupMobileMenu(); 
    
    // Inicialização de componentes dependentes de dados
    initializeApp();
});

// Registro de Service Worker para suporte a PWA
// Executado fora do evento DOMContentLoaded para prioridade
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js') // Caminho relativo à raiz
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
      })
      .catch(registrationError => {
        console.log('Falha no registro do Service Worker:', registrationError);
      });
  });
}