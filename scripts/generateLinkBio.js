#!/usr/bin/env node
/*
  scripts/generateLinkBio.js
  - Gera public/link-bio/index.html a partir de um documento Firestore.
  Uso:
    - Exporte `GOOGLE_APPLICATION_CREDENTIALS` apontando para a chave JSON do service account
      OU passe o caminho como argumento: `node scripts/generateLinkBio.js ./keys/sa.json`
    - Opcional: passe o caminho do output: `--out=public/link-bio/index.html`

  O script tenta ler o documento `content/linkInBio` (recomendado).
  O documento deve ter pelo menos uma propriedade `links` que é um array de { title, url }.
  Exemplos de formato aceitos:
    { title: 'Links', links: [{ title:'Reservas', url:'https://...' }] }
    { links: { reservas: 'https://...', contato: 'https://...' } }
    { items: [...] }
*/

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function usageAndExit(msg){
  if (msg) console.error(msg);
  console.log('\nUso:\n  GOOGLE_APPLICATION_CREDENTIALS=./sa.json node scripts/generateLinkBio.js');
  process.exit(msg ? 1 : 0);
}

function gracefulExitWarn(msg){
  if (msg) console.warn(msg);
  console.log('Gerador link-bio: usando fallback estático (public/link-bio/index.html) e não falhando o build.');
  process.exit(0);
}

