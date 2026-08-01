/**
 * Script para adicionar um novo usuário admin ao Firebase Authentication E Firestore
 * Execute com: node scripts/addAdminUser.js
 * 
 * REQUISITOS:
 * 1. Instale o Firebase Admin SDK: npm install firebase-admin
 * 2. Baixe a chave de serviço do Firebase Console:
 *    - Vá para Project Settings > Service Accounts
 *    - Clique em "Generate New Private Key"
 *    - Salve como service-account-key.json na raiz do projeto
 * 3. NÃO commitar a chave de serviço no Git (adicionar ao .gitignore)
 */

const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

// Dados do novo usuário
const newUser = {
  email: 'mateusprodev@gmail.com',
  password: 'admin123@#$',
  displayName: 'MateusProDev Admin',
  name: 'MateusProDev Admin'
};

async function createAdminUser() {
  try {
    console.log('🔐 Criando usuário admin...');
    
    // 1. Criar usuário no Firebase Authentication
    console.log('📧 Criando usuário no Firebase Authentication...');
    const userRecord = await auth.createUser({
      email: newUser.email,
      password: newUser.password,
      displayName: newUser.displayName,
      emailVerified: false
    });

    console.log('✅ Usuário criado no Firebase Authentication!');
    console.log('📧 Email:', userRecord.email);
    console.log('👤 UID:', userRecord.uid);
    console.log('📛 Display Name:', userRecord.displayName);
    
    // 2. Adicionar usuário na coleção authorizedUsers do Firestore
    console.log('\n📝 Adicionando usuário na coleção authorizedUsers...');
    await db.collection('authorizedUsers').doc(userRecord.uid).set({
      email: newUser.email,
      authorized: true,
      name: newUser.name,
      requestedAt: new Date().toISOString()
    });

    console.log('✅ Usuário adicionado no Firestore com sucesso!');
    
    // Opcional: Definir custom claims para marcar como admin
    // await auth.setCustomUserClaims(userRecord.uid, { admin: true });
    // console.log('👑 Claims admin definidos');

    console.log('\n✨ Usuário criado completamente!');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('- A senha foi definida como:', newUser.password);
    console.log('- Recomenda-se que o usuário altere a senha no primeiro login');
    console.log('- Para verificar o email, use: auth.generateEmailVerificationLink(userRecord.email)');
    console.log('- O usuário já está autorizado a acessar o painel administrativo');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  Este email já está cadastrado no Firebase Authentication');
      console.log('💡 Verificando se está autorizado no Firestore...');
      
      // Verificar se já está no Firestore
      const snapshot = await db.collection('authorizedUsers')
        .where('email', '==', newUser.email)
        .get();
      
      if (snapshot.empty) {
        console.log('❌ Usuário não está autorizado no Firestore');
        console.log('💡 Adicionando autorização no Firestore...');
        
        // Buscar o UID do usuário existente
        const existingUser = await auth.getUserByEmail(newUser.email);
        
        await db.collection('authorizedUsers').doc(existingUser.uid).set({
          email: newUser.email,
          authorized: true,
          name: newUser.name,
          requestedAt: new Date().toISOString()
        });
        
        console.log('✅ Usuário autorizado no Firestore!');
      } else {
        console.log('✅ Usuário já está autorizado no Firestore');
      }
    }
  } finally {
    process.exit(0);
  }
}

createAdminUser();
