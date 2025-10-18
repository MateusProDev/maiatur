// Utilitário para suprimir erros conhecidos e não críticos

/**
 * Lista de padrões de erro que devem ser suprimidos
 */
const SUPPRESSED_ERROR_PATTERNS = [
  /ResizeObserver loop completed with undelivered notifications/,
  /ResizeObserver loop limit exceeded/,
  /Non-passive event listener/,
];

/**
 * Verifica se um erro deve ser suprimido
 * @param {string} errorMessage - Mensagem de erro
 * @returns {boolean} - True se deve ser suprimido
 */
const shouldSuppressError = (errorMessage) => {
  return SUPPRESSED_ERROR_PATTERNS.some(pattern => 
    pattern.test(errorMessage)
  );
};

/**
 * Configura supressão de erros não críticos
 */
export const setupErrorSuppression = () => {
  // Apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Suprimir console.error
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0]?.toString?.() || '';
    if (!shouldSuppressError(errorMessage)) {
      originalConsoleError.apply(console, args);
    }
  };

  // Suprimir window.onerror
  window.addEventListener('error', (event) => {
    if (shouldSuppressError(event.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  // Suprimir unhandledrejection para ResizeObserver
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.toString?.() || '';
    if (shouldSuppressError(errorMessage)) {
      event.preventDefault();
    }
  });

  console.log('🔧 Error suppression configurado para desenvolvimento');
};

export default setupErrorSuppression;
