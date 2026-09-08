// Registro e gerenciamento do ciclo de vida do Service Worker
type UpdateListener = (registration: ServiceWorkerRegistration) => void;
const updateListeners: Set<UpdateListener> = new Set();

let refreshing = false;

export function onServiceWorkerUpdate(listener: UpdateListener): () => void {
  updateListeners.add(listener);
  return () => {
    updateListeners.delete(listener);
  };
}

function notifyUpdate(registration: ServiceWorkerRegistration) {
  updateListeners.forEach((listener) => {
    try {
      listener(registration);
    } catch (e) {
      console.error('[SW] Erro no listener de atualização:', e);
    }
  });
}

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Previne loop infinito de recarga no controllerchange
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[SW] Novo Service Worker assumiu o controle. Recarregando a página...');
      window.location.reload();
    }
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none', // Força o navegador a buscar sw.js sempre diretamente na rede
      });

      console.log('[SW] Service Worker registrado com sucesso:', registration.scope);

      // Se já houver um worker esperando, notifica imediatamente
      if (registration.waiting) {
        notifyUpdate(registration);
      }

      // Escuta novos workers sendo instalados
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] Nova versão detectada e pronta para ativar.');
            notifyUpdate(registration);
          }
        });
      });

      // Checa atualizações periodicamente (a cada 60s)
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 1000);

      // Checa atualizações quando o app volta para primeiro plano no celular/navegador
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
    } catch (error) {
      console.error('[SW] Falha ao registrar Service Worker:', error);
    }
  });
}

export function skipWaitingAndReload(registration?: ServiceWorkerRegistration | null): void {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  } else {
    window.location.reload();
  }
}
