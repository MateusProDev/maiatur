const fs = require('fs');
const path = require('path');
const http = require('http');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Detectar ambiente: usar puppeteer regular localmente, @sparticuz/chromium em produção
const isProduction = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
let puppeteer, chromium;

if (isProduction) {
  // Em produção (Vercel/AWS), usar @sparticuz/chromium
  puppeteer = require('puppeteer-core');
  chromium = require('@sparticuz/chromium').default;
} else {
  // Localmente, usar puppeteer regular
  puppeteer = require('puppeteer');
}

const BUILD_DIR = path.resolve(__dirname, '../build');
const SITE_URL = process.env.REACT_APP_SITE_URL || process.env.SITE_URL || 'https://transferfortalezatur.com.br';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID
};

// Rotas institucionais para prerender
const INSTITUTIONAL_ROUTES = [
  '/pacotes',
  '/contato',
  '/blog',
  '/politica',
  '/categoria/passeio',
  '/categoria/transfer'
];

/**
 * Seletores que só existem DEPOIS que o conteúdo real renderizou.
 * Esperar por eles (em vez de contar caracteres) garante que o HTML
 * capturado contém o conteúdo, e não a tela de carregamento.
 */
const CONTENT_SELECTORS = {
  '/pacotes': '.pacote-card-modern, .no-results-modern',
  '/blog': 'article, .blog-post-card, .no-results-modern',
  '/contato': 'form, main h1',
  '/politica': 'main h1, main h2',
  '/categoria/passeio': '.pacote-card-modern, .no-results-modern, main h1',
  '/categoria/transfer': '.pacote-card-modern, .no-results-modern, main h1'
};

async function getPublishedBlogRoutes() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('[prerender-institutional] Configuração pública do Firebase ausente; posts do blog não serão pré-renderizados.');
    return [];
  }

  try {
    const app = initializeApp(firebaseConfig, 'prerender-blog');
    const db = getFirestore(app);
    const postsSnapshot = await getDocs(query(
      collection(db, 'blogPosts'),
      where('published', '==', true)
    ));

    return postsSnapshot.docs
      .map((postDoc) => postDoc.data())
      .filter((post) => typeof post?.slug === 'string' && post.slug.trim())
      .map((post) => `/blog/${post.slug.trim()}`);
  } catch (error) {
    console.warn(`[prerender-institutional] Não foi possível buscar posts do blog: ${error.message}`);
    return [];
  }
}

/**
 * O index.html precisa estar na forma ORIGINAL (shell da SPA) para que o
 * React monte cada rota. Se o prerenderHome já tiver rodado, o shell foi
 * substituído pelo snapshot da home e nenhuma outra rota renderiza.
 */
function ensureOriginalShell() {
  const originalFile = path.join(BUILD_DIR, 'index.html.original');
  const indexFile = path.join(BUILD_DIR, 'index.html');

  if (fs.existsSync(originalFile)) {
    fs.copyFileSync(originalFile, indexFile);
    console.log('[prerender-institutional] index.html restaurado do original para servir o shell da SPA.');
  }
}

function assertHtmlHasSeoContent(html, route) {
  const hasCanonical = /<link[^>]+rel="canonical"/i.test(html);
  const hasOgTitle = /property="og:title"/i.test(html);
  const hasOgDescription = /property="og:description"/i.test(html);
  const hasTwitterTitle = /name="twitter:title"/i.test(html);
  const hasTwitterDescription = /name="twitter:description"/i.test(html);
  const hasH1 = /<h1[^>]*>/i.test(html);

  const problems = [];
  if (!hasCanonical) problems.push('canonical');
  if (!hasOgTitle) problems.push('og:title');
  if (!hasOgDescription) problems.push('og:description');
  if (!hasTwitterTitle) problems.push('twitter:title');
  if (!hasTwitterDescription) problems.push('twitter:description');
  if (!hasH1) problems.push('<h1>');

  if (problems.length > 0) {
    console.warn(`[prerender-institutional] ${route}: ausente -> ${problems.join(', ')}`);
  }

  return problems.length === 0;
}

