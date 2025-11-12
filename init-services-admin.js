// Script simples para adicionar serviços via Firebase Admin
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'maiatur'
});

const db = admin.firestore();

const servicesData = {
  active: true,
  badge: 'Experiências Personalizadas',
  title: 'Nossos Serviços',
  subtitle: 'Cada detalhe pensado para tornar sua viagem perfeita',
  services: [
    {
      id: 1731340800000,
      title: 'Transfers & Receptivo',
      description: 'Transporte seguro do aeroporto ao hotel com conforto e pontualidade',
      image: '/aviaoservico.png',
      color: '#21A657',
      link: '/pacotes',
      linkText: 'Saiba mais'
    },
    {
      id: 1731340800001,
      title: 'Passeios Privativos',
      description: 'Experiências exclusivas com roteiros personalizados para você',
      image: '/jericoaquaraservico.png',
      color: '#EE7C35',
      link: '/pacotes',
      linkText: 'Saiba mais'
    },
    {
      id: 1731340800002,
      title: 'City Tours',
      description: 'Conheça as principais atrações e cultura local com nossos guias',
      image: '/fortalezacityservico.png',
      color: '#F8C144',
      link: '/pacotes',
      linkText: 'Saiba mais'
    }
  ]
};

async function init() {
  try {
    console.log('🚀 Iniciando no projeto maiatur...');
    await db.collection('content').doc('servicesSection').set(servicesData);
    console.log('✅ 3 serviços adicionados com sucesso!');
    console.log('   1. Transfers & Receptivo');
    console.log('   2. Passeios Privativos');
    console.log('   3. City Tours');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

init();
