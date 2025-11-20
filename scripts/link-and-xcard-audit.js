#!/usr/bin/env node
/*
 Link and X-Card Audit
 - Fetch sitemap (remote or local)
 - Render each page with Puppeteer and extract:
   - all internal anchor hrefs (after JS render)
   - Twitter meta tags (twitter:card, twitter:title, twitter:description, twitter:image)
   - Open Graph tags as fallback (og:title, og:description, og:image)
 - Build inbound link counts for pages listed in the sitemap
 - Report pages with zero internal inbound links and pages missing X (Twitter) Card tags
 - Writes report to `scripts/link-xcard-report.json`

 Usage:
  node scripts/link-and-xcard-audit.js [sitemap_url]

 Notes:
  - Requires `puppeteer` (already in project). Adjust concurrency/timeouts as needed.
*/

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

async function fetchText(url) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(url);
      const get = u.protocol === 'https:' ? require('https').get : require('http').get;
      get(u, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

function parseSitemap(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) urls.push(m[1].trim());
  return urls;
}

function normalizeForKey(u) {
  try {
    const U = new URL(u);
    // remove hash, trim trailing slash (except root)
    let p = U.pathname.replace(/\/+$|^\/+/g, '/');
    if (p !== '/' ) p = p.replace(/\/$/, '');
    return U.origin + p;
  } catch (e) {
    return u;
  }
}

function isAssetUrl(u) {
  return /\.(png|jpg|jpeg|gif|ico|svg|webp|json|xml|js|css|pdf|zip)$/i.test(new URL(u).pathname);
}

async function run(sitemapArg) {
  const sitemapUrl = sitemapArg || 'https://transferfortalezatur.com.br/sitemap.xml';
  console.log('Starting Link & X-Card audit for sitemap:', sitemapUrl);

  let xml;
  if (fs.existsSync(sitemapUrl) && fs.lstatSync(sitemapUrl).isFile()) {
    xml = fs.readFileSync(sitemapUrl, 'utf8');
  } else {
    xml = await fetchText(sitemapUrl);
  }

  const urls = parseSitemap(xml).filter(Boolean);
  console.log('Found', urls.length, 'URLs in sitemap');
  if (urls.length === 0) return console.error('No URLs found in sitemap.');

  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch (err) { console.error('Install puppeteer: npm install puppeteer'); process.exit(1); }

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const concurrency = 3;
  const baseOrigin = new URL(urls[0]).origin;

  const pageData = {};

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    await Promise.all(batch.map(async (u) => {
      try {
        if (isAssetUrl(u)) {
          console.log('Skipping asset:', u);
          pageData[normalizeForKey(u)] = { url: u, skippedAsset: true };
          return;
        }
        const p = await browser.newPage();
        await p.setViewport({ width: 1280, height: 800 });
        await p.goto(u, { waitUntil: 'networkidle2', timeout: 60000 });
        const data = await p.evaluate((base) => {
          const anchors = Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'));
          const normAnchors = anchors.map(h => {
            try { return new URL(h, base).href; } catch (e) { return null; }
          }).filter(Boolean);
          const meta = (name) => {
            const el = document.querySelector(`meta[name="${name}"]`);
            return el ? el.getAttribute('content') : '';
          };
          const og = (prop) => {
            const el = document.querySelector(`meta[property="${prop}"]`);
            return el ? el.getAttribute('content') : '';
          };
          return {
            outlinks: normAnchors,
            twitter: {
              card: meta('twitter:card'),
              title: meta('twitter:title'),
              description: meta('twitter:description'),
              image: meta('twitter:image')
            },
            og: {
              title: og('og:title'),
              description: og('og:description'),
              image: og('og:image')
            }
          };
        }, baseOrigin);
        await p.close();
        const key = normalizeForKey(u);
        pageData[key] = { url: u, outlinks: data.outlinks, twitter: data.twitter, og: data.og };
        console.log('Fetched:', u);
      } catch (err) {
        console.error('Error fetching', u, err.message);
        pageData[normalizeForKey(u)] = { url: u, error: err.message };
      }
    }));
  }

  await browser.close();

  // Build inbound links map for sitemap URLs only
  const sitemapKeys = urls.map(u => normalizeForKey(u));
  const inbound = {};
  for (const k of sitemapKeys) inbound[k] = new Set();

  for (const key of Object.keys(pageData)) {
    const pd = pageData[key];
    if (!pd || !pd.outlinks) continue;
    for (const out of pd.outlinks) {
      try {
        const n = normalizeForKey(out);
        if (inbound[n]) inbound[n].add(pageData[key].url);
      } catch (e) {}
    }
  }

  // Prepare report
  const pages = sitemapKeys.map(k => {
    const pd = pageData[k] || {};
    const inArr = inbound[k] ? Array.from(inbound[k]) : [];
    const twitter = pd.twitter || {};
    const og = pd.og || {};
    const hasXCard = (twitter.card && twitter.card.trim().length > 0) || (og.title || og.description || og.image);
    return {
      url: pd.url || k,
      inboundCount: inArr.length,
      inboundFrom: inArr,
      hasXCard: !!hasXCard,
      twitter,
      og
    };
  });

  const pagesWithNoInbound = pages.filter(p => p.inboundCount === 0).map(p => p.url);
  const pagesMissingXCard = pages.filter(p => !p.hasXCard).map(p => p.url);

  const report = {
    generatedAt: new Date().toISOString(),
    totalPages: pages.length,
    pages,
    pagesWithNoInbound,
    pagesMissingXCard
  };

  const out = path.join(__dirname, 'link-xcard-report.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
  console.log('Report written to', out);
  console.log('Pages with no inbound links:', pagesWithNoInbound.length);
  console.log('Pages missing X (Twitter) Card or OG fallbacks:', pagesMissingXCard.length);
}

const sitemapArg = process.argv[2] || './public/sitemap.xml';
run(sitemapArg).catch(err => { console.error(err); process.exit(1); });
