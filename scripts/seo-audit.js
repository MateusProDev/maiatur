#!/usr/bin/env node
/*
 SEO Audit script
 - Fetches sitemap.xml (remote or local)
 - Renders each URL with Puppeteer (headless) and extracts:
   title, meta description, canonical, robots, and visible text
 - Detects duplicate titles, missing descriptions, and high-similarity content
 - Writes report to `scripts/seo-audit-report.json`

 Usage:
  node scripts/seo-audit.js [sitemap_url]

 Notes:
  - Requires `puppeteer` installed in the project.
  - Tune concurrency and similarity thresholds as needed.
*/

const fs = require('fs');
const https = require('https');
const { URL } = require('url');
const path = require('path');

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

function normalizeText(t) {
  return (t || '')
    .replace(/\s+/g, ' ')
    .replace(/[\u2000-\u2BFF]/g, '')
    .toLowerCase()
    .trim();
}

function shingles(text, k = 5) {
  const words = text.split(/\s+/).filter(Boolean);
  const s = new Set();
  for (let i = 0; i + k <= words.length; i++) s.add(words.slice(i, i + k).join(' '));
  return s;
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 1;
  const inter = [...a].filter(x => b.has(x)).length;
  const uni = new Set([...a, ...b]).size;
  return uni === 0 ? 0 : inter / uni;
}

async function runAudit(sitemapUrl) {
  console.log('Starting SEO audit for sitemap:', sitemapUrl);
  let xml;
  if (fs.existsSync(sitemapUrl) && fs.lstatSync(sitemapUrl).isFile()) {
    xml = fs.readFileSync(sitemapUrl, 'utf8');
  } else {
    xml = await fetchText(sitemapUrl);
  }
  const urls = parseSitemap(xml);
  console.log('Found', urls.length, 'URLs in sitemap');
  if (urls.length === 0) {
    console.error('No URLs found in sitemap. Exiting.');
    process.exit(1);
  }

  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (err) {
    console.error('Please install puppeteer in the project: npm install puppeteer');
    process.exit(1);
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const results = [];
  const concurrency = 3;

  // Helper: skip asset URLs (images, icons, etc.) so audit focuses on HTML pages
  const assetExt = /\.(png|jpg|jpeg|gif|ico|svg|webp|json|xml|js|css)$/i;

  async function fetchWithRetry(browser, u, attempts = 2) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      let p;
      try {
        p = await browser.newPage();
        await p.setViewport({ width: 1280, height: 800 });
        // longer timeout for slower pages; prefer networkidle2 but fallback to load
        await p.goto(u, { waitUntil: 'networkidle2', timeout: 60000 });
        const data = await p.evaluate(() => {
          const title = document.querySelector('title') ? document.querySelector('title').innerText : '';
          const desc = document.querySelector('meta[name=description]') ? document.querySelector('meta[name=description]').getAttribute('content') : '';
          const robots = document.querySelector('meta[name=robots]') ? document.querySelector('meta[name=robots]').getAttribute('content') : '';
          const canonical = document.querySelector('link[rel=canonical]') ? document.querySelector('link[rel=canonical]').getAttribute('href') : '';
          const bodyText = document.body ? document.body.innerText : '';
          return { title, desc, robots, canonical, bodyText };
        });
        await p.close();
        return { url: u, title: data.title || '', description: data.desc || '', robots: data.robots || '', canonical: data.canonical || '', text: normalizeText(data.bodyText || '') };
      } catch (err) {
        if (p) try { await p.close(); } catch (e) {}
        if (attempt < attempts) {
          console.warn(`Retrying (${attempt}) ${u}:`, err.message);
          // small backoff
          await new Promise(r => setTimeout(r, 1500 * attempt));
          continue;
        }
        return { url: u, error: err.message };
      }
    }
  }

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    await Promise.all(batch.map(async (u) => {
      try {
        if (assetExt.test(new URL(u).pathname)) {
          // Skip assets (do not count them as missing descriptions)
          console.log('Skipping asset URL:', u);
          return results.push({ url: u, skippedAsset: true });
        }
        const res = await fetchWithRetry(browser, u, 2);
        results.push(res);
        if (res.error) console.error('Error fetching', u, res.error);
        else console.log('Fetched:', u);
      } catch (err) {
        console.error('Unexpected error fetching', u, err.message);
        results.push({ url: u, error: err.message });
      }
    }));
  }

  await browser.close();

  // analyze
  const report = { generatedAt: new Date().toISOString(), urls: results };

  // Exclude skipped assets from analysis so counts focus on HTML pages
  const htmlResults = results.filter(r => !r.skippedAsset);

  // titles duplicates
  const titleMap = new Map();
  for (const r of htmlResults) {
    const t = (r.title || '').trim();
    if (!t) continue;
    if (!titleMap.has(t)) titleMap.set(t, []);
    titleMap.get(t).push(r.url);
  }
  const duplicateTitles = [...titleMap.entries()].filter(([t, arr]) => arr.length > 1).map(([t, arr]) => ({ title: t, urls: arr }));

  // descriptions duplicates / missing (skip entries with skippedAsset)
  const descMap = new Map();
  const missingDescriptions = [];
  for (const r of htmlResults) {
    const d = (r.description || '').trim();
    if (!d) missingDescriptions.push(r.url);
    else {
      if (!descMap.has(d)) descMap.set(d, []);
      descMap.get(d).push(r.url);
    }
  }
  const duplicateDescriptions = [...descMap.entries()].filter(([d, arr]) => arr.length > 1).map(([d, arr]) => ({ description: d, urls: arr }));

  // content similarity (shingles) — only HTML results
  const shinglesList = htmlResults.map(r => ({ url: r.url, set: shingles(r.text || '', 5) }));
  const similarPairs = [];
  for (let i = 0; i < shinglesList.length; i++) {
    for (let j = i + 1; j < shinglesList.length; j++) {
      const a = shinglesList[i];
      const b = shinglesList[j];
      const score = jaccard(a.set, b.set);
      if (score >= 0.75) similarPairs.push({ urlA: a.url, urlB: b.url, similarity: score });
    }
  }

  report.summary = {
    totalUrls: htmlResults.length,
    duplicateTitlesCount: duplicateTitles.length,
    missingDescriptionsCount: missingDescriptions.length,
    duplicateDescriptionsCount: duplicateDescriptions.length,
    similarContentPairs: similarPairs.length
  };
  report.duplicateTitles = duplicateTitles;
  report.missingDescriptions = missingDescriptions;
  report.duplicateDescriptions = duplicateDescriptions;
  report.similarContentPairs = similarPairs;

  const out = path.join(__dirname, 'seo-audit-report.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
  console.log('Report written to', out);
  console.log('Summary:', report.summary);
}

const sitemapArg = process.argv[2] || 'https://transferfortalezatur.com.br/sitemap.xml';
runAudit(sitemapArg).catch(err => { console.error(err); process.exit(1); });
