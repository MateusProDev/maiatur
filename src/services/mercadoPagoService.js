// src/services/mercadoPagoService.js
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuração do Mercado Pago usando variáveis de ambiente
const client = new MercadoPagoConfig({
  accessToken: process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

// Classe para gerenciar pagamentos
export class MercadoPagoService {
  static preference = new Preference(client);

  // Criar preferência de pagamento PIX
  static async criarPagamentoPix(dadosReserva) {
    try {
      const body = {
        items: [
          {
            id: dadosReserva.pacoteId,
            title: `Sinal - ${dadosReserva.pacoteTitulo}`,
            description: `Pagamento de sinal para viagem - ${dadosReserva.clienteNome}`,
            category_id: 'travel',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: dadosReserva.valorSinal * 0.95 // 5% desconto PIX
          }
        ],
        payer: {
          name: dadosReserva.clienteNome,
          email: dadosReserva.clienteEmail,
          phone: {
            number: dadosReserva.clienteTelefone
          },
          identification: {
            type: 'CPF',
            number: dadosReserva.clienteCpf
          }
        },
        payment_methods: {
          excluded_payment_types: [
            { id: 'credit_card' },
            { id: 'debit_card' },
            { id: 'ticket' }
          ],
          installments: 1
        },
        back_urls: {
          success: `${process.env.REACT_APP_BASE_URL}/pagamento/sucesso`,
          failure: `${process.env.REACT_APP_BASE_URL}/pagamento/erro`,
          pending: `${process.env.REACT_APP_BASE_URL}/pagamento/pendente`
        },
        auto_return: 'approved',
        external_reference: `reserva_${Date.now()}_${dadosReserva.clienteId}`,
        statement_descriptor: 'FAVELA CHIQUE TURISMO',
        metadata: {
          cliente_id: dadosReserva.clienteId,
          pacote_id: dadosReserva.pacoteId,
          tipo_viagem: dadosReserva.tipoViagem,
          data_ida: dadosReserva.dataIda,
          metodo_pagamento: 'pix'
        }
      };

      const preference = await this.preference.create({ body });
      return {
        success: true,
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point
      };
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Criar preferência de pagamento Cartão
  static async criarPagamentoCartao(dadosReserva) {
    try {
      const body = {
        items: [
          {
            id: dadosReserva.pacoteId,
            title: `Sinal - ${dadosReserva.pacoteTitulo}`,
            description: `Pagamento de sinal para viagem - ${dadosReserva.clienteNome}`,
            category_id: 'travel',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: dadosReserva.valorSinal // Sem desconto para cartão
          }
        ],
        payer: {
          name: dadosReserva.clienteNome,
          email: dadosReserva.clienteEmail,
          phone: {
            number: dadosReserva.clienteTelefone
          },
          identification: {
            type: 'CPF',
            number: dadosReserva.clienteCpf
          }
        },
        payment_methods: {
          excluded_payment_types: [
            { id: 'ticket' }
          ],
          excluded_payment_methods: [
            { id: 'pix' }
          ],
          installments: 12
        },
        back_urls: {
          success: `${process.env.REACT_APP_BASE_URL}/pagamento/sucesso`,
          failure: `${process.env.REACT_APP_BASE_URL}/pagamento/erro`,
          pending: `${process.env.REACT_APP_BASE_URL}/pagamento/pendente`
        },
        auto_return: 'approved',
        external_reference: `reserva_${Date.now()}_${dadosReserva.clienteId}`,
        statement_descriptor: 'FAVELA CHIQUE TURISMO',
        metadata: {
          cliente_id: dadosReserva.clienteId,
          pacote_id: dadosReserva.pacoteId,
          tipo_viagem: dadosReserva.tipoViagem,
          data_ida: dadosReserva.dataIda,
          metodo_pagamento: 'cartao'
        }
      };

      const preference = await this.preference.create({ body });
      return {
        success: true,
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point
      };
    } catch (error) {
      console.error('Erro ao criar pagamento Cartão:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verificar status do pagamento
  static async verificarPagamento(paymentId) {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN}`
        }
      });
      
      const payment = await response.json();
      return {
        success: true,
        status: payment.status,
        statusDetail: payment.status_detail,
        payment
      };
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default MercadoPagoService;
