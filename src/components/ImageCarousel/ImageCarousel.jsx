import React, { useState, useRef } from 'react';
import { generateCloudinarySrcset, optimizeCloudinaryUrl } from '../../utils/cloudinaryOptimizer';
import './ImageCarousel.css';

const ImageCarousel = ({ images = [], autoPlay = true, speed = 50 }) => {
  const [isPaused, setIsPaused] = useState(false);
  const track1Ref = useRef(null);
  const track2Ref = useRef(null);
  const track3Ref = useRef(null);

  // Se não houver imagens, não renderiza nada
  if (!images || images.length === 0) {
    return null;
  }

  // Duplicar imagens para criar efeito de loop infinito
  const duplicatedImages = [...images, ...images, ...images];

  const getImageProps = (img) => {
    const src = typeof img === 'string' ? img : img.url;
    const alt = typeof img === 'string' ? '' : img.alt;
    const isCloudinary = src?.includes('res.cloudinary.com');

    return {
      src: isCloudinary
        ? optimizeCloudinaryUrl(src, {
            width: 480,
            height: 480,
            quality: 'auto:eco',
            crop: 'fill'
          })
        : src,
      srcSet: isCloudinary
        ? generateCloudinarySrcset(src, [180, 240, 320, 480])
        : undefined,
      alt: alt || 'Imagem do destino',
      sizes: '(max-width: 480px) 180px, (max-width: 768px) 200px, 300px'
    };
  };

  return (
    <section className="image-carousel-section">
      <div className="image-carousel-container">
        {/* Fileira 1 - desliza para esquerda */}
        <div 
          className="carousel-track track-1"
          ref={track1Ref}
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            animationDuration: `${speed}s`
          }}
        >
          {duplicatedImages.map((img, index) => (
            <div key={`row1-${index}`} className="carousel-image-wrapper">
              <img {...getImageProps(img)} loading="lazy" width="300" height="300" />
            </div>
          ))}
        </div>

        {/* Fileira 2 - desliza para direita */}
        <div 
          className="carousel-track track-2"
          ref={track2Ref}
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            animationDuration: `${speed + 10}s`
          }}
        >
          {duplicatedImages.map((img, index) => (
            <div key={`row2-${index}`} className="carousel-image-wrapper">
              <img {...getImageProps(img)} loading="lazy" width="300" height="300" />
            </div>
          ))}
        </div>

        {/* Fileira 3 - desliza para esquerda */}
        <div 
          className="carousel-track track-3"
          ref={track3Ref}
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            animationDuration: `${speed + 5}s`
          }}
        >
          {duplicatedImages.map((img, index) => (
            <div key={`row3-${index}`} className="carousel-image-wrapper">
              <img {...getImageProps(img)} loading="lazy" width="300" height="300" />
            </div>
          ))}
        </div>
      </div>

      {/* Controle de pausa ao passar o mouse */}
      <div 
        className="carousel-pause-overlay"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      />
    </section>
  );
};

export default ImageCarousel;
