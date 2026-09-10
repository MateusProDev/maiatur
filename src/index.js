import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { setupErrorSuppression } from "./utils/errorSuppression";
import "./utils/serviceWorkerCleanup";

// Configurar supressão de erros não críticos
setupErrorSuppression();

// Criação do root
const rootElement = document.getElementById("root");
const renderApp = rootElement.hasChildNodes() ? hydrateRoot : createRoot;

// Renderização da aplicação
renderApp(rootElement,
  <React.StrictMode>
    <App />
  </React.StrictMode>
);