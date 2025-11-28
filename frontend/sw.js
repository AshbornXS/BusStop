// sw.js

// Identificador único do cache para versionamento de recursos estáticos
const CACHE_NAME = 'busstop-cache-v3'; 

// Mapeamento de recursos críticos para estratégia de pré-carregamento (Precaching)
const urlsToCache = [
  '/',
  '/index.html',

  // Módulos HTML da aplicação
  '/pages/admin/admin.html',
  '/pages/esqueceuSenha/esqueceuSenha.html',
  '/pages/linhas/linhas.html',
  '/pages/loginCadastro/loginCadastro.html',
  '/pages/novaSenha/novaSenha.html',
  '/pages/perfil/perfil.html',
  '/pages/recarga/recarga.html',
  '/pages/renovacao/renovacao.html',
  '/pages/termos/termos.html',
  
  // Folhas de estilo
  '/assets/css/global.css',
  '/index.css', // Estilos específicos da página inicial
  '/pages/admin/admin.css',
  '/pages/esqueceuSenha/esqueceuSenha.css',
  '/pages/linhas/linhas.css',
  '/pages/loginCadastro/loginCadastro.css',
  '/pages/novaSenha/novaSenha.css',
  '/pages/perfil/perfil.css',
  '/pages/recarga/recarga.css',
  '/pages/renovacao/renovacao.css',
  '/pages/termos/termos.css',

  // Scripts de comportamento
  '/assets/js/global.js',
  '/pages/admin/admin.js',
  '/pages/esqueceuSenha/esqueceuSenha.js',
  '/pages/loginCadastro/loginCadastro.js', // Script de autenticação
  '/pages/novaSenha/novaSenha.js',
  '/pages/perfil/perfil.js',
  '/pages/recarga/recarga.js',
  '/pages/renovacao/renovacao.js',
  
  // Recursos de imagem e mídia
  '/assets/images/index.jpg',
  '/assets/images/linhas.jpg',
  '/assets/images/recarga.jpg',
  '/assets/images/renovacao.jpg',

  // Ícones para manifesto PWA
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png',
  
  // Dependências externas (CDN)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
];

// Ciclo de vida: Instalação e cache inicial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache (v3) aberto. Adicionando arquivos principais.');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Falha ao adicionar arquivos ao cache:', err);
      })
  );
});

// Interceptação de requisições de rede (Estratégia Cache-First)
self.addEventListener('fetch', event => {
  // Bypass de cache para chamadas de API
  if (event.request.url.includes('/api/') || event.request.url.includes('busstop-b9ov.onrender.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Bypass de cache para APIs externas dinâmicas (Google Maps)
  if (event.request.url.includes('maps.googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se disponível
        if (response) {
          return response;
        }
        
        // Fallback para rede com atualização de cache em tempo real
        return fetch(event.request).then(
          function(response) {
            // Validação de resposta da rede
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonagem do stream de resposta para armazenamento
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      }
    )
  );
});

// Ciclo de vida: Ativação e limpeza de caches obsoletos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Definição da versão ativa
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Remoção de versões anteriores do cache
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});