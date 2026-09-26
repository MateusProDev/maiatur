import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    const isChunkLoadError = /ChunkLoadError|Loading chunk \d+ failed|dynamically imported module|importing a module script failed/i
      .test(`${error?.name || ''} ${error?.message || error}`);

    if (isChunkLoadError) {
      const retryKey = 'chunk-load-retry-at';
      const retryWindow = 60 * 1000;

      try {
        const lastRetry = Number(sessionStorage.getItem(retryKey) || 0);
        if (Date.now() - lastRetry > retryWindow) {
          sessionStorage.setItem(retryKey, String(Date.now()));
          window.location.reload();
        }
      } catch (storageError) {
        console.warn('Não foi possível verificar a tentativa de recuperação do chunk:', storageError);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          border: '1px solid #ff4444',
          borderRadius: '8px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          textAlign: 'center',
          margin: '20px'
        }}>
          <h3>🚫 Ops! Algo deu errado</h3>
          <p>Ocorreu um erro inesperado. Por favor, recarregue a página.</p>
          <details style={{ textAlign: 'left', marginTop: '10px' }}>
            <summary>Detalhes técnicos</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
