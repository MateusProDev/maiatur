/**
 * Script para solicitar re-indexação automática via Google Indexing API
 * 
 * SETUP (Execute UMA VEZ):
 * 1. Acesse: https://console.cloud.google.com/apis/credentials
 * 2. Crie um projeto ou selecione existente
 * 3. Ative a "Indexing API"
 * 4. Crie uma Service Account
 * 5. Baixe a chave JSON (credentials.json)
 * 6. Coloque credentials.json nesta pasta
 * 7. Execute: npm install googleapis
 * 8. No Search Console, adicione o email da Service Account como proprietário
 * 
 * USO:
 * node request-indexing.js [url1] [url2] ... (opcional - se não passar URLs, usa as padrão)
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// URLs para solicitar indexação (ordem de prioridade)
let URLS_TO_INDEX = [
  'https://transferfortalezatur.com.br/',                    // Home - PRIORIDADE MÁXIMA
  'https://transferfortalezatur.com.br/contato',             // Estava aparecendo errado
  'https://transferfortalezatur.com.br/sobre',
  'https://transferfortalezatur.com.br/pacotes',
  'https://transferfortalezatur.com.br/destinos',
  'https://transferfortalezatur.com.br/blog',
  'https://transferfortalezatur.com.br/avaliacoes',
  'https://transferfortalezatur.com.br/categoria/passeio',
  'https://transferfortalezatur.com.br/categoria/transfer',
  'https://transferfortalezatur.com.br/categoria/beach-park'
];

// Se argumentos forem passados na linha de comando, use eles
if (process.argv.length > 2) {
  URLS_TO_INDEX = process.argv.slice(2);
}

// Tipo de notificação
const NOTIFICATION_TYPE = 'URL_UPDATED'; // ou 'URL_DELETED' para remover

async function requestIndexing() {
  try {
    // 1. Verificar se credentials.json existe
    const credentialsPath = path.join(__dirname, 'credentials.json');
    
    if (!fs.existsSync(credentialsPath)) {
      console.error('❌ ERRO: Arquivo credentials.json não encontrado!');
      console.log('\n📋 SETUP NECESSÁRIO:');
      console.log('1. Acesse: https://console.cloud.google.com/apis/credentials');
      console.log('2. Crie um projeto Google Cloud');
      console.log('3. Ative a "Indexing API"');
      console.log('4. Crie uma Service Account');
      console.log('5. Baixe a chave JSON');
      console.log('6. Renomeie para "credentials.json"');
      console.log('7. Coloque nesta pasta: ' + __dirname);
      console.log('\n8. No Google Search Console:');
      console.log('   - Vá em Configurações → Usuários e permissões');
      console.log('   - Adicione o email da Service Account como proprietário');
      console.log('\n9. Execute: npm install googleapis');
      console.log('10. Execute novamente: node request-indexing.js\n');
      process.exit(1);
    }

    // 2. Carregar credenciais
    const keyFileContent = fs.readFileSync(credentialsPath, 'utf8');
    const keyFile = JSON.parse(keyFileContent);
    
    console.log('🔐 Autenticando com Google...');
    console.log('📧 Service Account:', keyFile.client_email);
    console.log('');

    // 3. Criar cliente autenticado - usando o caminho do arquivo diretamente
    const jwtClient = new google.auth.JWT({
      email: keyFile.client_email,
      key: keyFile.private_key,
      scopes: ['https://www.googleapis.com/auth/indexing', 'https://www.googleapis.com/auth/webmasters'],
    });

    // 4. Autenticar
    await jwtClient.authorize();
    console.log('✅ Autenticação bem-sucedida!\n');

    // 5. Criar cliente da Indexing API
    const indexing = google.indexing({
      version: 'v3',
      auth: jwtClient
    });

    // 6. Solicitar indexação para cada URL
    console.log('📤 Solicitando indexação para', URLS_TO_INDEX.length, 'URLs...\n');
    
    const results = [];
    
    for (let i = 0; i < URLS_TO_INDEX.length; i++) {
      const url = URLS_TO_INDEX[i];
      
      try {
        console.log(`[${i + 1}/${URLS_TO_INDEX.length}] Processando: ${url}`);
        
        const response = await indexing.urlNotifications.publish({
          requestBody: {
            url: url,
            type: NOTIFICATION_TYPE
          }
        });

        console.log('   ✅ Sucesso! Status:', response.status);
        console.log('   📅 Notificação enviada em:', response.data.notifyTime || 'Agora');
        console.log('');

        results.push({
          url,
          status: 'success',
          data: response.data
        });

        // Aguardar 1 segundo entre requisições para não exceder rate limit
        if (i < URLS_TO_INDEX.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.log('   ❌ Erro:', error.message);
        console.log('');
        
        results.push({
          url,
          status: 'error',
          error: error.message
        });
      }
    }

    // 7. Resumo
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA OPERAÇÃO');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Sucesso: ${successful}/${URLS_TO_INDEX.length}`);
    console.log(`❌ Falhas: ${failed}/${URLS_TO_INDEX.length}`);
    
    if (failed > 0) {
      console.log('\n❌ URLs com erro:');
      results
        .filter(r => r.status === 'error')
        .forEach(r => console.log(`   - ${r.url}: ${r.error}`));
    }

    console.log('\n⏱️  PRÓXIMOS PASSOS:');
    console.log('1. Google vai rastrear as URLs em 24-48 horas');
    console.log('2. Verifique no Search Console: https://search.google.com/search-console');
    console.log('3. Em "URL Inspection", veja quando foi o último rastreamento');
    console.log('4. As mudanças aparecerão nos resultados em 2-7 dias\n');

    // 7. Enviar sitemap para o Search Console
    console.log('📤 Enviando sitemap para o Search Console...');
    try {
      const searchconsole = google.searchconsole({ version: 'v1', auth: jwtClient });
      await searchconsole.sitemaps.submit({
        siteUrl: 'https://transferfortalezatur.com.br',
        feedpath: 'sitemap.xml'
      });
      console.log('✅ Sitemap enviado com sucesso!');
    } catch (error) {
      console.log('❌ Erro ao enviar sitemap:', error.message);
      console.log('💡 Verifique se o projeto está associado no Search Console.');
    }

    // 8. Salvar log
    const logFile = path.join(__dirname, 'indexing-log.json');
    fs.writeFileSync(
      logFile,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        results
      }, null, 2)
    );
    
    console.log('📄 Log salvo em:', logFile);

  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error('\n🔍 Detalhes:', error);
    
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\n💡 Execute: npm install googleapis');
    }
    
    process.exit(1);
  }
}

// Executar
console.log('🚀 Iniciando solicitação de indexação...\n');
requestIndexing();