async function main(){
  const argPath = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
  const outArg = process.argv.find(a=>a.startsWith('--out='));
  const outPath = outArg ? outArg.split('=')[1] : path.join(__dirname, '..', 'public', 'link-bio', 'index.html');

  // Initialize Firebase Admin
  try{
    // Priority: explicit file path argument
    if (argPath){
      const abs = path.resolve(argPath);
      if (!fs.existsSync(abs)) throw new Error('Service account file not found: ' + abs);
      const parsed = require(abs);
      const projectId = parsed.project_id || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GOOGLE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
      admin.initializeApp({ credential: admin.credential.cert(parsed), projectId });
    } else {
      // Support service account JSON provided via environment (useful on Vercel)
      const envNames = ['FIREBASE_SERVICE_ACCOUNT', 'FIREBASE_SERVICE_ACCOUNT_JSON', 'GOOGLE_SERVICE_ACCOUNT', 'GOOGLE_APPLICATION_CREDENTIALS_JSON', 'FIREBASE_SERVICE_ACCOUNT_B64'];
      let saJson = null;
      for (const n of envNames){ if (process.env[n]){ saJson = process.env[n]; break; } }
      if (saJson){
        try{
          // saJson may be a raw JSON string or base64-encoded JSON
          let candidate = saJson;
          if (typeof candidate === 'string' && !candidate.trim().startsWith('{')){
            try{
              const decoded = Buffer.from(candidate, 'base64').toString('utf8');
              if (decoded && decoded.trim().startsWith('{')) candidate = decoded;
            }catch(_){ /* ignore, keep original */ }
          }
          const parsed = typeof candidate === 'string' ? JSON.parse(candidate) : candidate;
          const projectId = parsed.project_id || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GOOGLE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
          admin.initializeApp({ credential: admin.credential.cert(parsed), projectId });
          if (!projectId) console.warn('Aviso: projectId não detectado automaticamente. Recomendo definir GOOGLE_CLOUD_PROJECT ou FIREBASE_PROJECT_ID nas variáveis de ambiente.');
        }catch(e){
          throw new Error('Falha ao parsear JSON do service account a partir da variável de ambiente.');
        }
      } else {
        // Fall back to Application Default Credentials (if deployed with ADC)
        admin.initializeApp({ credential: admin.credential.applicationDefault() });
      }
    }
  }catch(err){
    console.error('Erro ao inicializar Firebase Admin:', err.message || err);
    // If caller explicitly requests failure, propagate; otherwise keep fallback
    const failOnError = (process.env.LINKBIO_FAIL_ON_ERROR === '1' || process.env.LINKBIO_FAIL_ON_ERROR === 'true');
    if (failOnError) usageAndExit('Forneça um service account (arquivo) ou defina a variável de ambiente FIREBASE_SERVICE_ACCOUNT com o JSON.');
    else gracefulExitWarn('Inicialização do Firebase falhou — mantendo fallback estático.');
  }

  const db = admin.firestore();

  // Try common doc locations
  const candidates = [ 'content/linkInBio', 'linkInBio' ];
  let doc = null; let data = null; let usedPath = null;
  try{
    for (const p of candidates){
      const d = await db.doc(p).get();
      if (d.exists){ doc = d; data = d.data(); usedPath = p; break; }
    }
  }catch(err){
    const failOnError = (process.env.LINKBIO_FAIL_ON_ERROR === '1' || process.env.LINKBIO_FAIL_ON_ERROR === 'true');
    console.error('Erro ao acessar Firestore:', err && err.message ? err.message : err);
    if (failOnError) usageAndExit('Falha ao acessar Firestore e LINKBIO_FAIL_ON_ERROR=true, abortando build.');
    else gracefulExitWarn('Não foi possível acessar Firestore — mantendo fallback estático.');
  }

  if (!data){
    const failOnError = (process.env.LINKBIO_FAIL_ON_ERROR === '1' || process.env.LINKBIO_FAIL_ON_ERROR === 'true');
    console.error('Documento linkInBio não encontrado em nenhuma das paths:', candidates.join(', '));
    if (failOnError) usageAndExit('Crie o documento Firestore `content/linkInBio` com um campo `links`.');
    else gracefulExitWarn('Documento linkInBio ausente — mantendo fallback estático.');
  }

  // Normalize links
  let links = [];
  if (Array.isArray(data.links)) links = data.links;
  else if (Array.isArray(data.items)) links = data.items;
  else if (data.links && typeof data.links === 'object'){
    // object map -> convert
    links = Object.keys(data.links).map(k=>{
      const v = data.links[k];
      if (typeof v === 'string') return { title: k, url: v };
      if (v && v.url) return { title: v.title || k, url: v.url };
      return { title: k, url: String(v) };
    });
  }

  // Fallback: if data itself is an array
  if (!links.length && Array.isArray(data)) links = data;

  if (!links.length){
    console.error('Nenhum link encontrado no documento. Data:', JSON.stringify(data, null, 2));
    usageAndExit('O documento deve conter um array `links` ou `items`, ou um objeto `links` com chaves->urls.');
  }

  const title = data.title || data.name || 'Transfer Fortaleza Tur';
  const description = data.description || 'Links rápidos — reservas, contato e informações.';

  // Build HTML
  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <style>
      :root{ --bg:#fff; --fg:#111; --accent:#0b67ff; --muted:#666 }
      html,body{height:100%;margin:0;font-family:Inter,system-ui,Segoe UI,Roboto,'Helvetica Neue',Arial}
      body{display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#f8fbff,#fff);color:var(--fg);}
      .card{width:100%;max-width:520px;margin:24px;padding:28px;border-radius:14px;box-shadow:0 6px 30px rgba(14,30,37,0.08);background:var(--bg);text-align:center}
      h1{font-size:20px;margin:0 0 10px}
      p.lead{margin:0 0 18px;color:var(--muted)}
      .links{display:flex;flex-direction:column;gap:10px}
      .links a{display:block;padding:12px 16px;border-radius:10px;text-decoration:none;color:#fff;background:var(--accent);font-weight:600}
      .small{font-size:13px;color:var(--muted);margin-top:14px}
      footer{margin-top:18px;font-size:12px;color:var(--muted)}
    </style>
  </head>
  <body>
    <main class="card" role="main">
      <h1>${escapeHtml(title)}</h1>
      <p class="lead">${escapeHtml(description)}</p>

      <nav class="links" aria-label="Links principais">
        ${links.map(l=>`<a href="${escapeAttr(l.url || l.link || l.href)}" rel="nofollow noopener">${escapeHtml(l.title || l.name || l.label || l.url)}</a>`).join('\n        ')}
      </nav>

      <p class="small">Página gerada automaticamente a partir do Firestore (${escapeHtml(usedPath)}).</p>
      <footer>© ${escapeHtml(title)}</footer>
    </main>
  </body>
</html>`;

  // Ensure output directory exists
  const outDir = path.dirname(outPath);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Gerado:', outPath);
  process.exit(0);
}

function escapeHtml(s){
  if (s == null) return '';
  return String(s).replace(/[&<>\"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;' }[c]||c));
}
function escapeAttr(s){
  if (s == null) return '';
  return String(s).replace(/"/g, '&quot;');
}

main().catch(err=>{ console.error('Erro inesperado:', err); process.exit(2); });
