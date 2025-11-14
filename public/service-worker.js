/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'maiatur-v1';
const CACHE_DURATION = 90 * 60 * 1000; // 90 minutos

// Assets para cache imediato
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/favicon.ico',
  '/manifest.json'
];

// Padrões de URL para estratégias diferentes
const CACHE_STRATEGIES = {
  images: /\.(png|jpg|jpeg|gif|webp|avif|svg)$/i,
  cloudinary: /res\.cloudinary\.com/,
  firebase: /firebasestorage\.googleapis\.com|firestore\.googleapis\.com/,
  static: /\.(js|css|woff|woff2|ttf|eot)$/i
};

// Install: cachear assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto, adicionando assets estáticos');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Removendo cache antigo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: estratégias de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') return;

  // Ignorar chrome-extension e outras origens não-HTTP
  if (!url.protocol.startsWith('http')) return;

  // Estratégia: Cache First para imagens e assets estáticos
  if (CACHE_STRATEGIES.images.test(url.pathname) || 
      CACHE_STRATEGIES.cloudinary.test(url.hostname) ||
      CACHE_STRATEGIES.static.test(url.pathname)) {
    
    event.respondWith(
      cacheFirst(request)
    );
    return;
  }

  // Estratégia: Network First com cache fallback para Firebase e API
  if (CACHE_STRATEGIES.firebase.test(url.hostname) || 
      url.pathname.includes('/api/') ||
      url.hostname.includes('firebaseapp.com')) {
    
    event.respondWith(
      networkFirst(request)
    );
    return;
  }

  // Estratégia: Stale While Revalidate para páginas HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      staleWhileRevalidate(request)
    );
    return;
  }

  // Default: Network First
  event.respondWith(
    networkFirst(request)
  );
});

// Estratégia: Cache First (melhor para assets estáticos)
async function cacheFirst(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    // Verificar se o cache está expirado
    const cacheTime = await getCacheTimestamp(request.url);
    if (cacheTime && (Date.now() - cacheTime < CACHE_DURATION)) {
      return cached;
    }
  }

  try {
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
      await setCacheTimestamp(request.url, Date.now());
    }
    
    return response;
  } catch (error) {
    // Retornar cache mesmo se expirado, se network falhar
    if (cached) return cached;
    throw error;
  }
}

// Estratégia: Network First (melhor para dados dinâmicos)
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
      await setCacheTimestamp(request.url, Date.now());
    }
    
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

// Estratégia: Stale While Revalidate (melhor para páginas HTML)
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then(async (response) => {
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
      await setCacheTimestamp(request.url, Date.now());
    }
    return response;
  });

  return cached || fetchPromise;
}

// Helpers para timestamps
async function getCacheTimestamp(url) {
  try {
    const cache = await caches.open(`${CACHE_NAME}-timestamps`);
    const response = await cache.match(url);
    if (response) {
      const timestamp = await response.text();
      return parseInt(timestamp, 10);
    }
  } catch (error) {
    console.error('[SW] Erro ao obter timestamp:', error);
  }
  return null;
}

async function setCacheTimestamp(url, timestamp) {
  try {
    const cache = await caches.open(`${CACHE_NAME}-timestamps`);
    await cache.put(url, new Response(timestamp.toString()));
  } catch (error) {
    console.error('[SW] Erro ao definir timestamp:', error);
  }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});
