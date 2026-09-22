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
  '/',
  '/pacotes',
  '/destinos',
  '/contato',
  '/blog',
  '/politica',
  '/categoria/passeio',
  '/categoria/transfer'
];

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

function assertHtmlHasSeoContent(html, route) {
  const lowerHtml = html.toLowerCase();
  
  // Verificar canonical
  const hasCanonical = /<link[^>]+rel="canonical"/i.test(html);
  if (!hasCanonical) {
    console.warn(`[prerender-institutional] ${route}: canonical não encontrado`);
  }
  
  // Verificar og:title e og:description
  const hasOgTitle = /property="og:title"/i.test(html);
  const hasOgDescription = /property="og:description"/i.test(html);
  
  if (!hasOgTitle || !hasOgDescription) {
    console.warn(`[prerender-institutional] ${route}: OG tags incompletas (title: ${hasOgTitle}, description: ${hasOgDescription})`);
  }
  
  // Verificar twitter:title e twitter:description
  const hasTwitterTitle = /name="twitter:title"/i.test(html);
  const hasTwitterDescription = /name="twitter:description"/i.test(html);
  
  if (!hasTwitterTitle || !hasTwitterDescription) {
    console.warn(`[prerender-institutional] ${route}: Twitter tags incompletas (title: ${hasTwitterTitle}, description: ${hasTwitterDescription})`);
  }
  
  return hasCanonical && hasOgTitle && hasOgDescription && hasTwitterTitle && hasTwitterDescription;
}

async function runPrerenderInstitutional() {
  if (!fs.existsSync(BUILD_DIR)) {
    throw new Error('Build da CRA ainda não existe em build/. Execute o build antes do prerender.');
  }

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
        // Fallback para SPA routing
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
  
  try {
    for (const route of routes) {
      const page = await browser.newPage({ waitUntil: 'load', timeout: 60000 });
      
      try {
        const url = `http://127.0.0.1:${port}${route}`;
        console.log(`[prerender-institutional] visitando ${route}`);

        // Configurar timeout maior para carregar todos os dados
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });

        if (!response || response.status() < 200 || response.status() >= 400) {
          console.warn(`[prerender-institutional] ${route} retornou status ${response ? response.status() : 'sem status'}`);
          await page.close();
          continue;
        }

        // Esperar elementos essenciais carregarem
        await page.waitForFunction(() => {
          const body = document.body;
          const bodyText = body ? body.innerText : '';
          return Boolean(bodyText && String(bodyText).trim().length > 50);
        }, { timeout: 30000 });

        // Esperar um pouco mais para garantir que dados carregaram
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const html = await page.evaluate(() => document.documentElement.outerHTML);

        if (!html || !html.includes('<html')) {
          console.warn(`[prerender-institutional] ${route} produziu HTML inválido`);
          await page.close();
          continue;
        }

        const seoValid = assertHtmlHasSeoContent(html, route);

        if (!seoValid) {
          console.warn(`[prerender-institutional] ${route} tem problemas de SEO, mas continuando...`);
        }

        // Salvar arquivo prerenderizado
        let outFile;
        if (route === '/') {
          outFile = path.join(BUILD_DIR, 'index.html');
        } else {
          // Criar estrutura de diretórios para rotas
          const routePath = route.slice(1); // remover /
          const routeDir = path.join(BUILD_DIR, path.dirname(routePath));
          if (!fs.existsSync(routeDir)) {
            fs.mkdirSync(routeDir, { recursive: true });
          }
          outFile = path.join(BUILD_DIR, routePath + '.html');
        }

        fs.writeFileSync(outFile, html, 'utf8');
        console.log(`[prerender-institutional] ok ${route} -> ${outFile}`);
        console.log(`[prerender-institutional] HTML size: ${html.length} bytes`);
      } catch (error) {
        console.error(`[prerender-institutional] erro no prerender de ${route}:`, error.message);
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

  console.log(`[prerender-institutional] Páginas institucionais pré-renderizadas com sucesso`);
}

async function main() {
  console.log('[prerender-institutional] Iniciando prerender de páginas institucionais...');
  try {
    await runPrerenderInstitutional();
    console.log('[prerender-institutional] Prerender institucional concluído com sucesso');
  } catch (error) {
    console.error('[prerender-institutional] falha:', error.message);
    console.warn('[prerender-institutional] Prerender institucional falhou, mas o build continuará.');
    process.exitCode = 0;
  }
}

main().catch((error) => {
  console.error('[prerender-institutional] falha:', error);
  process.exitCode = 1;
});