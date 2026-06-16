/**
 * API Endpoint para Sitemap Dinâmico
 * Gera sitemap.xml automaticamente com todos os pacotes/transfers do Firestore
 * 
 * Este endpoint substitui o sitemap.xml estático, permitindo atualização automática
 * quando pacotes são criados, editados ou removidos.
 * 
 * Fallback: Se houver erro, retorna o sitemap estático original
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Configuração do Firebase (usando variáveis de ambiente)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const SITE_URL = 'https://transferfortalezatur.com.br';

// Sitemap estático de fallback (páginas principais)
const STATIC_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/categoria/passeio</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/categoria/transfer</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/categoria/beach-park</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/pacotes</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/destinos</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/sobre</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contato</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/avaliacoes</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

/**
 * Formata data do Firestore para formato YYYY-MM-DD
 */
function formatDate(timestamp) {
  if (!timestamp) return new Date().toISOString().split('T')[0];
  
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString().split('T')[0];
  }
  
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString().split('T')[0];
  }
  
  return new Date().toISOString().split('T')[0];
}

/**
 * Gera slug amigável a partir do título
 */
function generateSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Determina prioridade baseada na categoria
 */
function getPriority(categoria) {
  const priorities = {
    'passeio': 0.8,
    'transfer_chegada': 0.7,
    'transfer_saida': 0.7,
    'transfer_chegada_saida': 0.7,
    'transfer_entre_hoteis': 0.7,
    'beach-park': 0.9
  };
  return priorities[categoria] || 0.7;
}

/**
 * Determina frequência de mudança baseada na categoria
 */
function getChangeFreq(categoria) {
  const freqs = {
    'passeio': 'weekly',
    'transfer_chegada': 'monthly',
    'transfer_saida': 'monthly',
    'transfer_chegada_saida': 'monthly',
    'transfer_entre_hoteis': 'monthly',
    'beach-park': 'weekly'
  };
  return freqs[categoria] || 'monthly';
}

/**
 * Handler principal do endpoint
 */
export default async function handler(req, res) {
  // Apenas GET é permitido
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[Sitemap] Gerando sitemap dinâmico...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Buscar todos os pacotes do Firestore
    const pacotesRef = collection(db, 'pacotes');
    const snapshot = await getDocs(pacotesRef);
    
    const pacotes = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      pacotes.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log(`[Sitemap] ${pacotes.length} pacotes encontrados`);
    
    // Gerar XML do sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    
    // Adicionar páginas estáticas
    const staticPages = [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/categoria/passeio', priority: 0.9, changefreq: 'weekly' },
      { loc: '/categoria/transfer', priority: 0.9, changefreq: 'weekly' },
      { loc: '/categoria/beach-park', priority: 0.9, changefreq: 'weekly' },
      { loc: '/pacotes', priority: 0.8, changefreq: 'weekly' },
      { loc: '/destinos', priority: 0.8, changefreq: 'weekly' },
      { loc: '/blog', priority: 0.8, changefreq: 'weekly' },
      { loc: '/sobre', priority: 0.6, changefreq: 'monthly' },
      { loc: '/contato', priority: 0.6, changefreq: 'monthly' },
      { loc: '/avaliacoes', priority: 0.7, changefreq: 'weekly' }
    ];
    
    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });
    
    // Adicionar pacotes individuais
    pacotes.forEach(pacote => {
      const slug = pacote.slug || generateSlug(pacote.titulo);
      const lastmod = formatDate(pacote.updatedAt || pacote.createdAt);
      const priority = getPriority(pacote.categoria);
      const changefreq = getChangeFreq(pacote.categoria);
      
      xml += `  <url>
    <loc>${SITE_URL}/pacote/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
    });
    
    xml += '</urlset>';
    
    console.log('[Sitemap] Sitemap gerado com sucesso');
    
    // Retornar sitemap com headers corretos
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
    
  } catch (error) {
    console.error('[Sitemap] Erro ao gerar sitemap dinâmico:', error);
    
    // Fallback: retornar sitemap estático
    console.log('[Sitemap] Usando sitemap estático de fallback');
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).send(STATIC_SITEMAP);
  }
}
