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
  style = {}
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
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
  }, []);

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
          src={src}
          alt={alt}
          loading={loading}
          className={`optimized-image ${isLoaded ? 'loaded' : ''}`}
          onLoad={handleLoad}
          decoding="async"
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
