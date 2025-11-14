import React, { useState, useEffect, useRef } from 'react';
import './OptimizedImage.css';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  loading = 'lazy',
  placeholder = 'blur',
  onLoad,
  style = {},
  priority = false,
  sizes = '100vw'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  // Otimizar URL do Cloudinary para WebP/AVIF
  const optimizeCloudinaryUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    
    // Se for Cloudinary, adicionar transformações
    if (url.includes('res.cloudinary.com')) {
      // Extrair partes da URL
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        // Adicionar transformações: formato auto (WebP/AVIF), qualidade auto, compressão
        const transforms = 'f_auto,q_auto:good,c_limit';
        
        // Se width e height foram fornecidos, adicionar resize
        if (width && height) {
          return `${parts[0]}/upload/${transforms},w_${width},h_${height}/${parts[1]}`;
        }
        
        return `${parts[0]}/upload/${transforms}/${parts[1]}`;
      }
    }
    
    return url;
  };

  // Gerar srcset para imagens responsivas
  const generateSrcSet = (url) => {
    if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
      return null;
    }

    const parts = url.split('/upload/');
    if (parts.length !== 2) return null;

    const widths = [320, 640, 768, 1024, 1280, 1920];
    const srcset = widths.map(w => {
      const optimizedUrl = `${parts[0]}/upload/f_auto,q_auto:good,w_${w},c_limit/${parts[1]}`;
      return `${optimizedUrl} ${w}w`;
    }).join(', ');

    return srcset;
  };

  const optimizedSrc = optimizeCloudinaryUrl(src);
  const srcSet = generateSrcSet(src);

  useEffect(() => {
    // Se for priority, carregar imediatamente
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  return (
    <div 
      ref={imgRef}
      className={`optimized-image-container ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || 'auto',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {!isLoaded && placeholder === 'blur' && (
        <div className="optimized-image-placeholder" />
      )}
      
      {isInView && (
        <img
          src={optimizedSrc}
          srcSet={srcSet || undefined}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : loading}
          fetchpriority={priority ? 'high' : undefined}
          className={`optimized-image ${isLoaded ? 'loaded' : ''}`}
          onLoad={handleLoad}
          decoding="async"
          width={width}
          height={height}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
