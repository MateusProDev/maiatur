/**
 * Script para adicionar categoria manualmente ao pacote Beach Park
 * Execute: node adicionar-categoria-beach-park.js
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

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

async function adicionarCategoria() {
  try {
    const pacoteId = 'qehs9dciuH8m0O3sMrdB';
    
    console.log('\n🔍 Buscando pacote Beach Park...');
    const pacoteRef = doc(db, 'pacotes', pacoteId);
    const pacoteSnap = await getDoc(pacoteRef);
    
    if (!pacoteSnap.exists()) {
      console.log('❌ Pacote não encontrado!');
      process.exit(1);
    }
    
    const dados = pacoteSnap.data();
    console.log('✅ Pacote encontrado:', dados.titulo);
    console.log('📋 Categoria atual:', dados.categoria || 'SEM CATEGORIA');
    
    if (dados.categoria) {
      console.log('⚠️  Pacote já tem categoria. Nada a fazer.');
      process.exit(0);
    }
    
    console.log('\n🔄 Adicionando categoria "passeio"...');
    await updateDoc(pacoteRef, {
      categoria: 'passeio'
    });
    
    console.log('✅ Categoria adicionada com sucesso!');
    
    // Verificar
    const pacoteAtualizadoSnap = await getDoc(pacoteRef);
    const dadosAtualizados = pacoteAtualizadoSnap.data();
    console.log('✅ Verificação - Categoria:', dadosAtualizados.categoria);
    
    console.log('\n🎉 Migração concluída! Teste agora o formulário em /reservas/passeio');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
}

adicionarCategoria();
