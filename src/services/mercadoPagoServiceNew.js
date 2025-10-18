// src/services/mercadoPagoService.js
import { mercadoPagoConfig, validateMercadoPagoConfig, isProduction } from '../config/mercadoPago';

class MercadoPagoService {
  constructor() {
    // Validar configuração na inicialização
    if (!validateMercadoPagoConfig()) {
      console.warn('⚠️ Mercado Pago não configurado corretamente');
    }
    
    // URL da API baseada no ambiente atual
    this.baseUrl = this.getBaseUrl();
      
    // Configurações do Mercado Pago
    this.config = mercadoPagoConfig;
    
    console.log('🌐 Base URL configurada:', this.baseUrl);
  }

  getBaseUrl() {
    // Se estiver em produção, usar o domínio atual
    if (typeof window !== 'undefined') {
      const currentDomain = window.location.origin;
      
      // Se está no domínio de produção (domínio antigo mantido para compatibilidade)
      if (currentDomain.includes('20buscarvacationbeach.com.br') || currentDomain.includes('maiatur.com')) {
        return `${currentDomain}/api`;
      }
      
      // Se está em desenvolvimento local
      if (currentDomain.includes('localhost')) {
        return '/api';
      }
    }
    
    // Fallback para Vercel
    return '/api';
  }

  async createPaymentPreference(data) {
    try {
      // Para desenvolvimento local, usar integração direta do Mercado Pago
      if (process.env.NODE_ENV === 'development') {
        return await this.createLocalPaymentPreference(data);
      }

      // Para produção, usar a API da Vercel
      const response = await fetch(`${this.baseUrl}/mercadopago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar preferência');
      }

      return {
        id: result.preference_id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point
      };
      
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      throw new Error('Falha ao processar pagamento. Tente novamente.');
    }
  }

  // Método para desenvolvimento local
  async createLocalPaymentPreference(data) {
    try {
      // Importar dinamicamente o SDK do Mercado Pago para uso local
      const { MercadoPagoConfig, Preference } = await import('mercadopago');
      
      const client = new MercadoPagoConfig({
        accessToken: this.config.accessToken,
        options: { timeout: 5000 }
      });

      const preference = new Preference(client);
      
      const { valor, metodoPagamento, packageData, reservaData } = data;
      
      // Calcular valor com desconto PIX
      const valorFinal = metodoPagamento === 'pix' ? valor * 0.95 : valor;

      const preferenceData = {
        items: [
          {
            id: packageData?.id || 'viagem',
            title: `Sinal - ${packageData?.titulo || 'Viagem'}`,
            description: `Pagamento do sinal para viagem. Passageiro: ${reservaData?.nomePassageiro || 'N/A'}`,
            quantity: 1,
            unit_price: valorFinal,
            currency_id: 'BRL',
          }
        ],
        payer: {
          name: reservaData?.nomePassageiro || 'Cliente',
          email: reservaData?.email || 'cliente@exemplo.com',
          phone: {
            area_code: '11',
            number: reservaData?.telefone?.replace(/\D/g, '') || '999999999'
          }
        },
        back_urls: {
          success: `${window.location.origin}/pagamento/sucesso`,
          failure: `${window.location.origin}/pagamento/erro`,
          pending: `${window.location.origin}/pagamento/pendente`
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_types: [],
          installments: 12,
        },
        statement_descriptor: 'AGENCIA_VIAGENS',
        external_reference: `reserva_${Date.now()}`,
      };

      // Configurar métodos de pagamento baseado na escolha
      if (metodoPagamento === 'pix') {
        // Para PIX: permitir apenas Pix
        preferenceData.payment_methods = {
          excluded_payment_types: [
            { id: 'credit_card' },
            { id: 'debit_card' },
            { id: 'ticket' }
          ],
          excluded_payment_methods: [],
          installments: 1
        };
      } else {
        // Para cartão: permitir cartões e parcelamento
        preferenceData.payment_methods = {
          excluded_payment_types: [
            { id: 'pix' }
          ],
          excluded_payment_methods: [],
          installments: 12
        };
      }

      const result = await preference.create({ body: preferenceData });
      
      return {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point
      };
      
    } catch (error) {
      console.error('Erro ao criar preferência local:', error);
      throw new Error('Falha ao processar pagamento localmente.');
    }
  }

  async verifyPayment(paymentId) {
    try {
      const response = await fetch(`${this.baseUrl}/payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      throw new Error('Falha ao verificar pagamento.');
    }
  }
}

const mercadoPagoService = new MercadoPagoService();
export default mercadoPagoService;
