/**
 * Instagram Lazy Loader
 * Carrega o script do Instagram embed apenas quando necessário
 */

let instagramScriptLoaded = false;
let instagramLoadingPromise = null;

/**
 * Carrega o script do Instagram sob demanda
 * @returns {Promise} Promise que resolve quando o script estiver carregado
 */
export const loadInstagramEmbed = () => {
  // Se já está carregado, retorna
  if (instagramScriptLoaded) {
    return Promise.resolve();
  }

  // Se já está carregando, retorna a promise existente
  if (instagramLoadingPromise) {
    return instagramLoadingPromise;
  }

  // Cria nova promise de carregamento
  instagramLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    
    script.onload = () => {
      instagramScriptLoaded = true;
      console.log('✅ Instagram embed script carregado');
      
      // Processa embeds existentes
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
      
      resolve();
    };
    
    script.onerror = () => {
      console.error('❌ Erro ao carregar Instagram embed script');
      reject(new Error('Failed to load Instagram embed script'));
    };
    
    document.body.appendChild(script);
  });

  return instagramLoadingPromise;
};

/**
 * Hook para componentes que usam Instagram embeds
 * Detecta quando o componente entra no viewport e carrega o script
 */
export const useInstagramLazyLoad = (ref) => {
  if (typeof window === 'undefined') return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadInstagramEmbed();
          observer.disconnect();
        }
      });
    },
    {
      rootMargin: '200px', // Carrega 200px antes de entrar no viewport
      threshold: 0.01
    }
  );

  if (ref.current) {
    observer.observe(ref.current);
  }

  return () => {
    if (observer) observer.disconnect();
  };
};

export default {
  loadInstagramEmbed,
  useInstagramLazyLoad
};