async function runPrerenderInstitutional() {
  if (!fs.existsSync(BUILD_DIR)) {
    throw new Error('Build da CRA ainda não existe em build/. Execute o build antes do prerender.');
  }

  ensureOriginalShell();

  const indexHtmlPath = path.join(BUILD_DIR, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error('index.html não encontrado em build/. Execute "npm run build" antes do prerender para gerar os arquivos de build.');
  }

  const server = http.createServer((req, res) => {
    try {
      const rawUrl = decodeURIComponent(req.url || '/').split('?')[0];
      const pathname = rawUrl === '/' ? '/index.html' : rawUrl;
      const requestedPath = path.normalize(path.join(BUILD_DIR, pathname));

      if (!requestedPath.startsWith(BUILD_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
        const ext = path.extname(requestedPath).toLowerCase();
        const contentType = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon'
        }[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(fs.readFileSync(requestedPath));
      } else {
        // Fallback para SPA routing (sempre o shell original)
        const fallback = path.join(BUILD_DIR, 'index.html');
        if (!fs.existsSync(fallback)) {
          console.error('[prerender-institutional] index.html não encontrado para fallback');
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(fallback));
      }
    } catch (error) {
      console.error('[prerender-institutional] erro no servidor estático:', error);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end('Internal error');
      }
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const blogRoutes = await getPublishedBlogRoutes();
  const routes = [...INSTITUTIONAL_ROUTES, ...blogRoutes];
  console.log(`[prerender-institutional] ${blogRoutes.length} posts do blog serão pré-renderizados.`);

  // Configurar browser baseado no ambiente
  let browser;
  if (isProduction) {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });
  } else {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  const results = { ok: [], failed: [] };

  try {
    for (const route of routes) {
      const page = await browser.newPage({ waitUntil: 'load', timeout: 60000 });

      try {
        const url = `http://127.0.0.1:${port}${route}`;
        console.log(`[prerender-institutional] visitando ${route}`);

        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });

        if (!response || response.status() < 200 || response.status() >= 400) {
          const msg = `${route} retornou status ${response ? response.status() : 'sem status'}`;
          console.warn(`[prerender-institutional] ${msg}`);
          results.failed.push(msg);
          await page.close();
          continue;
        }

        const isBlogPost = route.startsWith('/blog/');

        if (isBlogPost) {
          await page.waitForFunction(() => {
            const heading = document.querySelector('.blog-post-page h1');
            const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
            const ogType = document.querySelector('meta[property="og:type"]')?.content || '';
            return Boolean(heading && heading.textContent.trim() && ogTitle && ogType === 'article');
          }, { timeout: 30000 });
        } else {
          /* Espera pelo seletor de CONTEÚDO REAL da rota.
             Só depois que um card/seção/título existir é que capturamos —
             assim a tela de carregamento nunca entra no HTML salvo. */
          const selector = CONTENT_SELECTORS[route] || 'h1';
          await page.waitForSelector(selector, { timeout: 30000 });

          /* Confirma que o estado de carregamento saiu de cena. */
          await page.waitForFunction(() => {
            const bodyText = document.body ? document.body.innerText : '';
            const isLoading = /carregando/i.test(bodyText);
            return !isLoading && String(bodyText).trim().length > 200;
          }, { timeout: 20000 });
        }

        // Margem curta para imagens/metadados assentarem
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const html = await page.evaluate(() => document.documentElement.outerHTML);

        if (!html || !html.includes('<html')) {
          const msg = `${route} produziu HTML inválido`;
          console.warn(`[prerender-institutional] ${msg}`);
          results.failed.push(msg);
          await page.close();
          continue;
        }

        /* Falha explícita: HTML com tela de carregamento não deve ser salvo. */
        const hasLoadingScreen = /Carregando\s+(pacotes|post|detalhes)/i.test(html);
        if (hasLoadingScreen) {
          const msg = `${route}: HTML capturado ainda contém a tela de carregamento`;
          console.error(`[prerender-institutional] ${msg}`);
          results.failed.push(msg);
          await page.close();
          continue;
        }

        const seoValid = assertHtmlHasSeoContent(html, route);

        if (isBlogPost) {
          const socialTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i)?.[1] || '';
          const articleType = html.match(/<meta[^>]+property="og:type"[^>]+content="([^"]*)"/i)?.[1] || '';
          if (!socialTitle || articleType !== 'article') {
            const msg = `${route}: metadados Open Graph do artigo não carregaram antes da captura`;
            console.warn(`[prerender-institutional] ${msg}`);
            results.failed.push(msg);
            await page.close();
            continue;
          }
        }

        // Salvar arquivo prerenderizado
        let outFile;
        const routePath = route.slice(1); // remover /
        const routeDir = isBlogPost
          ? path.join(BUILD_DIR, routePath)
          : path.join(BUILD_DIR, path.dirname(routePath));
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }
        outFile = isBlogPost
          ? path.join(routeDir, 'index.html')
          : path.join(BUILD_DIR, routePath + '.html');

        fs.writeFileSync(outFile, html, 'utf8');
        console.log(`[prerender-institutional] ok ${route} -> ${outFile}`);
        console.log(`[prerender-institutional] HTML size: ${html.length} bytes`);
        if (!seoValid) {
          console.warn(`[prerender-institutional] ${route}: salvo, mas com metadados de SEO incompletos.`);
        }
        results.ok.push(route);
      } catch (error) {
        const msg = `${route}: ${error.message}`;
        console.error(`[prerender-institutional] erro no prerender de ${route}:`, error.message);
        results.failed.push(msg);
      } finally {
        await page.close();
      }
    }
  } catch (error) {
    console.error('[prerender-institutional] erro geral:', error.message);
    throw error;
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`[prerender-institutional] Sucesso: ${results.ok.length}`);
  console.log(`[prerender-institutional] Falhas: ${results.failed.length}`);
  if (results.failed.length > 0) {
    console.warn('[prerender-institutional] rotas com falha:');
    results.failed.forEach((entry) => console.warn(`  - ${entry}`));
  }

  /* Falhar o build quando páginas institucionais não foram geradas impede
     que um HTML incompleto seja publicado silenciosamente. */
  if (results.ok.length === 0) {
    throw new Error('PRERENDER INSTITUCIONAL FAILED: nenhuma página institucional foi gerada.');
  }

  if (results.failed.length > 0) {
    throw new Error(
      `PRERENDER INSTITUCIONAL FAILED: ${results.failed.length} rota(s) não foram pré-renderizadas. ` +
      `Sem elas o crawler recebe apenas o shell vazio da SPA. Detalhes: ${results.failed.join(' | ')}`
    );
  }
}

async function main() {
  console.log('[prerender-institutional] Iniciando prerender de páginas institucionais...');
  try {
    await runPrerenderInstitutional();
    console.log('[prerender-institutional] Prerender institucional concluído com sucesso');
  } catch (error) {
    console.error('[prerender-institutional] falha:', error.message);
    process.exitCode = 1;
    throw error;
  }
}

main().catch((error) => {
  console.error('[prerender-institutional] falha:', error);
  process.exitCode = 1;
});
