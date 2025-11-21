/**
 * Utilitário para otimizar URLs do Cloudinary
 * Adiciona transformações automáticas de formato, qualidade e resize
 */

/**
 * Otimiza URL do Cloudinary com transformações
 * @param {string} url - URL original do Cloudinary
 * @param {object} options - Opções de transformação
 * @param {number} options.width - Largura desejada
 * @param {number} options.height - Altura desejada
 * @param {string} options.quality - Qualidade (auto, auto:good, auto:best)
 * @param {string} options.format - Formato (auto para WebP/AVIF automático)
 * @param {string} options.crop - Modo de crop (limit, fill, fit, scale)
 * @returns {string} URL otimizada
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url;
  
  // Verificar se é URL do Cloudinary
  if (!url.includes('res.cloudinary.com')) return url;

  // Opções padrão
  const {
    width = null,
    height = null,
    quality = 'auto:eco', // Mudado de auto:good para auto:eco para melhor compressão
    format = 'auto',
    crop = 'limit',
    dpr = 'auto'
  } = options;

  // Extrair partes da URL
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  // Construir transformações
  const transforms = [];
  
  // Formato automático (WebP/AVIF)
  if (format) transforms.push(`f_${format}`);
  
  // Qualidade automática
  if (quality) transforms.push(`q_${quality}`);
  
  // Device Pixel Ratio automático
  if (dpr) transforms.push(`dpr_${dpr}`);
  
  // Crop mode
  if (crop) transforms.push(`c_${crop}`);
  
  // Dimensões
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);

  // Montar URL final
  const transformString = transforms.join(',');
  return `${parts[0]}/upload/${transformString}/${parts[1]}`;
};

/**
 * Gera srcset para imagens responsivas
 * @param {string} url - URL base do Cloudinary
 * @param {array} widths - Array de larguras [320, 640, 768, 1024, 1280, 1920]
 * @returns {string} String srcset
 */
export const generateCloudinarySrcset = (url, widths = [320, 640, 768, 1024, 1280, 1920]) => {
  if (!url || !url.includes('res.cloudinary.com')) return null;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return null;

  return widths.map(w => {
    const optimized = optimizeCloudinaryUrl(url, { width: w });
    return `${optimized} ${w}w`;
  }).join(', ');
};

/**
 * Otimiza imagem para o contexto específico
 */
export const cloudinaryPresets = {
  // Logo no header (50x50)
  logo: (url) => optimizeCloudinaryUrl(url, {
    width: 100, // 2x para retina
    height: 100,
    quality: 'auto:best',
    crop: 'fill'
  }),

  // Avatar de review (60x60)
  avatar: (url) => optimizeCloudinaryUrl(url, {
    width: 120, // 2x para retina
    height: 120,
    quality: 'auto:good',
    crop: 'fill',
    format: 'auto'
  }),

  // Banner hero (full width, ~1920px)
  banner: (url) => optimizeCloudinaryUrl(url, {
    width: 1920,
    height: 800,
    quality: 'auto:eco', // Mudado para eco - maior compressão
    crop: 'fill'
  }),

  // Card de serviço (mobile ~402px, desktop ~665px)
  serviceCard: (url) => optimizeCloudinaryUrl(url, {
    width: 800, // Tamanho médio
    height: 450,
    quality: 'auto:eco', // Mudado para eco
    crop: 'fill'
  }),

  // Card de pacote no carrossel
  packageCard: (url) => optimizeCloudinaryUrl(url, {
    width: 600,
    height: 400,
    quality: 'auto:eco', // Mudado para eco
    crop: 'fill'
  }),

  // Thumbnail de blog
  blogThumb: (url) => optimizeCloudinaryUrl(url, {
    width: 600,
    height: 400,
    quality: 'auto:eco', // Mudado para eco
    crop: 'fill'
  })
};

/**
 * Detecta e otimiza automaticamente baseado no contexto
 */
export const autoOptimize = (url, context = 'default') => {
  if (!url) return url;

  // Se tem preset definido, usa ele
  if (cloudinaryPresets[context]) {
    return cloudinaryPresets[context](url);
  }

  // Caso contrário, aplica otimização básica
  return optimizeCloudinaryUrl(url, {
    quality: 'auto:eco', // Mudado para eco
    format: 'auto'
  });
};

const cloudinaryUtils = {
  optimizeCloudinaryUrl,
  generateCloudinarySrcset,
  cloudinaryPresets,
  autoOptimize
};

export default cloudinaryUtils;
