// Configuração do Mercado Pago
export const mercadoPagoConfig = {
  // Public Key (usado no frontend)
  publicKey: process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY,
  
  // Access Token (usado no backend/API calls)
  accessToken: process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN,
  
  // Client ID (para OAuth se necessário)
  clientId: process.env.REACT_APP_MERCADO_PAGO_CLIENT_ID,
  
  // Client Secret (NUNCA usar no frontend - apenas backend)
  // clientSecret: process.env.MERCADO_PAGO_CLIENT_SECRET, // Comentado por segurança
  
  // URLs de retorno (usando location dinâmico)
  urls: {
    get success() { return `${window.location.origin}/pagamento/sucesso`; },
    get failure() { return `${window.location.origin}/pagamento/erro`; },
    get pending() { return `${window.location.origin}/pagamento/pendente`; }
  },
  
  // Configurações padrão
  defaults: {
    currency: 'BRL',
    country: 'BR',
    locale: 'pt-BR'
  }
};

// Validação das credenciais
export const validateMercadoPagoConfig = () => {
  const errors = [];
  
  if (!mercadoPagoConfig.publicKey) {
    errors.push('REACT_APP_MERCADO_PAGO_PUBLIC_KEY não configurada');
  }
  
  if (!mercadoPagoConfig.accessToken) {
    errors.push('REACT_APP_MERCADO_PAGO_ACCESS_TOKEN não configurada');
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuração do Mercado Pago incompleta:', errors);
    return false;
  }
  
  console.log('✅ Configuração do Mercado Pago validada com sucesso');
  console.log('🔑 Public Key:', mercadoPagoConfig.publicKey?.substring(0, 20) + '...');
  console.log('🔒 Access Token:', mercadoPagoConfig.accessToken?.substring(0, 20) + '...');
  return true;
};

// Helper para verificar se está em modo de produção
export const isProduction = () => {
  return mercadoPagoConfig.publicKey?.startsWith('APP_USR-') && 
         mercadoPagoConfig.accessToken?.startsWith('APP_USR-');
};

// Helper para verificar se está em modo de teste
export const isTestMode = () => {
  return mercadoPagoConfig.publicKey?.startsWith('TEST-') && 
         mercadoPagoConfig.accessToken?.startsWith('TEST-');
};
