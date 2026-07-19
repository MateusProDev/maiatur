import React, { useState, useEffect, useRef } from 'react';
import { optimizeCloudinaryUrl, generateCloudinarySrcset } from '../../utils/cloudinaryOptimizer';
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

  // Usar o otimizador centralizado do Cloudinary
  const optimizedSrc = optimizeCloudinaryUrl(src, {
    width,
    height,
    quality: 'auto:eco', // Maior compressão para performance
    format: 'auto', // WebP/AVIF automático
    crop: width && height ? 'fill' : 'limit'
  });

  const srcSet = generateCloudinarySrcset(src, [320, 640, 768, 1024, 1280, 1920]);

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
