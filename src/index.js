import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
/*
 * CSS das seções da home carregado no bundle de ENTRADA.
 *
 * O HomeUltraModern é carregado com React.lazy + code splitting, então o
 * import dentro do componente caía num chunk separado: o CSS só era injetado
 * no <head> depois que aquele chunk de JS executava, e o HTML JÁ pré-renderizado
 * aparecia sem estilo nesse intervalo (parte da página estilizada, parte crua).
 * Importando aqui, o CSS está no <link> inicial e vale desde o primeiro paint.
 */
import "./pages/Home/HomeUltraModern.css";
import "./pages/Home/ServicesMissingImages.css";
import App from "./App";
import { setupErrorSuppression } from "./utils/errorSuppression";
import "./utils/serviceWorkerCleanup"; // Limpar service workers problemáticos

// Configurar supressão de erros não críticos
setupErrorSuppression();

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
    <App />
  </React.StrictMode>
);