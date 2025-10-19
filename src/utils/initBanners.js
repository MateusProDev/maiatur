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

// Auto-executar se este arquivo for importado
if (typeof window !== 'undefined') {
  window.initBanners = forceInitializeBanners;
  console.log('💡 Use window.initBanners() no console para inicializar os banners manualmente');
}
