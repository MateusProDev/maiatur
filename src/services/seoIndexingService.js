/**
 * Serviço de Indexação Automática SEO
 * Integra com Google Indexing API para solicitar indexação automática
 * quando pacotes são criados, editados ou removidos
 * 
 * Este serviço usa o script existente request-indexing.js como base,
 * mas com integração automática via API calls.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://transferfortalezatur.com.br';

/**
 * Carrega credenciais do Google Indexing API
 * Prioriza variável de ambiente (Vercel) sobre arquivo local
 */
function loadCredentials() {
  // Em produção (Vercel): usa variável de ambiente
  if (process.env.GOOGLE_INDEXING_CREDENTIALS) {
    try {
      return JSON.parse(process.env.GOOGLE_INDEXING_CREDENTIALS);
    } catch (error) {
      console.error('[SEO Indexing] Erro ao parsear GOOGLE_INDEXING_CREDENTIALS:', error.message);
      return null;
    }
  }
  
  // Em desenvolvimento: usa arquivo local
  const credentialsPath = path.join(process.cwd(), 'credentials.json');
  
  if (!fs.existsSync(credentialsPath)) {
    console.warn('[SEO Indexing] credentials.json não encontrado. Indexação automática desabilitada.');
    return null;
  }
  
  try {
    const keyFileContent = fs.readFileSync(credentialsPath, 'utf8');
    return JSON.parse(keyFileContent);
  } catch (error) {
    console.error('[SEO Indexing] Erro ao carregar credenciais:', error);
    return null;
  }
}

/**
 * Autentica com Google usando JWT
 */
async function authenticate() {
  const keyFile = loadCredentials();
  
  if (!keyFile) {
    return null;
  }
  
  try {
    const jwtClient = new google.auth.JWT({
      email: keyFile.client_email,
      key: keyFile.private_key,
      scopes: ['https://www.googleapis.com/auth/indexing', 'https://www.googleapis.com/auth/webmasters'],
    });
    
    await jwtClient.authorize();
    console.log('[SEO Indexing] Autenticado com Google Indexing API');
    return jwtClient;
  } catch (error) {
    console.error('[SEO Indexing] Erro na autenticação:', error);
    return null;
  }
}

/**
 * Solicita indexação de uma URL específica
 * @param {string} url - URL para indexar
 * @param {string} type - 'URL_UPDATED' ou 'URL_DELETED'
 * @returns {Promise<boolean>} - true se sucesso, false se falha
 */
async function requestIndexing(url, type = 'URL_UPDATED') {
  const auth = await authenticate();
  
  if (!auth) {
    console.warn('[SEO Indexing] Não foi possível autenticar. Pulando indexação.');
    return false;
  }
  
  try {
    const indexing = google.indexing({
      version: 'v3',
      auth: auth
    });
    
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: type
      }
    });
    
    console.log(`[SEO Indexing] ✅ ${type}: ${url} - Status: ${response.status}`);
    return true;
  } catch (error) {
    console.error(`[SEO Indexing] ❌ Erro ao solicitar indexação de ${url}:`, error.message);
    return false;
  }
}

/**
 * Solicita indexação de múltiplas URLs
 * @param {string[]} urls - Array de URLs para indexar
 * @param {string} type - 'URL_UPDATED' ou 'URL_DELETED'
 * @returns {Promise<{success: number, failed: number}>}
 */
async function requestMultipleIndexing(urls, type = 'URL_UPDATED') {
  const auth = await authenticate();
  
  if (!auth) {
    console.warn('[SEO Indexing] Não foi possível autenticar. Pulando indexação em lote.');
    return { success: 0, failed: urls.length };
  }
  
  let success = 0;
  let failed = 0;
  
  for (const url of urls) {
    const result = await requestIndexing(url, type);
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    // Aguardar 1 segundo entre requisições para não exceder rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`[SEO Indexing] Resumo: ${success} sucessos, ${failed} falhas`);
  return { success, failed };
}

/**
 * Notifica o Google sobre atualização do sitemap
 */
async function notifySitemapUpdate() {
  const auth = await authenticate();
  
  if (!auth) {
    console.warn('[SEO Indexing] Não foi possível autenticar. Pulando notificação de sitemap.');
    return false;
  }
  
  try {
    const searchconsole = google.searchconsole({ version: 'v1', auth: auth });
    await searchconsole.sitemaps.submit({
      siteUrl: SITE_URL,
      feedpath: 'sitemap.xml'
    });
    console.log('[SEO Indexing] ✅ Sitemap notificado ao Google Search Console');
    return true;
  } catch (error) {
    console.error('[SEO Indexing] ❌ Erro ao notificar sitemap:', error.message);
    return false;
  }
}

/**
 * Gera URL do pacote baseado no slug
 */
function getPacoteUrl(slug) {
  return `${SITE_URL}/pacote/${slug}`;
}

/**
 * Indexa um novo pacote (criação)
 * @param {string} slug - Slug do pacote
 */
async function indexPacoteCreated(slug) {
  const url = getPacoteUrl(slug);
  console.log(`[SEO Indexing] Indexando novo pacote: ${url}`);
  
  const success = await requestIndexing(url, 'URL_UPDATED');
  
  if (success) {
    // Notificar atualização do sitemap
    await notifySitemapUpdate();
  }
  
  return success;
}

/**
 * Indexa um pacote atualizado (edição)
 * @param {string} slug - Slug do pacote
 */
async function indexPacoteUpdated(slug) {
  const url = getPacoteUrl(slug);
  console.log(`[SEO Indexing] Indexando pacote atualizado: ${url}`);
  
  const success = await requestIndexing(url, 'URL_UPDATED');
  
  if (success) {
    // Notificar atualização do sitemap
    await notifySitemapUpdate();
  }
  
  return success;
}

/**
 * Notifica remoção de um pacote
 * @param {string} slug - Slug do pacote removido
 */
async function indexPacoteDeleted(slug) {
  const url = getPacoteUrl(slug);
  console.log(`[SEO Indexing] Notificando remoção de pacote: ${url}`);
  
  const success = await requestIndexing(url, 'URL_DELETED');
  
  if (success) {
    // Notificar atualização do sitemap
    await notifySitemapUpdate();
  }
  
  return success;
}

/**
 * Indexa todos os pacotes existentes (para migração inicial)
 * @param {string[]} slugs - Array de slugs dos pacotes
 */
async function indexAllPacotes(slugs) {
  console.log(`[SEO Indexing] Indexando ${slugs.length} pacotes em lote...`);
  
  const urls = slugs.map(slug => getPacoteUrl(slug));
  const result = await requestMultipleIndexing(urls, 'URL_UPDATED');
  
  if (result.success > 0) {
    await notifySitemapUpdate();
  }
  
  return result;
}

module.exports = {
  requestIndexing,
  requestMultipleIndexing,
  notifySitemapUpdate,
  indexPacoteCreated,
  indexPacoteUpdated,
  indexPacoteDeleted,
  indexAllPacotes,
  getPacoteUrl
};
