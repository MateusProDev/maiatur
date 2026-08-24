/**
 * Script de teste para funcionalidade de edição de categorias
 * Execute com: node scripts/test-categories-edit.js
 * 
 * Este script testa se:
 * 1. A coleção "content/categories" pode ser criada
 * 2. Os dados podem ser lidos e escritos
 * 3. A estrutura dos dados está correta
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuração do Firebase Admin SDK
let serviceAccountKey = null;

// Tentar carregar de variável de ambiente (produção/Vercel)
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    console.log('✅ Credenciais carregadas de FIREBASE_SERVICE_ACCOUNT_KEY');
  } catch (error) {
    console.error('❌ Erro ao parsear FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
    process.exit(1);
  }
}

// Tentar carregar de arquivo local (desenvolvimento)
if (!serviceAccountKey) {
  const serviceAccountPath = path.join(__dirname, '../service-account-key.json');
  if (fs.existsSync(serviceAccountPath)) {
    try {
      serviceAccountKey = require(serviceAccountPath);
      console.log('✅ Credenciais carregadas de service-account-key.json');
    } catch (error) {
      console.error('❌ Erro ao carregar service-account-key.json:', error.message);
      process.exit(1);
    }
  } else {
    console.error('❌ Arquivo service-account-key.json não encontrado na raiz do projeto');
    console.error('💡 Para configurar:');
    console.error('   1. Vá para Firebase Console > Project Settings > Service Accounts');
    console.error('   2. Clique em "Generate New Private Key"');
    console.error('   3. Salve como service-account-key.json na raiz do projeto');
    console.error('   4. NÃO commitar este arquivo (já está no .gitignore)');
    process.exit(1);
  }
}

// Inicializar Firebase Admin
let db;
try {
  if (serviceAccountKey) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey),
      projectId: process.env.FIREBASE_PROJECT_ID || 'maiatur'
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || 'maiatur'
    });
  }
  db = admin.firestore();
  console.log('✅ Firebase Admin inicializado com sucesso\n');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
  process.exit(1);
}

// Dados de teste iniciais
const testCategoriesData = {
  passeio: {
    nome: "Passeios e Experiências",
    descricao: "Descubra experiências únicas e passeios inesquecíveis"
  },
  transfer_chegada: {
    nome: "Transfers e Traslados",
    descricao: "Transporte confortável e seguro para todos os destinos"
  },
  transfer_saida: {
    nome: "Transfers e Traslados",
    descricao: "Transporte confortável e seguro para todos os destinos"
  },
  transfer_chegada_saida: {
    nome: "Transfers e Traslados",
    descricao: "Transporte confortável e seguro para todos os destinos"
  },
  transfer_entre_hoteis: {
    nome: "Transfers e Traslados",
    descricao: "Transporte confortável e seguro para todos os destinos"
  },
  beach_park: {
    nome: "Beach Park",
    descricao: "O maior parque aquático da América Latina"
  }
};

async function testCategoriesEdit() {
  console.log('='.repeat(80));
  console.log('  TESTE DE FUNCIONALIDADE DE EDIÇÃO DE CATEGORIAS');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Teste 1: Criar dados iniciais
    console.log('📝 Teste 1: Criando dados iniciais das categorias...');
    const categoriesRef = db.collection('content').doc('categories');
    await categoriesRef.set(testCategoriesData);
    console.log('✅ Dados iniciais criados com sucesso\n');

    // Teste 2: Ler dados
    console.log('📖 Teste 2: Lendo dados das categorias...');
    const doc = await categoriesRef.get();
    if (doc.exists) {
      const data = doc.data();
      console.log('✅ Dados lidos com sucesso');
      console.log('📊 Estrutura dos dados:');
      Object.keys(data).forEach(key => {
        console.log(`   • ${key}:`);
        console.log(`     - nome: "${data[key].nome}"`);
        console.log(`     - descricao: "${data[key].descricao}"`);
      });
      console.log('');
    } else {
      console.log('❌ Documento não encontrado');
      process.exit(1);
    }

    // Teste 3: Atualizar dados
    console.log('✏️  Teste 3: Atualizando dados das categorias...');
    const updatedData = {
      ...testCategoriesData,
      passeio: {
        nome: "Passeios e Experiências (ATUALIZADO)",
        descricao: "Descubra experiências únicas e passeios inesquecíveis (ATUALIZADO)"
      }
    };
    await categoriesRef.set(updatedData);
    console.log('✅ Dados atualizados com sucesso\n');

    // Teste 4: Verificar atualização
    console.log('🔍 Teste 4: Verificando atualização...');
    const updatedDoc = await categoriesRef.get();
    if (updatedDoc.exists) {
      const updatedDataRead = updatedDoc.data();
      if (updatedDataRead.passeio.nome.includes('ATUALIZADO')) {
        console.log('✅ Atualização verificada com sucesso');
        console.log(`   Novo nome: "${updatedDataRead.passeio.nome}"`);
        console.log(`   Nova descrição: "${updatedDataRead.passeio.descricao}"`);
      } else {
        console.log('❌ Atualização não foi aplicada');
        process.exit(1);
      }
    } else {
      console.log('❌ Documento não encontrado após atualização');
      process.exit(1);
    }

    // Restaurar dados originais
    console.log('\n🔄 Restaurando dados originais...');
    await categoriesRef.set(testCategoriesData);
    console.log('✅ Dados originais restaurados\n');

    console.log('='.repeat(80));
    console.log('  ✅ TODOS OS TESTES PASSARAM!');
    console.log('='.repeat(80));
    console.log('');
    console.log('📝 PRÓXIMOS PASSOS:');
    console.log('  1. Acesse o painel admin: /admin');
    console.log('  2. Clique em "Categorias" no dashboard');
    console.log('  3. Edite os títulos e descrições das categorias');
    console.log('  4. Verifique as mudanças nas páginas de categoria');
    console.log('');
    console.log('🎯 FUNCIONALIDADE PRONTA PARA USO!');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRO DURANTE TESTE:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar teste
testCategoriesEdit();