// Script simples para inicializar Transfer Beberibe via Firebase Admin
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'maiatur'
});

const db = admin.firestore();

const transferBeberibeData = {
  title: 'DETALHES DO TRANSFER',
  subtitle: 'Confira a seguir tudo sobre o Transfer Beberibe (privativo).',
  tripadvisorBadge: 'SOMOS EMPRESA TOP NO TRIPADVISOR E GOOGLE COM TODAS AVALIAÇÕES 5 ESTRELAS',
  tripadvisorLink: '',
  vehicleTitle: 'VOCÊ RESERVA O VEÍCULO INTEIRO (NÃO É POR PESSOA)',
  vehicleDescription: 'Reserve seu transfer privativo com motorista exclusivo para você e seus acompanhantes.',
  paymentTitle: '30% DE GARANTIA DE RESERVA + 70% RESTANTE PESSOALMENTE NO MOMENTO DO SERVIÇO',
  paymentDescription: 'Pague apenas 30% de entrada (reserva) via Pix ou TED, e o 70% restante pessoalmente no momento do serviço.',
  scheduleTitle: 'ESCOLHA A DATA E HORÁRIO MAIS CONVENIENTES PARA VOCÊ',
  scheduleDescription: 'Desfrute de mais!',
  whatsappButtonText: 'Reservar por WhatsApp',
  whatsappNumber: ''
};

async function init() {
  try {
    console.log('🚀 Inicializando seção Transfer Beberibe no projeto maiatur...');
    await db.collection('content').doc('transferBeberibe').set(transferBeberibeData);
    console.log('✅ Seção Transfer Beberibe inicializada com sucesso!');
    console.log('📊 Campos configurados:\n');
    console.log('   1. Título:', transferBeberibeData.title);
    console.log('   2. Subtítulo:', transferBeberibeData.subtitle);
    console.log('   3. Badge Tripadvisor:', transferBeberibeData.tripadvisorBadge);
    console.log('   4. Link Tripadvisor:', transferBeberibeData.tripadvisorLink || 'Não configurado');
    console.log('   5. Título Veículo:', transferBeberibeData.vehicleTitle);
    console.log('   6. Descrição Veículo:', transferBeberibeData.vehicleDescription);
    console.log('   7. Título Pagamento:', transferBeberibeData.paymentTitle);
    console.log('   8. Descrição Pagamento:', transferBeberibeData.paymentDescription);
    console.log('   9. Título Agendamento:', transferBeberibeData.scheduleTitle);
    console.log('  10. Descrição Agendamento:', transferBeberibeData.scheduleDescription);
    console.log('  11. Texto Botão WhatsApp:', transferBeberibeData.whatsappButtonText);
    console.log('  12. Número WhatsApp:', transferBeberibeData.whatsappNumber || 'Não configurado\n');
    console.log('🎯 Acesse /admin/edit-transfer-beberibe para gerenciar!');
    console.log('💡 Configure o número do WhatsApp no painel administrativo.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

init();
