/**
 * Script para atualizar lista de veículos e criar lista de destinos para transfer
 * Execute: node atualizar-veiculos-destinos.js
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

console.log('🔧 Configurando Firebase...');
console.log('📦 Project ID:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function atualizarListas() {
  try {
    console.log('\n📝 Atualizando lista de veículos...');
    
    // Nova lista de veículos (somente os 5 solicitados)
    const veiculos = [
      "Carro até 6 pessoas",
      "Van até 15 pessoas",
      "Transfer Executivo",
      "4x4",
      "Buggy"
    ];

    await setDoc(doc(db, 'listas', 'veiculos'), {
      items: veiculos,
      atualizadoEm: new Date().toISOString(),
    });

    console.log('✅ Lista de veículos atualizada!');
    console.log('📋 Veículos:', veiculos);

    console.log('\n📝 Criando lista de destinos para transfer...');
    
    // Lista de destinos para transfer (todos os destinos solicitados)
    const destinos = [
      "Trairi (Mundau/Flecheiras/Guajiru)",
      "Taiba",
      "Paracuru",
      "Lagoinha",
      "Jericoacoara",
      "Canoa Quebrada",
      "Ilha do Guajiru",
      "Icarai de Amontada",
      "Icapuí",
      "Fortim / Pontal de Maceió",
      "Cumbuco",
      "Fortaleza",
      "Cascavel",
      "Beberibe / Praia das Fontes",
      "Beach Park",
      "Aquiraz",
      "Sobral",
      "Parajuru",
      "Pecem",
      "Guaramiranga"
    ];

    await setDoc(doc(db, 'listas', 'destinos'), {
      tipo: "destinos",
      ativo: true,
      ordem: 3,
      items: destinos,
      atualizadoEm: new Date().toISOString(),
    });

    console.log('✅ Lista de destinos criada!');
    console.log('📋 Total de destinos:', destinos.length);
    console.log('\nDestinos:');
    destinos.forEach((destino, index) => {
      console.log(`  ${index + 1}. ${destino}`);
    });

    console.log('\n🎉 Atualização concluída com sucesso!');
    console.log('\n📌 Próximos passos:');
    console.log('   1. As páginas de transfer agora mostrarão apenas os 5 veículos');
    console.log('   2. A nova lista "destinos" está disponível para uso');
    console.log('   3. Você pode adicionar um campo "destino" nos formulários de transfer');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao atualizar listas:', error);
    console.error('💡 Verifique se o arquivo .env.local existe e está configurado corretamente');
    process.exit(1);
  }
}

atualizarListas();
