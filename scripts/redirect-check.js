#!/usr/bin/env node
const fs = require('fs');
const { URL } = require('url');
const fetch = require('node-fetch');

// Simple redirect chain checker using manual fetch with redirect: 'manual' to capture Location
// Usage: node scripts/redirect-check.js https://transferfortalezatur.com.br/sitemap.xml

async function fetchRedirectChain(url) {
  const chain = [];
  let current = url;
  let max = 10;
  try {
    while (max-- > 0) {
      const res = await fetch(current, { method: 'GET', redirect: 'manual' });
      chain.push({ url: current, status: res.status, location: res.headers.get('location') });
      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        let loc = res.headers.get('location');
        // Resolve relative locations
        try { loc = new URL(loc, current).href; } catch (e) {}
        if (loc === current) break;
        current = loc;
        continue;
      }
      break;
    }
  } catch (e) {
    chain.push({ url: current, error: String(e) });
  }
  return chain;
}

async function parseSitemap(sitemapUrl) {
  const res = await fetch(sitemapUrl);
  const text = await res.text();
  const urls = [];
  const re = /<loc>(.*?)<\/loc>/g;
  let m;
  while ((m = re.exec(text))) urls.push(m[1]);
  return urls;
}

async function main() {
  const sitemap = process.argv[2] || 'https://transferfortalezatur.com.br/sitemap.xml';
  console.log('Reading sitemap:', sitemap);
  const urls = await parseSitemap(sitemap);
  console.log('Found', urls.length, 'URLs');
  const results = [];
  for (const u of urls) {
    console.log('\nChecking', u);
    const primary = await fetchRedirectChain(u);
    // Also check www and http variants
    const urlObj = new URL(u);
    const variants = [];
    // http variant
    if (urlObj.protocol === 'https:') {
      variants.push(urlObj.href.replace(/^https:/, 'http:'));
    }
    // www variant
    if (!urlObj.hostname.startsWith('www.')) {
      variants.push(`${urlObj.protocol}//www.${urlObj.hostname}${urlObj.pathname}${urlObj.search}`);
    } else {
      // non-www
      variants.push(`${urlObj.protocol}//${urlObj.hostname.replace(/^www\./, '')}${urlObj.pathname}${urlObj.search}`);
    }

    const variantChains = {};
    for (const v of variants) {
      try {
        variantChains[v] = await fetchRedirectChain(v);
      } catch (e) {
        variantChains[v] = [{ error: String(e) }];
      }
    }

    results.push({ url: u, chain: primary, variants: variantChains });
  }

  const out = { generatedAt: new Date().toISOString(), sitemap, results };
  fs.writeFileSync('scripts/redirect-report.json', JSON.stringify(out, null, 2));
  console.log('\nReport written to scripts/redirect-report.json');
}

main().catch(err => { console.error(err); process.exit(1); });
