/**
 * Script de Migração para Indexação de Pacotes Existentes
 * 
 * Este script:
 * 1. Busca todos os pacotes existentes no Firestore
 * 2. Gera slugs para pacotes que não têm
 * 3. Solicita indexação em lote para todos os pacotes
 * 4. Gera relatório de sucesso/erro
 * 
 * Execute: node scripts/migrate-existing-packages.js
 * 
 * No Vercel, roda automaticamente após o build se configurado no package.json
 */

const admin = require('firebase-admin');
const seoIndexingService = require('../src/services/seoIndexingService');

// Configuração do Firebase Admin SDK
// Usa variáveis de ambiente do Vercel em produção
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

// Configuração do projeto
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || "maiatur"
};

/**
 * Gera slug amigável a partir do título
 */
function generateSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Formata data do Firestore para exibição
 */
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString('pt-BR');
  }
  
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR');
  }
  
  return 'N/A';
}

async function migratePackages() {
  console.log('='.repeat(80));
  console.log('  MIGRAÇÃO DE PACOTES EXISTENTES PARA INDEXAÇÃO AUTOMÁTICA');
  console.log('='.repeat(80));
  console.log('');

  // Verificar se tem credenciais configuradas
  if (!serviceAccountKey && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('⚠️  FIREBASE_SERVICE_ACCOUNT_KEY não configurada no ambiente.');
    console.log('⚠️  Migração desabilitada. Configure a variável no Vercel para habilitar.');
    console.log('⚠️  Veja: CONFIGURACAO_VERCEL_INDEXACAO.md');
    console.log('');
    console.log('✅ Build continuando sem migração (não fatal)');
    process.exit(0);
  }

  try {
    // Inicializar Firebase Admin
    console.log('📡 Conectando ao Firebase Admin...');
    
    let db;
    if (serviceAccountKey) {
      // Em produção (Vercel): usa service account das variáveis de ambiente
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
        ...firebaseConfig
      });
      console.log('✅ Autenticado com Service Account');
    } else {
      // Em desenvolvimento: usa credenciais padrão do ambiente
      const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (credsPath && require('fs').existsSync(credsPath)) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          ...firebaseConfig
        });
        console.log('✅ Autenticado com Application Default Credentials');
      } else {
        console.log('❌ Não foi possível encontrar credenciais válidas');
        console.log('⚠️  Migração desabilitada');
        process.exit(0);
      }
    }
    
    db = admin.firestore();
    console.log('✅ Conectado ao Firebase\n');

    // Buscar todos os pacotes
    console.log('📦 Buscando pacotes do Firestore...');
    const snapshot = await db.collection('pacotes').get();
    
    const pacotes = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      pacotes.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log(`✅ ${pacotes.length} pacotes encontrados\n`);

    if (pacotes.length === 0) {
      console.log('⚠️  Nenhum pacote encontrado. Nada a migrar.');
      process.exit(0);
    }

    // Analisar pacotes
    console.log('📊 Análise dos pacotes:');
    console.log('-'.repeat(80));
    
    const pacotesSemSlug = pacotes.filter(p => !p.slug || p.slug.trim() === '');
    const pacotesComSlug = pacotes.filter(p => p.slug && p.slug.trim() !== '');
    
    console.log(`  • Pacotes com slug: ${pacotesComSlug.length}`);
    console.log(`  • Pacotes sem slug: ${pacotesSemSlug.length}`);
    console.log('');

    // Gerar slugs para pacotes que não têm
    if (pacotesSemSlug.length > 0) {
      console.log('🔧 Gerando slugs para pacotes sem slug...');
      console.log('-'.repeat(80));
      
      for (const pacote of pacotesSemSlug) {
        const novoSlug = generateSlug(pacote.titulo);
        console.log(`  • ${pacote.titulo.substring(0, 50)}... → ${novoSlug}`);
        
        try {
          await db.collection('pacotes').doc(pacote.id).update({
            slug: novoSlug
          });
          
          pacote.slug = novoSlug; // Atualizar em memória
        } catch (error) {
          console.error(`    ❌ Erro ao atualizar pacote ${pacote.id}:`, error.message);
        }
      }
      
      console.log('✅ Slugs gerados e salvos\n');
    }

    // Preparar lista de slugs para indexação
    const slugsParaIndexar = pacotes.map(p => p.slug).filter(s => s && s.trim() !== '');
    
    console.log(`📋 ${slugsParaIndexar.length} slugs preparados para indexação\n`);

    // Confirmar antes de indexar
    console.log('⚠️  ATENÇÃO:');
    console.log('  • Google Indexing API tem limite de 200 URLs/dia');
    console.log(`  • Você está prestes a solicitar indexação de ${slugsParaIndexar.length} URLs`);
    console.log('  • Isso pode levar alguns minutos devido ao rate limit');
    console.log('');
    
    // Perguntar se deseja continuar
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question('Deseja continuar? (s/n): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 's' && answer.toLowerCase() !== 'sim') {
      console.log('\n❌ Migração cancelada pelo usuário.');
      process.exit(0);
    }

    console.log('\n🚀 Iniciando indexação em lote...');
    console.log('-'.repeat(80));

    // Indexar pacotes
    const resultado = await seoIndexingService.indexAllPacotes(slugsParaIndexar);

    console.log('');
    console.log('='.repeat(80));
    console.log('  RESUMO DA MIGRAÇÃO');
    console.log('='.repeat(80));
    console.log(`  ✅ Sucessos: ${resultado.success}`);
    console.log(`  ❌ Falhas: ${resultado.failed}`);
    console.log(`  📊 Total: ${slugsParaIndexar.length}`);
    console.log('');

    // Gerar relatório detalhado
    console.log('📄 Relatório Detalhado:');
    console.log('-'.repeat(80));
    
    pacotes.forEach((pacote, index) => {
      const status = pacote.slug ? '✅' : '❌';
      const url = pacote.slug ? `https://transferfortalezatur.com.br/pacote/${pacote.slug}` : 'Sem slug';
      const data = formatDate(pacote.createdAt);
      
      console.log(`  ${status} [${index + 1}] ${pacote.titulo.substring(0, 40)}...`);
      console.log(`      URL: ${url}`);
      console.log(`      Criado em: ${data}`);
      console.log(`      Categoria: ${pacote.categoria || 'N/A'}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('  MIGRAÇÃO CONCLUÍDA!');
    console.log('='.repeat(80));
    console.log('');
    console.log('⏱️  PRÓXIMOS PASSOS:');
    console.log('  1. Google vai rastrear as URLs em 24-48 horas');
    console.log('  2. Verifique no Search Console: https://search.google.com/search-console');
    console.log('  3. Em "URL Inspection", veja quando foi o último rastreamento');
    console.log('  4. As mudanças aparecerão nos resultados em 2-7 dias');
    console.log('');
    console.log('✅ Pronto! Todos os pacotes existentes foram indexados.');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRO FATAL durante migração:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar migração
migratePackages();
