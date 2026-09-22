/**
 * API Endpoint para geração de llms.txt
 * Expõe uma lista curada de URLs importantes para IA e crawlers.
 * Mantém o conteúdo atualizado com pacotes e posts do blog em tempo real.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID
};

const SITE_URL = process.env.REACT_APP_SITE_URL || process.env.SITE_URL || 'https://transferfortalezatur.com.br';

function formatDate(timestamp) {
  if (!timestamp) return new Date().toISOString().split('T')[0];

  if (timestamp.toDate) {
    return timestamp.toDate().toISOString().split('T')[0];
  }

  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString().split('T')[0];
  }

  return new Date(timestamp).toISOString().split('T')[0];
}

function generateSlug(titulo) {
  return String(titulo || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

function dedupe(items) {
  return [...new Set(items.filter(Boolean))];
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const pacotesSnapshot = await getDocs(collection(db, 'pacotes'));
    const blogSnapshot = await getDocs(query(collection(db, 'blogPosts'), where('published', '==', true)));

    const packageUrls = pacotesSnapshot.docs
      .map((doc) => {
        const data = doc.data() || {};
        const slug = data.slug || generateSlug(data.titulo || 'pacote');
        return `${SITE_URL}/pacote/${slug}`;
      })
      .filter(Boolean);

    const blogUrls = blogSnapshot.docs
      .map((doc) => {
        const data = doc.data() || {};
        const slug = data.slug || generateSlug(data.title || 'post');
        return `${SITE_URL}/blog/${slug}`;
      })
      .filter(Boolean);

    const entries = dedupe([
      `${SITE_URL}/`,
      `${SITE_URL}/blog`,
      `${SITE_URL}/pacotes`,
      `${SITE_URL}/destinos`,
      `${SITE_URL}/sobre`,
      `${SITE_URL}/contato`,
      `${SITE_URL}/avaliacoes`,
      ...packageUrls,
      ...blogUrls
    ]);

    const today = new Date().toISOString().split('T')[0];
    const text = [
      '# Transfer Fortaleza Tur',
      '',
      `Site: ${SITE_URL}`,
      `Last updated: ${today}`,
      '',
      '## Páginas principais',
      ...entries.map((url) => `- ${url}`),
      '',
      '## Descrição',
      'Empresa especializada em traslados, passeios e experiências em Fortaleza e destinos turísticos do Ceará.',
      '',
      '## Conteúdo importante',
      '- Pacotes turísticos com preços e itinerários.',
      '- Dicas e artigos do blog para viagens e destinos.',
      '- Transfer e passeios personalizados para chegada e saída.',
      ''
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
    res.status(200).send(text);
  } catch (error) {
    console.error('[LLMS] Erro ao gerar llms.txt:', error);

    const fallback = [
      '# Transfer Fortaleza Tur',
      '',
      `Site: ${SITE_URL}`,
      '',
      '## Páginas principais',
      `${SITE_URL}/`,
      `${SITE_URL}/blog`,
      `${SITE_URL}/pacotes`,
      `${SITE_URL}/destinos`,
      `${SITE_URL}/sobre`,
      `${SITE_URL}/contato`,
      `${SITE_URL}/avaliacoes`,
      ''
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
    res.status(200).send(fallback);
  }
}
