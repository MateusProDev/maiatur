import React, { useState, useEffect, useRef } from 'react';
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
              <img src={img.url} alt={img.alt || `Imagem ${index + 1}`} loading="lazy" />
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
              <img src={img.url} alt={img.alt || `Imagem ${index + 1}`} loading="lazy" />
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
              <img src={img.url} alt={img.alt || `Imagem ${index + 1}`} loading="lazy" />
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
