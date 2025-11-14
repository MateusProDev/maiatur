// Firebase Cache Utility
// Reduz chamadas ao Firebase armazenando dados no sessionStorage

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const CACHE_PREFIX = 'firebase_cache_';

class FirebaseCache {
  constructor() {
    this.memoryCache = new Map();
  }

  // Gerar chave única para o cache
  generateKey(collection, docId, query = {}) {
    const queryString = JSON.stringify(query);
    return `${CACHE_PREFIX}${collection}_${docId}_${queryString}`;
  }

  // Verificar se o cache está válido
  isValid(cacheData) {
    if (!cacheData || !cacheData.timestamp) return false;
    const now = Date.now();
    return (now - cacheData.timestamp) < CACHE_DURATION;
  }

  // Obter do cache
  get(collection, docId, query = {}) {
    const key = this.generateKey(collection, docId, query);
    
    // Tentar memória primeiro (mais rápido)
    if (this.memoryCache.has(key)) {
      const cached = this.memoryCache.get(key);
      if (this.isValid(cached)) {
        console.log(`✅ Cache HIT (memory): ${key}`);
        return cached.data;
      }
      this.memoryCache.delete(key);
    }

    // Tentar sessionStorage
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (this.isValid(parsed)) {
          console.log(`✅ Cache HIT (storage): ${key}`);
          // Copiar para memória
          this.memoryCache.set(key, parsed);
          return parsed.data;
        }
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Erro ao ler cache:', error);
    }

    console.log(`❌ Cache MISS: ${key}`);
    return null;
  }

  // Salvar no cache
  set(collection, docId, data, query = {}) {
    const key = this.generateKey(collection, docId, query);
    const cacheData = {
      data,
      timestamp: Date.now()
    };

    // Salvar em memória
    this.memoryCache.set(key, cacheData);

    // Salvar em sessionStorage
    try {
      sessionStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`💾 Cache SET: ${key}`);
    } catch (error) {
      console.warn('Erro ao salvar cache:', error);
      // Se sessionStorage estiver cheio, limpar caches antigos
      this.clearOldCaches();
    }
  }

  // Invalidar cache específico
  invalidate(collection, docId, query = {}) {
    const key = this.generateKey(collection, docId, query);
    this.memoryCache.delete(key);
    try {
      sessionStorage.removeItem(key);
      console.log(`🗑️ Cache INVALIDATE: ${key}`);
    } catch (error) {
      console.warn('Erro ao invalidar cache:', error);
    }
  }

  // Limpar todos os caches
  clearAll() {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
      console.log('🗑️ Todos os caches limpos');
    } catch (error) {
      console.warn('Erro ao limpar caches:', error);
    }
  }

  // Limpar caches antigos
  clearOldCaches() {
    try {
      const keys = Object.keys(sessionStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            const stored = sessionStorage.getItem(key);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (!this.isValid(parsed)) {
                sessionStorage.removeItem(key);
              }
            }
          } catch (e) {
            sessionStorage.removeItem(key);
          }
        }
      });
      console.log('🧹 Caches antigos limpos');
    } catch (error) {
      console.warn('Erro ao limpar caches antigos:', error);
    }
  }

  // Obter estatísticas do cache
  getStats() {
    const memorySize = this.memoryCache.size;
    let storageSize = 0;
    
    try {
      const keys = Object.keys(sessionStorage);
      storageSize = keys.filter(k => k.startsWith(CACHE_PREFIX)).length;
    } catch (error) {
      console.warn('Erro ao obter stats:', error);
    }

    return {
      memorySize,
      storageSize,
      totalSize: memorySize + storageSize
    };
  }
}

// Exportar instância única (Singleton)
const firebaseCache = new FirebaseCache();

// Limpar caches antigos na inicialização
if (typeof window !== 'undefined') {
  firebaseCache.clearOldCaches();
}

export default firebaseCache;
