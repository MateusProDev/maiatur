// Script para adicionar admin ao sistema
// Uso: node scripts/addAdmin.js

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Carregar credenciais do service account
const serviceAccount = require('./service-account-key.json');

// Inicializar Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

async function addAdmin() {
  const email = 'mateoferreira0812@gmail.com';
  
  try {
    // Verificar se o email já está autorizado
    const snapshot = await db.collection('authorizedUsers')
      .where('email', '==', email)
      .get();
    
    if (!snapshot.empty) {
      console.log('❌ Email já está autorizado como admin');
      return;
    }
    
    // Adicionar novo admin
    await db.collection('authorizedUsers').add({
      email: email,
      authorized: true,
      createdAt: new Date(),
      createdAt: new Date()
    });
    
    console.log(`✅ Admin adicionado com sucesso: ${email}`);
    console.log('📧 O usuário pode usar "Esqueci minha senha" para criar a senha no painel de login');
  } catch (error) {
    console.error('❌ Erro ao adicionar admin:', error);
  }
}

addAdmin();
