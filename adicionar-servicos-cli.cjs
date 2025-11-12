const { spawn } = require('child_process');
const fs = require('fs');

// Dados dos 3 serviços
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

console.log('🚀 Criando arquivo temporário com os dados...');
fs.writeFileSync('temp-services.json', JSON.stringify(servicesData, null, 2));

console.log('📤 Enviando para Firestore via Firebase CLI...');
console.log('📍 Projeto: maiatur');
console.log('📄 Documento: content/servicesSection\n');

// Usar Firebase REST API com autenticação do CLI
const firebaseCmd = spawn('firebase', [
  'firestore',
  'set',
  'content/servicesSection',
  'temp-services.json',
  '--project',
  'maiatur'
], { shell: true });

firebaseCmd.stdout.on('data', (data) => {
  console.log(data.toString());
});

firebaseCmd.stderr.on('data', (data) => {
  console.error(data.toString());
});

firebaseCmd.on('close', (code) => {
  // Limpar arquivo temporário
  fs.unlinkSync('temp-services.json');
  
  if (code === 0) {
    console.log('\n✅ 3 serviços adicionados com sucesso!');
    console.log('   1. Transfers & Receptivo (verde #21A657)');
    console.log('   2. Passeios Privativos (laranja #EE7C35)');
    console.log('   3. City Tours (amarelo #F8C144)');
    console.log('\n🎯 Acesse /admin/services para gerenciar!');
  } else {
    console.error('\n❌ Erro ao adicionar serviços. Código:', code);
    console.log('\n💡 Adicione manualmente no Firebase Console:');
    console.log('https://console.firebase.google.com/project/maiatur/firestore');
  }
  process.exit(code);
});
