import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiArrowRight } from 'react-icons/fi';
import { autoOptimize } from '../../utils/cloudinaryOptimizer';
import './PacotesCarousel.css';

const PacotesCarousel = ({ pacotes, categoria, autoPlayInterval = 5000, verMaisLink = '/pacotes' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const intervalRef = useRef(null);
  const carouselRef = useRef(null);

  const itemsPerView = {
    desktop: 3,
    tablet: 2,
    mobile: 1
  };

  const [itemsToShow, setItemsToShow] = useState(itemsPerView.desktop);

  // Responsive
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setItemsToShow(itemsPerView.mobile);
      } else if (window.innerWidth <= 1024) {
        setItemsToShow(itemsPerView.tablet);
      } else {
        setItemsToShow(itemsPerView.desktop);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AutoPlay
  useEffect(() => {
    if (isPlaying && pacotes.length > itemsToShow) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isPlaying, pacotes.length, itemsToShow]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = pacotes.length - itemsToShow;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  // Pausar ao passar mouse/toque
  const handleMouseEnter = () => {
    setIsPlaying(false);
  };

  // Funcionalidade de arrastar com mouse
  const handleMouseDown = (e) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setIsPlaying(false);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    // scrollLeft removed - was unused
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (startX - x) / 100; // Sensibilidade do arrasto
    
    if (Math.abs(walk) > 0.5) {
      if (walk > 0 && currentIndex < pacotes.length - itemsToShow) {
        setCurrentIndex(prev => Math.min(prev + 1, pacotes.length - itemsToShow));
        setStartX(e.pageX - carouselRef.current.offsetLeft);
      } else if (walk < 0 && currentIndex > 0) {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
        setStartX(e.pageX - carouselRef.current.offsetLeft);
      }
    }
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setIsPlaying(true);
    }
  };

  // Funcionalidade de arrastar com toque
  const handleTouchStartDrag = (e) => {
    if (!carouselRef.current) return;
    setIsPlaying(false);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
  };

  const handleTouchMoveDrag = (e) => {
    if (!carouselRef.current || !startX) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (startX - x) / 100;
    
    if (Math.abs(walk) > 0.5) {
      if (walk > 0 && currentIndex < pacotes.length - itemsToShow) {
        setCurrentIndex(prev => Math.min(prev + 1, pacotes.length - itemsToShow));
        setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
      } else if (walk < 0 && currentIndex > 0) {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
        setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
      }
    }
  };

  const handleTouchEndDrag = () => {
    setStartX(0);
    setIsPlaying(true);
  };

  if (!pacotes || pacotes.length === 0) {
    console.log('⚠️ PacotesCarousel: Nenhum pacote para exibir', { categoria });
    return null;
  }

  console.log('✅ PacotesCarousel renderizando:', {
    categoria,
    totalPacotes: pacotes.length,
    itemsToShow,
    currentIndex
  });

  const maxIndex = Math.max(0, pacotes.length - itemsToShow);

  return (
    <div className="pacotes-carousel-wrapper">
      <div className="carousel-header">
        <h3 className="carousel-title">{categoria}</h3>
        <Link to={verMaisLink} className="carousel-ver-mais">
          Ver Mais
          <FiArrowRight />
        </Link>
      </div>

      <div 
        ref={carouselRef}
        className="carousel-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseUpOrLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onTouchStart={handleTouchStartDrag}
        onTouchMove={handleTouchMoveDrag}
        onTouchEnd={handleTouchEndDrag}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className="carousel-track"
          style={{
            transform: itemsToShow === 1 
              ? `translateX(-${currentIndex * 100}%)`
              : `translateX(calc(-${currentIndex * (100 / itemsToShow)}% - ${currentIndex * (1.5 / itemsToShow)}rem))`,
            transition: 'transform 0.5s ease-in-out'
          }}
        >
          {pacotes.map((pacote, index) => {
            const imagemUrl = pacote.imagens?.[0] || 
                             pacote.imagemUrl || 
                             'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';

            const cardWidth = itemsToShow === 1 
              ? '100%' 
              : `calc((100% - ${(itemsToShow - 1) * 1.5}rem) / ${itemsToShow})`;

            return (
              <Link 
                to={`/pacote/${pacote.slug || pacote.id}`} 
                key={pacote.id}
                className="carousel-card"
                style={{ 
                  minWidth: cardWidth,
                  maxWidth: cardWidth,
                  width: cardWidth,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="carousel-card-image">
                  <img 
                    src={autoOptimize(imagemUrl, 'packageCard')} 
                    alt={pacote.titulo}
                    loading="lazy"
                    width="600"
                    height="400"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';
                    }}
                  />
                  {pacote.destaque && (
                    <div className="carousel-badge-destaque">
                      <FiStar />
                      Destaque
                    </div>
                  )}
                  <div className="carousel-card-overlay"></div>
                </div>
                
                <div className="carousel-card-content">
                  <h4 className="carousel-card-title">{pacote.titulo}</h4>
                  <p className="carousel-card-description">{pacote.descricaoCurta}</p>
                  
                  <div className="carousel-card-footer">
                    {pacote.mostrarPreco === true && pacote.preco && (
                      <div className="carousel-price-box">
                        {pacote.precoOriginal && (
                          <span className="carousel-price-original">
                            R$ {Number(pacote.precoOriginal).toFixed(2).replace('.', ',')}
                          </span>
                        )}
                        <span className="carousel-price-current">
                          R$ {Number(pacote.preco).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    )}
                    
                    <div className="carousel-card-btn">
                      Ver Detalhes
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="carousel-dots">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PacotesCarousel;


