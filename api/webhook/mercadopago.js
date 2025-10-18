// api/webhook/mercadopago.js - Webhook para confirmações de pagamento
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, addDoc, collection, getDocs, query, where } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Inicializar Firebase apenas se não estiver inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

const payment = new Payment(client);

export default async function handler(req, res) {
  // Health check simples para GET
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { type, data } = req.body;

    // Verificar se é uma notificação de pagamento
    if (type === 'payment') {
      const paymentId = data.id;
      try {
        // Buscar informações do pagamento
        const paymentInfo = await payment.get({ id: paymentId });

        if (paymentInfo.status === 'approved') {
          // Checar se já existe reserva com esse paymentId
          const reservasRef = collection(db, 'reservas');
          const q = query(reservasRef, where('paymentId', '==', paymentId));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            console.log('Reserva já existe para paymentId:', paymentId);
            return;
          }

          // Pagamento aprovado - salvar no Firestore
          const metadata = paymentInfo.metadata;
          const reservaData = JSON.parse(metadata.reserva_data || '{}');

          const reservaFinal = {
            ...reservaData,
            paymentId: paymentId,
            status: 'confirmada',
            statusPagamento: 'aprovado',
            metodoPagamento: metadata.metodo_pagamento,
            valorPago: paymentInfo.transaction_amount,
            valorOriginal: metadata.valor_original,
            dataPagamento: new Date(),
            mercadoPago: {
              paymentId: paymentId,
              status: paymentInfo.status,
              paymentMethodId: paymentInfo.payment_method_id,
              paymentTypeId: paymentInfo.payment_type_id,
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await addDoc(reservasRef, reservaFinal);
          console.log('Reserva salva com sucesso:', reservaFinal);
        }
      } catch (err) {
        console.error('Erro ao processar pagamento:', err);
      }
    }
    // Sempre retorna 200 para evitar retries do Mercado Pago
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    // Nunca retorna 500 para o Mercado Pago, sempre 200
    return res.status(200).json({ received: true, error: true });
  }
}
