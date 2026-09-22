const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const SITE_URL = (process.env.REACT_APP_SITE_URL || process.env.SITE_URL || 'https://transferfortalezatur.com.br').replace(/\/$/, '');
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

function loadCredentials() {
  if (process.env.GOOGLE_INDEXING_CREDENTIALS) {
    return JSON.parse(process.env.GOOGLE_INDEXING_CREDENTIALS);
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'credentials.json');
  if (!fs.existsSync(credentialsPath)) return null;

  return JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
}

async function fetchSitemap() {
  const response = await fetch(`${SITEMAP_URL}?deploy=${Date.now()}`, {
    headers: { Accept: 'application/xml' }
  });

  if (!response.ok) {
    throw new Error(`Sitemap respondeu HTTP ${response.status}`);
  }

  const xml = await response.text();
  if (!xml.includes('<urlset') || !xml.includes('<loc>')) {
    throw new Error('Sitemap publicado não contém um XML de URLs válido');
  }

  const packageCount = (xml.match(/\/pacote\//g) || []).length;
  const blogCount = (xml.match(/\/blog\//g) || []).length;
  console.log(`[Sitemap] Publicado e válido: ${packageCount} pacotes, ${blogCount} posts de blog.`);
}

async function submitSitemap() {
  const credentials = loadCredentials();
  if (!credentials) {
    console.warn('[Sitemap] Credenciais Google ausentes. Sitemap publicado, mas não foi submetido automaticamente.');
    console.warn('[Sitemap] Configure GOOGLE_INDEXING_CREDENTIALS no ambiente do deploy.');
    return;
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters']
  });

  await auth.authorize();
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  await searchconsole.sitemaps.submit({
    siteUrl: process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || SITE_URL,
    feedpath: SITEMAP_URL
  });

  console.log(`[Sitemap] Submetido ao Google Search Console: ${SITEMAP_URL}`);
}

(async () => {
  try {
    await fetchSitemap();
    await submitSitemap();
  } catch (error) {
    console.error(`[Sitemap] Falha na atualização pós-deploy: ${error.message}`);
    process.exitCode = 1;
  }
})();
