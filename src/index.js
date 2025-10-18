import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { setupErrorSuppression } from "./utils/errorSuppression";
import "./utils/serviceWorkerCleanup"; // Limpar service workers problemáticos

// Configurar supressão de erros não críticos
setupErrorSuppression();

// Criação do root
const root = ReactDOM.createRoot(document.getElementById("root"));

// Registro do Service Worker (temporariamente desabilitado)
if (false && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then((reg) => console.log('Service Worker registrado com sucesso:', reg))
      .catch((err) => console.error('Erro ao registrar Service Worker:', err));
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