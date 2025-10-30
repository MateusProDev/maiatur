// Script de teste de conexão com Firestore
require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Configuração do Firebase
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

async function testarConexao() {
  try {
    console.log('\n🔍 Testando busca de passeios...');
    const passeiosRef = doc(db, 'listas', 'passeios');
    const passeiosSnap = await getDoc(passeiosRef);
    
    if (passeiosSnap.exists()) {
      const data = passeiosSnap.data();
      console.log('✅ Documento "passeios" encontrado!');
      console.log('📋 Items:', data.items);
      console.log('🕒 Atualizado em:', data.atualizadoEm);
    } else {
      console.log('❌ Documento "passeios" NÃO encontrado!');
      console.log('⚠️  Execute o Inicializador em /admin/inicializador');
    }

    console.log('\n🔍 Testando busca de veículos...');
    const veiculosRef = doc(db, 'listas', 'veiculos');
    const veiculosSnap = await getDoc(veiculosRef);
    
    if (veiculosSnap.exists()) {
      const data = veiculosSnap.data();
      console.log('✅ Documento "veiculos" encontrado!');
      console.log('📋 Items:', data.items);
      console.log('🕒 Atualizado em:', data.atualizadoEm);
    } else {
      console.log('❌ Documento "veiculos" NÃO encontrado!');
      console.log('⚠️  Execute o Inicializador em /admin/inicializador');
    }

    console.log('\n🔍 Listando todos os documentos em "listas"...');
    const listasRef = collection(db, 'listas');
    const listasSnap = await getDocs(listasRef);
    
    console.log(`📦 Total de documentos encontrados: ${listasSnap.size}`);
    listasSnap.forEach((doc) => {
      console.log(`  - ${doc.id}:`, Object.keys(doc.data()));
    });

    console.log('\n✅ Teste concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error);
    process.exit(1);
  }
}

testarConexao();
