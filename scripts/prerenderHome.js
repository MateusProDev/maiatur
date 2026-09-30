const fs = require('fs');
const path = require('path');
const http = require('http');

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

/**
 * A home é a ÚNICA página que sobrescreve build/index.html.
 * Por isso este script roda por último (ver script "prerender" no package.json)
 * e restaura o shell original antes de capturar. Os outros scripts de
 * prerender dependem desse shell para o React montar cada rota.
 */
function assertHtmlHasHomeContent(html) {
  const required = [
    '<h1',
    '<h2',
    'transfer',
    'passeio',
    'fortaleza',
    'description',
    'og:title',
    'canonical'
  ];

  const lowerHtml = html.toLowerCase();
  const missing = required.filter((value) => {
    if (value === '<h1') {
      return !/<h1[^>]*>/i.test(html);
    }
    if (value === '<h2') {
      return !/<h2[^>]*>/i.test(html);
    }
    if (value === 'description') {
      return !/name="description"|name="twitter:description"|property="og:description"/i.test(html);
    }
    if (value === 'og:title') {
      return !/property="og:title"|meta property="og:title"/i.test(html);
    }
    if (value === 'canonical') {
      return !/<link[^>]+rel="canonical"/i.test(html);
    }
    return !lowerHtml.includes(String(value).toLowerCase());
  });

  if (missing.length > 0) {
    throw new Error(
      `PRERENDER HOME FAILED: HTML da home incompleto. Ausente: ${missing.join(', ')}`
    );
  }

  const hasEssentialContent = lowerHtml.includes('transfer') ||
                               lowerHtml.includes('passeio') ||
                               lowerHtml.includes('turismo') ||
                               lowerHtml.includes('fortaleza');

  if (!hasEssentialContent) {
    throw new Error('PRERENDER HOME FAILED: página inicial não contém conteúdo essencial de turismo/transfer.');
  }

  return true;
}

async function runPrerenderHome() {
  if (!fs.existsSync(BUILD_DIR)) {
    throw new Error('Build da CRA ainda não existe em build/. Execute o build antes do prerender.');
  }

  const indexHtmlPath = path.join(BUILD_DIR, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error('index.html não encontrado em build/. Execute "npm run build" antes do prerender para gerar os arquivos de build.');
  }

  /* Garante que partimos do shell original da SPA, não de um snapshot anterior. */
  const originalFile = path.join(BUILD_DIR, 'index.html.original');
  if (fs.existsSync(originalFile)) {
    fs.copyFileSync(originalFile, indexHtmlPath);
    console.log('[prerender-home] index.html restaurado do original antes de capturar.');
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
          console.error('[prerender-home] index.html não encontrado para fallback');
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(fallback));
      }
    } catch (error) {
      console.error('[prerender-home] erro no servidor estático:', error);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end('Internal error');
      }
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

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

  const page = await browser.newPage({ waitUntil: 'load', timeout: 60000 });

  try {
    const route = '/';
    const url = `http://127.0.0.1:${port}${route}`;

    console.log(`[prerender-home] visitando ${route}`);

    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    if (!response || response.status() < 200 || response.status() >= 400) {
      throw new Error(`[prerender-home] ${route} retornou status ${response ? response.status() : 'sem status'}`);
    }

    /* Espera pelo <h1> real da home — o seletor só existe depois que o React
       montou e o conteúdo saiu da tela de carregamento. */
    await page.waitForSelector('h1', { timeout: 30000 });

    await page.waitForFunction(() => {
      const bodyText = document.body ? document.body.innerText : '';
      const isLoading = /carregando/i.test(bodyText);
      return !isLoading && String(bodyText).trim().length > 200;
    }, { timeout: 30000 });

    // Margem para o conteúdo dinâmico do Firebase assentar
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const html = await page.evaluate(() => document.documentElement.outerHTML);

    if (!html || !html.includes('<html')) {
      throw new Error('PRERENDER HOME FAILED: página inicial produziu HTML inválido.');
    }

    assertHtmlHasHomeContent(html);

    // Backup do shell original (só na primeira vez)
    if (!fs.existsSync(originalFile)) {
      fs.copyFileSync(indexHtmlPath, originalFile);
      console.log(`[prerender-home] backup criado: ${originalFile}`);
    }

    fs.writeFileSync(indexHtmlPath, html, 'utf8');

    const saved = fs.readFileSync(indexHtmlPath, 'utf8');
    const hasData = saved.toLowerCase().includes('transfer') ||
                   saved.toLowerCase().includes('passeio') ||
                   saved.toLowerCase().includes('turismo');

    if (!hasData) {
      throw new Error('PRERENDER HOME FAILED: página inicial não contém conteúdo de turismo após prerender.');
    }

    console.log(`[prerender-home] ok ${route} -> ${indexHtmlPath}`);
    console.log(`[prerender-home] HTML size: ${html.length} bytes`);
    console.log('[prerender-home] Conteúdo dinâmico incluído no HTML estático');
  } catch (error) {
    console.error('[prerender-home] erro no prerender:', error.message);
    throw error;
  } finally {
    await page.close();
    await browser.close();
    server.close();
  }

  console.log('[prerender-home] Página inicial pré-renderizada com sucesso');
}

async function main() {
  console.log('[prerender-home] Iniciando prerender da página inicial...');
  try {
    await runPrerenderHome();
    console.log('[prerender-home] Prerender da Home concluído com sucesso');
  } catch (error) {
    console.error('[prerender-home] falha:', error.message);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[prerender-home] falha:', error);
  process.exitCode = 1;
});
