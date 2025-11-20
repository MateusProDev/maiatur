const fs = require('fs');

const redirectPath = 'scripts/redirect-report.json';
const headerPath = 'scripts/header-report.json';
const outTxt = 'scripts/gsc-audit.txt';
const outCsv = 'scripts/gsc-audit.csv';

function safe(v){ return v===undefined||v===null?'':String(v).replace(/\r?\n/g,' ').trim(); }

if(!fs.existsSync(redirectPath) || !fs.existsSync(headerPath)){
  console.error('Missing input reports. Run redirect-check.js and header-check.js first.');
  process.exit(1);
}

const redirect = JSON.parse(fs.readFileSync(redirectPath,'utf8'));
const headers = JSON.parse(fs.readFileSync(headerPath,'utf8'));

const entries = redirect.results.map(r => {
  const hdrEntry = headers.entries.find(e => e.url === r.url);
  // determine if canonical (r.chain) ends with 200 on same url
  const chain = r.chain || [];
  const final = chain.length? chain[chain.length-1].url: '';
  const finalStatus = chain.length? chain[chain.length-1].status: '';

  // variants summary: if any variant has a different final url
  const variants = r.variants || {};
  let variantIssues = [];
  for(const v in variants){
    const vchain = variants[v];
    const vfinal = vchain.length? vchain[vchain.length-1].url : '';
    const vstatus = vchain.length? vchain[vchain.length-1].status : '';
    if(vfinal !== final) variantIssues.push(`${v} -> ${vfinal} (${vstatus})`);
  }

  // headers summary (take canonical from headers file)
  const canHeaders = hdrEntry ? (hdrEntry.checks.find(c=>c.variant===r.url)||hdrEntry.checks[0]).result.headers : {};
  return {
    url: r.url,
    finalUrl: final,
    finalStatus,
    variantIssues: variantIssues.join(' | '),
    hsts: canHeaders['strict-transport-security'] || '',
    cache: canHeaders['cache-control'] || '',
    xvercel: canHeaders['x-vercel-cache'] || '',
    contentType: canHeaders['content-type'] || ''
  };
});

// Write TXT summary
let txt = [];
txt.push('GSC Audit Report - Transfer Fortaleza Tur');
txt.push('Generated: ' + new Date().toISOString());
txt.push('');
txt.push('Summary:');
txt.push('- Total URLs checked: ' + entries.length);
const anyVariantProblems = entries.filter(e => e.variantIssues).length;
txt.push(`- URLs with variant final != canonical: ${anyVariantProblems}`);
const anyNoHSTS = entries.filter(e=>!e.hsts).length;
txt.push(`- URLs missing HSTS: ${anyNoHSTS}`);

txt.push('\nDetails per URL:\n');
for(const e of entries){
  txt.push(`URL: ${e.url}`);
  txt.push(`  Final URL: ${e.finalUrl} (status ${e.finalStatus})`);
  txt.push(`  Variant issues: ${e.variantIssues || 'none'}`);
  txt.push(`  HSTS: ${e.hsts || 'none'}`);
  txt.push(`  Cache-Control: ${e.cache || 'none'}`);
  txt.push(`  X-Vercel-Cache: ${e.xvercel || 'none'}`);
  txt.push(`  Content-Type: ${e.contentType || 'none'}`);
  txt.push('');
}

fs.writeFileSync(outTxt, txt.join('\n'));

// Write CSV for quick upload/reference
const csvLines = ['url,finalUrl,finalStatus,variantIssues,hsts,cache,x-vercel-cache,content-type'];
for(const e of entries){
  const line = [e.url,e.finalUrl,e.finalStatus,e.variantIssues,e.hsts,e.cache,e.xvercel,e.contentType]
    .map(v=>`"${String(v===undefined||v===null?'':v).replace(/"/g,'""')}"`).join(',');
  csvLines.push(line);
}
fs.writeFileSync(outCsv, csvLines.join('\n'));

console.log('Wrote', outTxt, 'and', outCsv);
