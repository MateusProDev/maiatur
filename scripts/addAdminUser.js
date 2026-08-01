/**
 * Script para adicionar um novo usuário admin ao Firebase Authentication
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
const serviceAccount = require('./service-account-key.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

// Dados do novo usuário
const newUser = {
  email: 'mateusprodev@gmail.com',
  password: 'admin123@#$',
  displayName: 'MateusProDev Admin'
};

async function createAdminUser() {
  try {
    console.log('🔐 Criando usuário admin...');
    
    // Criar usuário
    const userRecord = await auth.createUser({
      email: newUser.email,
      password: newUser.password,
      displayName: newUser.displayName,
      emailVerified: false
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email:', userRecord.email);
    console.log('👤 UID:', userRecord.uid);
    console.log('📛 Display Name:', userRecord.displayName);
    
    // Opcional: Definir custom claims para marcar como admin
    // await auth.setCustomUserClaims(userRecord.uid, { admin: true });
    // console.log('👑 Claims admin definidos');

    console.log('\n⚠️  IMPORTANTE:');
    console.log('- A senha foi definida como:', newUser.password);
    console.log('- Recomenda-se que o usuário altere a senha no primeiro login');
    console.log('- Para verificar o email, use: auth.generateEmailVerificationLink(userRecord.email)');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  Este email já está cadastrado no Firebase Authentication');
      console.log('💡 Se precisar redefinir a senha, use o Firebase Console');
    }
  } finally {
    process.exit(0);
  }
}

createAdminUser();
