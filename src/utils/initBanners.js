// Script para inicializar os banners manualmente
import { initializeFirestoreCollections } from './firestoreUtils';

export const forceInitializeBanners = async () => {
  console.log('🎨 Forçando inicialização dos banners...');
  try {
    await initializeFirestoreCollections();
    console.log('✅ Banners inicializados com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banners:', error);
    return false;
  }
};

// Verifica se o acesso a storage (localStorage) está disponível — útil para detectar Tracking Prevention
function isStorageAccessible() {
  try {
    const key = '__maiatur_storage_test__';
    window.localStorage.setItem(key, '1');
    window.localStorage.getItem(key);
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    return false;
  }
}

// Auto-executar se este arquivo for importado
if (typeof window !== 'undefined') {
  // Expor uma função mais amigável que detecta bloqueios e chama a inicialização
  window.initBanners = async (...args) => {
    if (!isStorageAccessible()) {
      console.warn('⚠️ Tracking Prevention ou política de privacidade bloqueando acesso ao storage.');
      console.warn('Se os banners dependem de APIs externas (ex: Google) habilite o storage para este site ou desative temporariamente o Tracking Prevention.');
      console.warn('Dicas: no Edge clique no ícone de cadeado → Tracking prevention → Off para este site; em Firefox desative Enhanced Tracking Protection para este site; extensões como uBlock/AdBlock também podem bloquear.');
    }

    try {
      const result = await forceInitializeBanners(...args);
      if (result) return true;
      // caso falhe, já foi logado dentro da função
      return false;
    } catch (err) {
      console.error('❌ Erro inesperado ao executar window.initBanners():', err);
      return false;
    }
  };

  console.log('💡 Use `window.initBanners()` no console para inicializar os banners manualmente');
}
