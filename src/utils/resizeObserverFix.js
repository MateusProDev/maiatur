// Fix específico para ResizeObserver loop error
// Este é um erro conhecido do Material-UI/MUI que não afeta a funcionalidade

const ORIGINAL_ERROR = console.error;

console.error = (...args) => {
  // Interceptar erros específicos do ResizeObserver
  const isResizeObserverError = (
    args.length > 0 &&
    typeof args[0] === 'string' &&
    (
      args[0].includes('ResizeObserver loop completed with undelivered notifications') ||
      args[0].includes('ResizeObserver loop limit exceeded') ||
      (args[0].includes('handleError') && args[0].includes('ResizeObserver'))
    )
  );

  if (isResizeObserverError) {
    // Silenciar este erro específico
    return;
  }
  
  // Para todos os outros erros, usar o console.error original
  ORIGINAL_ERROR(...args);
};

// Interceptar erros não capturados
const originalOnError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  // Verificar se é erro do ResizeObserver
  const isResizeObserverMessage = (
    typeof message === 'string' &&
    (
      message.includes('ResizeObserver loop completed with undelivered notifications') ||
      message.includes('ResizeObserver loop limit exceeded')
    )
  );
  
  if (isResizeObserverMessage) {
    // Silenciar este erro
    return true;
  }
  
  // Para outros erros, usar o handler original se existir
  if (originalOnError) {
    return originalOnError(message, source, lineno, colno, error);
  }
  
  return false;
};

// Interceptar Promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const isResizeObserverRejection = (
    event.reason &&
    typeof event.reason === 'string' &&
    (
      event.reason.includes('ResizeObserver loop completed with undelivered notifications') ||
      event.reason.includes('ResizeObserver loop limit exceeded')
    )
  );
  
  if (isResizeObserverRejection) {
    event.preventDefault();
  }
});

export default function setupResizeObserverFix() {
  // Este arquivo já executa o setup quando importado
}
