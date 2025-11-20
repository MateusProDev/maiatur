#!/usr/bin/env node
const fs = require('fs');
const { URL } = require('url');
const fetch = require('node-fetch');

async function parseSitemap(sitemapUrl) {
  const res = await fetch(sitemapUrl);
  const text = await res.text();
  const urls = [];
  const re = /<loc>(.*?)<\/loc>/g;
  let m;
  while ((m = re.exec(text))) urls.push(m[1]);
  return urls;
}

function makeVariants(u) {
  const urlObj = new URL(u);
  const variants = [];
  if (urlObj.protocol === 'https:') variants.push(urlObj.href.replace(/^https:/, 'http:'));
  if (!urlObj.hostname.startsWith('www.')) {
    variants.push(`${urlObj.protocol}//www.${urlObj.hostname}${urlObj.pathname}${urlObj.search}`);
  } else {
    variants.push(`${urlObj.protocol}//${urlObj.hostname.replace(/^www\./, '')}${urlObj.pathname}${urlObj.search}`);
  }
  return variants;
}

function pickHeaders(headers) {
  const out = {};
  const keys = ['strict-transport-security','cache-control','content-type','server','x-vercel-cache','x-vercel-id','age','vary','etag'];
  for (const k of keys) {
    const v = headers.get(k);
    if (v) out[k] = v;
  }
  return out;
}

async function fetchFinal(u) {
  try {
    // try HEAD first for efficiency
    let res = await fetch(u, { method: 'HEAD', redirect: 'follow' });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(u, { method: 'GET', redirect: 'follow' });
    }
    const finalUrl = res.url || u;
    const status = res.status;
    const headers = pickHeaders(res.headers);
    return { requested: u, finalUrl, status, headers };
  } catch (e) {
    return { requested: u, error: String(e) };
  }
}

async function main() {
  const sitemap = process.argv[2] || 'https://transferfortalezatur.com.br/sitemap.xml';
  console.log('Reading sitemap:', sitemap);
  const urls = await parseSitemap(sitemap);
  console.log('Found', urls.length, 'URLs');
  const report = { generatedAt: new Date().toISOString(), sitemap, entries: [] };

  for (const u of urls) {
    console.log('Processing', u);
    const entry = { url: u, checks: [] };
    // check canonical
    const canonicalCheck = await fetchFinal(u);
    entry.checks.push({ variant: u, result: canonicalCheck });

    // variants
    const variants = makeVariants(u);
    for (const v of variants) {
      console.log('  variant', v);
      const r = await fetchFinal(v);
      entry.checks.push({ variant: v, result: r });
    }

    report.entries.push(entry);
  }

  fs.writeFileSync('scripts/header-report.json', JSON.stringify(report, null, 2));
  console.log('Report written to scripts/header-report.json');
}

main().catch(err => { console.error(err); process.exit(1); });
