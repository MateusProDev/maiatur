// Utilitário para limpar service workers problemáticos
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.unregister();
      console.log('Service Worker desregistrado:', registration.scope);
    }
  }
};

// Chama a função para limpar durante desenvolvimento
if (process.env.NODE_ENV === 'development') {
  unregisterServiceWorker();
}
