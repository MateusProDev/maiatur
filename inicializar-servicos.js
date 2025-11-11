// Script para inicializar a seção de serviços no Firestore
// Execute com: node inicializar-servicos.js

const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
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

async function initializeServices() {
  try {
    console.log('🚀 Inicializando seção de serviços...');
    
    await db.collection('content').doc('servicesSection').set(servicesData);
    
    console.log('✅ Seção de serviços inicializada com sucesso!');
    console.log(`📊 ${servicesData.services.length} serviços cadastrados:`);
    servicesData.services.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.title}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar:', error);
    process.exit(1);
  }
}

initializeServices();
