const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium').default;
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

function normalizeSlug(value) {
  if (!value || typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]+/g, '')
    .replace(/--+/g, '-');

  return normalized || null;
}

function buildSitemapFromSlugs(slugs) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  const staticPages = [
    ['/', 'daily', '1.0'],
    ['/pacotes', 'weekly', '0.8'],
    ['/destinos', 'weekly', '0.8'],
    ['/sobre', 'monthly', '0.6'],
    ['/contato', 'monthly', '0.6'],
    ['/avaliacoes', 'weekly', '0.7'],
    ['/blog', 'weekly', '0.8']
  ];

  staticPages.forEach(([loc, changefreq, priority]) => {
    lines.push('  <url>');
    lines.push(`    <loc>${SITE_URL}${loc}</loc>`);
    lines.push(`    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`);
    lines.push(`    <changefreq>${changefreq}</changefreq>`);
    lines.push(`    <priority>${priority}</priority>`);
    lines.push('  </url>');
  });

  slugs.forEach((slug) => {
    lines.push('  <url>');
    lines.push(`    <loc>${SITE_URL}/pacote/${slug}</loc>`);
    lines.push(`    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`);
    lines.push('    <changefreq>weekly</changefreq>');
    lines.push('    <priority>0.8</priority>');
    lines.push('  </url>');
  });

  lines.push('</urlset>');
  return lines.join('\n');
}

async function getAllPacotes() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('[prerender] Firebase public env ausente no build: REACT_APP_* ou FIREBASE_* não estão disponíveis.');
    console.warn('[prerender] Nenhuma lista pública de pacotes conseguiu ser obtida no processo de build.');
    return [];
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const snapshot = await getDocs(collection(db, 'pacotes'));
  const docs = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const valid = data && typeof data === 'object';

    if (!valid) return;

    const firestoreSlug =
      typeof data.slug === 'string' ? data.slug.trim() : '';

    const normalizedSlug =
      firestoreSlug || normalizeSlug(data.titulo || '');

    if (!normalizedSlug) {
     console.warn(`[prerender] pacote sem slug válido ignorado: ${doc.id}`);
      return;
    }

    docs.push({
      id: doc.id,
      slug: normalizedSlug,
      title: data.titulo || data.name || normalizedSlug,
      raw: data
    });
  });

  return docs;
}

