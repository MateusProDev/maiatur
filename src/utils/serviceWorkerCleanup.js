// Utilitário para limpar service workers problemáticos
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('Service Worker desregistrado:', registration.scope);
    }
  }

  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  }
};

// Remove versões antigas que podem servir bundles incompatíveis com o build atual.
if (typeof window !== 'undefined') {
  unregisterServiceWorker().catch((error) => {
    console.error('Erro ao limpar o Service Worker:', error);
  });
}
