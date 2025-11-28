document.addEventListener('DOMContentLoaded', function () {

  // Configuração da API Backend
  const API_URL = 'https://busstop-b9ov.onrender.com';

  // Geração de headers para requisições autenticadas
  function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Referências aos elementos DOM
  const editModal = document.getElementById('edit-user-modal');
  const editForm = document.getElementById('edit-user-form');
  const editUserIdInput = document.getElementById('edit-user-id');
  const editNameInput = document.getElementById('edit-user-name');
  const editCpfInput = document.getElementById('edit-user-cpf');
  const editSaldoInput = document.getElementById('edit-user-saldo');
  const closeEditBtn = document.getElementById('modal-close-edit');

  const deleteModal = document.getElementById('delete-confirm-modal');
  const deleteUserInfoText = document.getElementById('delete-user-info');
  const confirmDeleteBtn = document.getElementById('delete-confirm-btn');
  const cancelDeleteBtn = document.getElementById('delete-cancel-btn');
  const closeDeleteBtn = document.getElementById('modal-close-delete');
  let userIdToDelete = null;

  const viewDocModal = document.getElementById('view-doc-modal');
  const closeViewDocBtn = document.getElementById('modal-close-view');
  const viewDocTitle = document.getElementById('view-doc-title');
  const docContentLoader = document.getElementById('doc-content-loader');
  const docImagePreview = document.getElementById('doc-image-preview');
  const docPdfPreview = document.getElementById('doc-pdf-preview');
  const docViewError = document.getElementById('doc-view-error');

  const documentsTableBody = document.getElementById('documents-table-body');
  const usersTableBody = document.getElementById('users-table-body');
  const searchDocumentsInput = document.getElementById('search-documents');
  const searchUsersInput = document.getElementById('search-users');

  let allUsersCache = [];
  let allDocumentsCache = [];

  // Verificação de permissões de administrador
  function checkAdminAuth() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      window.location.href = '../../index.html';
    }
  }

  // Função de notificação Toast (Feedback Visual)
  function showToastNotification(message, iconClass = 'fa-solid fa-circle-check', isError = false) {
      const existingToast = document.querySelector('.toast-notification');
      if (existingToast) {
          existingToast.remove();
      }

      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      
      if (isError) {
          toast.style.backgroundColor = '#dc3545'; // Vermelho para erro
      } else {
          toast.style.backgroundColor = '#28a745'; // Verde para sucesso
      }

      toast.innerHTML = `
          <i class="${iconClass}"></i>
          <span>${message}</span>
      `;
      
      document.body.appendChild(toast);

      // Remove automaticamente após 4 segundos
      setTimeout(() => {
          if(toast.parentNode) toast.parentNode.removeChild(toast);
      }, 4000);
  }

  // Renderização da tabela de documentos
  function displayDocuments(documentsData) {
    if (!documentsTableBody) return;
    documentsTableBody.innerHTML = '';

    if (documentsData.length === 0) {
      documentsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum documento encontrado.</td></tr>';
      return;
    }

    // Agrupamento por usuário
    const filesByUser = {};

    documentsData.forEach(file => {
        // Normaliza ID
        let userId = 'N/A';
        if (file.uploadedBy) {
            userId = (typeof file.uploadedBy === 'object' && file.uploadedBy._id) 
                ? file.uploadedBy._id 
                : file.uploadedBy.toString();
        }

        if (!filesByUser[userId]) {
            filesByUser[userId] = {
                files: [],
                lastUpload: new Date(file.createdAt),
                totalSize: 0
            };
        }

        const fileDate = new Date(file.createdAt);
        if (fileDate > filesByUser[userId].lastUpload) {
            filesByUser[userId].lastUpload = fileDate;
        }

        filesByUser[userId].files.push(file);
        filesByUser[userId].totalSize += (file.size || 0);
    });

    // Gera as linhas da tabela
    Object.keys(filesByUser).forEach(userId => {
        const userData = filesByUser[userId];
        const row = document.createElement('tr');
        
        const formattedDate = userData.lastUpload.toLocaleDateString('pt-BR');
        
        let sizeDisplay = '';
        const sizeInKB = userData.totalSize / 1024;
        if (sizeInKB > 1024) {
            sizeDisplay = (sizeInKB / 1024).toFixed(2) + ' MB';
        } else {
            sizeDisplay = sizeInKB.toFixed(1) + ' KB';
        }

        const filesHtml = userData.files.map(file => {
            const fileKey = file._id || file.id;
            const safeName = file.originalName.replace(/"/g, '&quot;');
            const displayName = file.originalName.length > 20 
                ? file.originalName.substring(0, 17) + '...' 
                : file.originalName;
            
            let iconClass = 'fa-file';
            let iconColor = '#6c757d';
            
            if (file.mimetype && file.mimetype.includes('image')) {
                iconClass = 'fa-file-image';
                iconColor = '#28a745';
            } else if (file.mimetype && file.mimetype.includes('pdf')) {
                iconClass = 'fa-file-pdf';
                iconColor = '#dc3545';
            }
            
            return `
                <div style="display: inline-flex; align-items: center; background: #fff; border: 1px solid #ddd; padding: 4px 8px; border-radius: 20px; margin: 2px 4px; font-size: 0.85rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <i class="fa-solid ${iconClass}" style="color: ${iconColor}; margin-right: 5px;"></i>
                    <span title="${safeName}" style="margin-right: 8px; color: #333;">${displayName}</span>
                    <i class="fa-solid fa-eye view-mini-btn" 
                       style="cursor: pointer; color: #007bff; font-size: 0.9rem;"
                       data-file-id="${fileKey}" 
                       data-file-name="${safeName}" 
                       data-user-id="${userId}"
                       title="Ver arquivo"></i>
                </div>
            `;
        }).join('');

        row.innerHTML = `
            <td style="vertical-align: middle; font-family: monospace; color: #555; font-weight: 600;">${userId}</td>
            <td style="vertical-align: middle;">${filesHtml}</td>
            <td style="vertical-align: middle; white-space: nowrap;">${sizeDisplay}</td>
            <td style="vertical-align: middle;">${formattedDate}</td>
            <td style="vertical-align: middle; text-align: center;">
                <div style="display: flex; justify-content: start; gap: 12px;">
                    <!-- Botão Aprovar (Verde) -->
                    <button class="approve-all-btn" data-user-id="${userId}" 
                            title="Aprovar" 
                            style="
                                background-color: #28a745; 
                                color: white; 
                                border: none; 
                                width: 40px; 
                                height: 40px; 
                                border-radius: 8px; 
                                cursor: pointer; 
                                display: flex; 
                                align-items: center; 
                                justify-content: center;
                                transition: background-color 0.2s;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            "
                            onmouseover="this.style.backgroundColor='#218838'"
                            onmouseout="this.style.backgroundColor='#28a745'">
                        <i class="fa-solid fa-check" style="font-size: 1.2rem; font-weight: 900;"></i>
                    </button>

                    <!-- Botão Excluir (Vermelho) -->
                    <button class="delete-all-btn" data-user-id="${userId}" 
                            title="Excluir" 
                            style="
                                background-color: #dc3545; 
                                color: white; 
                                border: none; 
                                width: 40px; 
                                height: 40px; 
                                border-radius: 8px;
                                cursor: pointer; 
                                display: flex; 
                                align-items: center; 
                                justify-content: center;
                                transition: background-color 0.2s;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            "
                            onmouseover="this.style.backgroundColor='#c82333'"
                            onmouseout="this.style.backgroundColor='#dc3545'">
                        <i class="fa-solid fa-trash-can" style="font-size: 1.1rem;"></i>
                    </button>
                </div>
            </td>
        `;
        documentsTableBody.appendChild(row);
    });
  }

  // Busca de documentos na API
  async function loadDocuments() {
    if (allDocumentsCache.length === 0) {
      try {
        const res = await fetch(`${API_URL}/files`, { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Falha ao buscar documentos da API');
        allDocumentsCache = await res.json();
      } catch (error) {
        console.error(error.message);
        if (documentsTableBody) documentsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">${error.message}</td></tr>`;
        return;
      }
    }

    const searchTerm = searchDocumentsInput.value.trim().toLowerCase();
    if (searchTerm === '') {
      displayDocuments(allDocumentsCache);
      return;
    }

    const filteredDocuments = allDocumentsCache.filter(file => {
      const nameMatch = file.originalName.toLowerCase().includes(searchTerm);
      const userMatch = file.uploadedBy && file.uploadedBy.toString().toLowerCase().includes(searchTerm);
      return nameMatch || userMatch;
    });

    displayDocuments(filteredDocuments);
  }

  // Renderização da tabela de usuários
  function displayUsers(usersData) {
    if (!usersTableBody) return;
    usersTableBody.innerHTML = '';

    if (usersData.length === 0) {
      usersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum usuário encontrado.</td></tr>';
      return;
    }

    usersData.forEach(user => {
      const isSelf = (user.role === 'admin');
      const actionsHtml = isSelf ? 'Admin Principal' : `
                <button class="action-btn edit-btn" data-id="${user.id}">Editar</button>
                <button class="action-btn delete-btn" data-id="${user.id}" data-info="${user.email}">Excluir</button>
            `;

      const row = document.createElement('tr');
      row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.name}</td>
                <td>${user.CPF ? user.CPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'N/A'}</td>
                <td>R$ ${user.saldo.toFixed(2).replace('.', ',')}</td>
                <td>${user.id}</td>
                <td>${actionsHtml}</td>
            `;
      usersTableBody.appendChild(row);
    });
  }

  // Busca de usuários na API
  async function loadUsers() {
    if (allUsersCache.length === 0) {
      try {
        const res = await fetch(`${API_URL}/user`, { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Falha ao buscar usuários da API');
        allUsersCache = await res.json();
      } catch (error) {
        console.error(error.message);
        if (usersTableBody) usersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">${error.message}</td></tr>`;
        return;
      }
    }

    const searchTerm = searchUsersInput.value.trim().toLowerCase();
    if (searchTerm === '') {
      displayUsers(allUsersCache);
      return;
    }

    const filteredUsers = allUsersCache.filter(user => {
      const emailMatch = user.email.toLowerCase().includes(searchTerm);
      const cpfMatch = (user.CPF && user.CPF.includes(searchTerm));
      return emailMatch || cpfMatch;
    });

    displayUsers(filteredUsers);
  }

  // Função de deletar arquivos do usuário com feedback personalizado
  async function deleteUserFiles(userId, btnElement, successMsg = "Ação realizada com sucesso") {
      if (!userId) return;

      try {
          const authHeader = getAuthHeader();
          delete authHeader['Content-Type']; 

          const res = await fetch(`${API_URL}/files/${userId}`, {
              method: 'DELETE',
              headers: authHeader
          });

          // Tenta ler JSON de forma segura (caso a API retorne vazio/204)
          let data = null;
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
              data = await res.json();
          }

          if (!res.ok) {
              throw new Error(data?.message || `Erro: ${res.status} ${res.statusText}`);
          }

          // Sucesso: Notifica e remove do frontend
          showToastNotification(successMsg, 'fa-solid fa-check');

          allDocumentsCache = allDocumentsCache.filter(f => {
              const fUser = (typeof f.uploadedBy === 'object' && f.uploadedBy._id) ? f.uploadedBy._id : f.uploadedBy;
              return fUser.toString() !== userId.toString();
          });
          
          loadDocuments();

      } catch (error) {
          console.error("Erro ao processar arquivos do usuário:", error);
          showToastNotification(`Erro: ${error.message}`, 'fa-solid fa-triangle-exclamation', true);
      }
  }

  // Handlers de ações
  function handleUserActions(e) {
    const target = e.target.closest('button');
    if (!target) return;

    const userId = target.dataset.id;
    if (!userId) return;

    if (target.classList.contains('edit-btn')) {
      openEditModal(userId);
    } else if (target.classList.contains('delete-btn')) {
      const userInfo = target.dataset.info;
      openDeleteModal(userId, userInfo);
    }
  }

  function handleDocumentActions(e) {
    // Botão Excluir (Vermelho)
    const deleteBtn = e.target.closest('.delete-all-btn');
    if (deleteBtn) {
        const userId = deleteBtn.dataset.userId;
        deleteUserFiles(userId, deleteBtn, "Excluído com sucesso");
        return;
    }

    // Botão Aprovar (Verde)
    const approveBtn = e.target.closest('.approve-all-btn');
    if (approveBtn) {
        const userId = approveBtn.dataset.userId;
        deleteUserFiles(userId, approveBtn, "Aprovado com sucesso"); 
        return;
    }

    // Botão Visualizar (Azul)
    const viewBtn = e.target.closest('.view-mini-btn');
    if (viewBtn) {
        const fileId = viewBtn.dataset.fileId;
        const fileName = viewBtn.dataset.fileName;
        const userId = viewBtn.dataset.userId;
        openViewModal(fileId, fileName, userId);
        return;
    }
  }

  // Lógica do Modal de Edição
  function openEditModal(userId) {
    const user = allUsersCache.find(u => u.id == userId);

    if (user && editModal) {
      editUserIdInput.value = user.id;
      editNameInput.value = user.name;
      editCpfInput.value = user.CPF;
      editSaldoInput.value = user.saldo.toFixed(2);
      editModal.style.display = 'flex';
    }
  }

  function closeEditModal() {
    if (editModal) {
      editModal.style.display = 'none';
      editForm.reset();
    }
  }

  editForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const userId = editUserIdInput.value;

    const payload = {
      name: editNameInput.value,
      cpf: editCpfInput.value.replace(/\D/g, ''),
      saldo: parseFloat(editSaldoInput.value.replace(',', '.')) || 0.00
    };

    try {
      const res = await fetch(`${API_URL}/user/${userId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(payload)
      });

      const updatedUser = await res.json();

      if (!res.ok) throw new Error(updatedUser.message || 'Falha ao atualizar');

      const index = allUsersCache.findIndex(u => u.id == userId);
      if (index !== -1) {
        allUsersCache[index] = { ...allUsersCache[index], ...updatedUser };
      }

      loadUsers();
      closeEditModal();

    } catch (error) {
      console.error("Erro ao salvar usuário:", error.message);
      alert(`Erro ao salvar: ${error.message}`);
    }
  });

  // Lógica do Modal de Exclusão de Usuário
  function openDeleteModal(userId, userInfo) {
    userIdToDelete = userId;
    if (deleteUserInfoText) deleteUserInfoText.textContent = userInfo;
    if (deleteModal) deleteModal.style.display = 'flex';
  }

  function closeDeleteModal() {
    userIdToDelete = null;
    if (deleteModal) deleteModal.style.display = 'none';
  }

  confirmDeleteBtn.addEventListener('click', async function () {
    if (userIdToDelete) {
      try {
        const authHeader = getAuthHeader();
        delete authHeader['Content-Type'];

        const res = await fetch(`${API_URL}/user/${userIdToDelete}`, {
          method: 'DELETE',
          headers: authHeader
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Falha ao deletar');

        allUsersCache = allUsersCache.filter(u => u.id != userIdToDelete);
        loadUsers();
        closeDeleteModal();

      } catch (error) {
        console.error("Erro ao deletar usuário:", error.message);
        alert(`Erro ao deletar: ${error.message}`);
      }
    }
  });

  // Lógica do Modal de Visualização de Documentos
  function resetViewModal() {
    if (docContentLoader) docContentLoader.style.display = 'block';
    if (docImagePreview) {
      docImagePreview.style.display = 'none';
      docImagePreview.src = '';
    }
    if (docPdfPreview) {
      docPdfPreview.style.display = 'none';
      docPdfPreview.src = '';
    }
    if (docViewError) docViewError.style.display = 'none';
  }

  async function openViewModal(fileId, fileName, userId) {
    if (!viewDocModal) return;

    resetViewModal();
    viewDocTitle.textContent = `Visualizando: ${fileName}`;
    viewDocModal.style.display = 'flex';

    if (!userId) {
      docContentLoader.style.display = 'none';
      docViewError.textContent = "Erro: ID do usuário não identificado para buscar o arquivo.";
      docViewError.style.display = 'block';
      return;
    }

    try {
      const authHeader = getAuthHeader();
      delete authHeader['Content-Type'];

      const res = await fetch(`${API_URL}/files/${userId}`, { headers: authHeader });
      const userFiles = await res.json();

      if (!res.ok) throw new Error(userFiles.message || 'Falha ao carregar arquivos da API.');

      const targetFile = Array.isArray(userFiles) ? userFiles.find(f => (f._id || f.id).toString() === fileId.toString()) : null;

      if (!targetFile) throw new Error('Arquivo não encontrado na lista do usuário.');

      docContentLoader.style.display = 'none';

      if (targetFile.mimetype.startsWith('image/')) {
        docImagePreview.src = targetFile.fileData;
        docImagePreview.style.display = 'block';
      } else if (targetFile.mimetype === 'application/pdf') {
        docPdfPreview.src = targetFile.fileData;
        docPdfPreview.style.display = 'block';
      } else {
        throw new Error('Tipo de arquivo não suportado para visualização.');
      }

    } catch (error) {
      console.error("Erro ao carregar documento:", error.message);
      docContentLoader.style.display = 'none';
      docViewError.textContent = `Erro: ${error.message}`;
      docViewError.style.display = 'block';
    }
  }

  function closeViewModal() {
    if (viewDocModal) {
      viewDocModal.style.display = 'none';
      resetViewModal();
    }
  }

  // Configuração de Listeners Globais
  if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
  if (closeDeleteBtn) closeDeleteBtn.addEventListener('click', closeDeleteModal);
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  if (closeViewDocBtn) closeViewDocBtn.addEventListener('click', closeViewModal);

  if (usersTableBody) usersTableBody.addEventListener('click', handleUserActions);
  if (documentsTableBody) documentsTableBody.addEventListener('click', handleDocumentActions);

  if (searchDocumentsInput) {
    searchDocumentsInput.addEventListener('input', loadDocuments);
  }
  if (searchUsersInput) {
    searchUsersInput.addEventListener('input', loadUsers);
  }

  window.addEventListener('click', function (e) {
    if (e.target === editModal) closeEditModal();
    if (e.target === deleteModal) closeDeleteModal();
    if (e.target === viewDocModal) closeViewModal();
  });

  checkAdminAuth();
  loadDocuments();
  loadUsers();
});