// iAvalia Pro - Service Worker com Atualização Imediata e Versionamento de Cache
const CACHE_VERSION = 'iavalia-v1.0.1';
const CACHE_NAME = `iavalia-cache-${CACHE_VERSION}`;

// Recursos essenciais para inicialização offline básica
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/favicon.svg'
];

// 1. Instalação: Força o novo Service Worker a se tornar ativo imediatamente
self.addEventListener('install', (event) => {
  // skipWaiting faz com que este SW assuma imediatamente sem esperar abas antigas fecharem
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usa { cache: 'reload' } para garantir que a rede seja consultada diretamente
      return cache.addAll(
        PRECACHE_ASSETS.map((url) => new Request(url, { cache: 'reload' }))
      ).catch((err) => {
        console.warn('[SW] Aviso ao pré-carregar recursos:', err);
      });
    })
  );
});

// 2. Ativação: Limpa caches antigos e assume o controle de todos os clientes abertos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // clients.claim faz com que o novo SW controle imediatamente todas as abas abertas
      self.clients.claim(),

      // Descarta qualquer cache cujo nome não seja o CACHE_NAME atual
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('[SW] Purgando cache obsoleto:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
    ])
  );
});

// 3. Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não intercepta requisições não-GET (POST, PUT, DELETE, PATCH, etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  // Não faz cache de requisições para a API / backend
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('onrender.com') ||
    url.port === '3001' ||
    url.pathname.includes('/models') ||
    url.pathname.includes('/evaluations') ||
    url.pathname.includes('/settings')
  ) {
    return;
  }

  // Não faz cache persistente de sw.js ou manifest
  if (url.pathname.endsWith('sw.js') || url.pathname.endsWith('manifest.webmanifest')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // Para navegação / páginas HTML: Network-First (com fallback seguro para cache offline)
  // Isso garante que após um novo deploy, o index.html novo é sempre buscado da rede!
  if (
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/'
  ) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Se estiver sem internet, retorna o index.html salvo em cache
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Para assets versionados pelo Vite (/assets/*): Cache-First com atualização
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Para outros recursos estáticos: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Canal de comunicação para comandos do frontend
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