function assertHtmlHasPackageContent(html, slug, title) {
  const required = [
    '<h1',
    title,
    'description',
    'og:title',
    'canonical',
    'application/ld+json'
  ];

  const lowerHtml = html.toLowerCase();
  const missing = required.filter((value) => {
    if (value === '<h1') {
      return !/<h1[^>]*>/i.test(html);
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

    if (value === 'application/ld+json') {
      return !/<script[^>]+type="application\/ld\+json"/i.test(html);
    }

    return !lowerHtml.includes(String(value).toLowerCase());
  });

  if (missing.length > 0) {
    throw new Error(`PRERENDER FAILED: /pacote/${slug} did not contain required package content in generated HTML. Missing: ${missing.join(', ')}`);
  }

  const countMeta = (attribute, value) => {
    const pattern = new RegExp(`<meta[^>]+${attribute}="${value}"[^>]*>`, 'gi');
    return (html.match(pattern) || []).length;
  };

  const duplicateTags = [
    ['property', 'og:title'],
    ['property', 'og:description'],
    ['property', 'og:image'],
    ['name', 'twitter:title'],
    ['name', 'twitter:description'],
    ['name', 'twitter:image']
  ].filter(([attribute, value]) => countMeta(attribute, value) > 1);

  if (duplicateTags.length > 0) {
    throw new Error(`PRERENDER FAILED: /pacote/${slug} generated duplicate social metadata: ${duplicateTags.map(([, value]) => value).join(', ')}`);
  }

  return true;
}

async function runPrerender(validPackages) {
  if (!fs.existsSync(BUILD_DIR)) {
    throw new Error('Build da CRA ainda não existe em build/. Execute o build antes do prerender.');
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

      const packageStaticPath = rawUrl.startsWith('/pacote/')
        ? path.join(BUILD_DIR, 'pacote', rawUrl.replace(/^\/pacote\//, '').split('/')[0], 'index.html')
        : null;

      const candidate =
        packageStaticPath &&
        fs.existsSync(packageStaticPath) &&
        fs.statSync(packageStaticPath).isFile()
          ? packageStaticPath
          : requestedPath;

      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        const ext = path.extname(candidate).toLowerCase();
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
        res.end(fs.readFileSync(candidate));
      } else if (rawUrl.startsWith('/pacote/')) {
        const fallback = path.join(BUILD_DIR, 'index.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(fallback));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    } catch (error) {
      console.error('[prerender] erro no servidor estático:', error);
      res.writeHead(500);
      res.end('Internal error');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  const browser = await puppeteer.launch({
   args: chromium.args,
   defaultViewport: chromium.defaultViewport,
   executablePath: await chromium.executablePath(),
   headless: chromium.headless
  });
  const page = await browser.newPage({ waitUntil: 'load', timeout: 60000 });

  let generated = 0;
  const failed = [];

  try {
    for (const pkg of validPackages) {
      const slug = pkg.slug;
      const route = `/pacote/${slug}`;
      const url = `http://127.0.0.1:${port}${route}`;

      console.log(`[prerender] visita ${route}`);

      try {
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });

        if (!response || response.status() < 200 || response.status() >= 400) {
          throw new Error(`[prerender] ${route} retornou status ${response ? response.status() : 'sem status'}`);
        }

        await page.locator('h1').wait({ state: 'attached', timeout: 15000 });
        await page.locator('body').wait({ state: 'attached', timeout: 15000 });

        await page.waitForFunction(() => {
          const heading = document.querySelector('h1');
          const bodyText = document.body ? document.body.innerText : '';
          return Boolean(heading && bodyText && String(bodyText).trim().length > 80);
        }, { timeout: 15000 });

        const html = await page.evaluate(() => document.documentElement.outerHTML);

        if (!html || !html.includes('<html')) {
          throw new Error(`PRERENDER FAILED: /pacote/${slug} produced invalid HTML shell.`);
        }

        assertHtmlHasPackageContent(html, slug, pkg.title);

        const outDir = path.join(BUILD_DIR, 'pacote', slug);
        fs.mkdirSync(outDir, { recursive: true });
        const outFile = path.join(outDir, 'index.html');
        fs.writeFileSync(outFile, html, 'utf8');

        const saved = fs.readFileSync(outFile, 'utf8');
        const requiredText = [pkg.title, 'description'];
        const hasData = requiredText.every((v) => saved.toLowerCase().includes(String(v).toLowerCase())) || saved.includes('transfer') || saved.includes('passeio');

        if (!hasData) {
          throw new Error(`PRERENDER FAILED: /pacote/${slug} did not contain package content in generated HTML.`);
        }

        generated += 1;
        console.log(`[prerender] ok ${route} -> ${outFile}`);
      } catch (error) {
        failed.push(`${route}: ${error.message}`);
        console.error(`[prerender] falha em ${route}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('[prerender] erro no prerender:', error.message);
    failed.push(error.message);
    throw error;
  } finally {
    await page.close();
    await browser.close();
    server.close();
  }

  console.log(`[prerender] Found packages: ${validPackages.length}`);
  console.log(`[prerender] Successfully prerendered: ${generated}`);
  console.log(`[prerender] Failed: ${failed.length}`);

  if (generated !== validPackages.length) {
    throw new Error(`PRERENDER FAILED: expected ${validPackages.length} pages and generated ${generated}.`);
  }
}

async function main() {
  const allPackages = await getAllPacotes();

  if (allPackages.length === 0) {
    console.warn('[prerender] nenhuma rota pública de pacote foi obtida do Firestore.');
    process.exitCode = 1;
    return;
  }

  const validPackages = allPackages.filter((pkg) => Boolean(pkg.slug));

  if (validPackages.length === 0) {
    console.error('[prerender] nenhuma slug válida foi encontrada entre os pacotes públicos do Firestore.');
    process.exitCode = 1;
    return;
  }

  await runPrerender(validPackages);

  const sitemap = buildSitemapFromSlugs(validPackages.map((pkg) => pkg.slug));
  fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), sitemap, 'utf8');

  console.log(`[prerender] sitemap.xml atualizado com ${validPackages.length} URLs de pacotes`);
}

main().catch((error) => {
  console.error('[prerender] falha:', error);
  process.exitCode = 1;
});
