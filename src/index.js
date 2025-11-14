import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { setupErrorSuppression } from "./utils/errorSuppression";
import { initializeFirestoreCollections } from "./utils/firestoreUtils";
import "./utils/initBanners"; // Disponibiliza window.initBanners()
import "./utils/serviceWorkerCleanup"; // Limpar service workers problemáticos

// Configurar supressão de erros não críticos
setupErrorSuppression();

// Inicializar coleções do Firestore (incluindo banners)
setTimeout(() => {
  initializeFirestoreCollections()
    .then(() => console.log('✅ Firestore inicializado com sucesso!'))
    .catch((err) => console.error('❌ Erro ao inicializar Firestore:', err));
}, 2000);

// Criação do root
const root = ReactDOM.createRoot(document.getElementById("root"));

// Registro do Service Worker para melhor cache e performance
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('✅ Service Worker registrado com sucesso:', reg.scope);
        
        // Verificar se há atualizações
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 Nova versão disponível! Recarregue a página para atualizar.');
            }
          });
        });
      })
      .catch((err) => console.error('❌ Erro ao registrar Service Worker:', err));
  });
}

// Renderização da aplicação
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);