// Script simples para inicializar FAQ da Home via Firebase Admin
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'maiatur'
});

const db = admin.firestore();

const homeFAQData = {
  title: 'Perguntas Frequentes',
  subtitle: 'Encontre respostas para as dúvidas mais comuns',
  faq: [
    {
      pergunta: 'Como faço uma reserva?',
      resposta: 'Você pode fazer sua reserva através do nosso WhatsApp clicando no botão "Reservar por WhatsApp" ou entrando em contato conosco diretamente.'
    },
    {
      pergunta: 'Quais formas de pagamento vocês aceitam?',
      resposta: 'Aceitamos Pix e TED para pagamento da entrada (30% de garantia). O restante (70%) é pago pessoalmente no momento do serviço.'
    },
    {
      pergunta: 'O transfer é privativo ou compartilhado?',
      resposta: 'Todos os nossos transfers são privativos. Você reserva o veículo inteiro com motorista exclusivo para você e seus acompanhantes.'
    },
    {
      pergunta: 'Posso escolher o horário do transfer?',
      resposta: 'Sim! Você pode escolher a data e horário mais convenientes para você. Basta informar no momento da reserva.'
    },
    {
      pergunta: 'Vocês fazem transfer para Beberibe?',
      resposta: 'Sim, oferecemos transfer exclusivo para Beberibe com motorista privativo. Consulte nossos valores e condições.'
    }
  ]
};

async function init() {
  try {
    console.log('🚀 Inicializando FAQ da Home no projeto maiatur...');
    await db.collection('content').doc('homeFAQ').set(homeFAQData);
    console.log('✅ FAQ da Home inicializada com sucesso!');
    console.log('📊 Campos configurados:\n');
    console.log('   1. Título:', homeFAQData.title);
    console.log('   2. Subtítulo:', homeFAQData.subtitle);
    console.log('   3. Número de perguntas:', homeFAQData.faq.length, '\n');
    homeFAQData.faq.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.pergunta}`);
    });
    console.log('\n🎯 Acesse /admin/edit-home-faq para gerenciar!');
    console.log('💡 Você pode adicionar, remover e reordenar perguntas no painel administrativo.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

init();
