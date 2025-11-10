import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FaStar, FaGoogle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './GoogleReviews.css';

const GoogleReviews = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'content', 'googleReviews');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reviews de exemplo (você pode substituir por dados reais se usar API)
  const reviews = settings?.reviews || [
    {
      id: 1,
      author: 'Maria Silva',
      rating: 5,
      text: 'Excelente serviço! Super recomendo. A equipe é muito atenciosa e profissional.',
      date: '2 semanas atrás',
      photo: 'https://via.placeholder.com/80'
    },
    {
      id: 2,
      author: 'João Santos',
      rating: 5,
      text: 'Melhor experiência que tive! Tudo perfeito, desde o atendimento até a execução do serviço.',
      date: '1 mês atrás',
      photo: 'https://via.placeholder.com/80'
    },
    {
      id: 3,
      author: 'Ana Costa',
      rating: 5,
      text: 'Simplesmente perfeito! Superou todas as minhas expectativas. Voltarei com certeza!',
      date: '3 semanas atrás',
      photo: 'https://via.placeholder.com/80'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (!settings?.autoplay) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, settings?.autoplayDelay || 5000);

    return () => clearInterval(interval);
  }, [currentSlide, settings]);

  if (loading) {
    return (
      <div className="google-reviews-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!settings?.active) {
    return null;
  }

  return (
    <section className="google-reviews-section">
      <div className="reviews-container">
        {/* Header */}
        <div className="reviews-header">
          <h2>{settings?.title || 'O que nossos clientes dizem'}</h2>
          <p className="reviews-subtitle">{settings?.subtitle || 'Avaliações reais de clientes satisfeitos'}</p>
          
          {/* Google Rating */}
          <div className="google-rating">
            <FaGoogle className="google-icon" />
            <div className="rating-info">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} className="star-icon" />
                ))}
              </div>
              <span className="rating-text">5.0 no Google</span>
            </div>
          </div>
        </div>

        {/* Carrossel */}
        <div className="reviews-carousel">
          <button className="carousel-btn prev" onClick={prevSlide} aria-label="Anterior">
            <FaChevronLeft />
          </button>

          <div className="reviews-track">
            <div 
              className="reviews-slider"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <img 
                      src={review.photo} 
                      alt={review.author}
                      className="reviewer-photo"
                    />
                    <div className="reviewer-info">
                      <h3 className="reviewer-name">{review.author}</h3>
                      <div className="review-stars">
                        {[...Array(review.rating)].map((_, i) => (
                          <FaStar key={i} className="star" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="review-text">{review.text}</p>
                  
                  <div className="review-footer">
                    <span className="review-date">{review.date}</span>
                    <FaGoogle className="google-badge" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="carousel-btn next" onClick={nextSlide} aria-label="Próximo">
            <FaChevronRight />
          </button>
        </div>

        {/* Dots */}
        <div className="carousel-dots">
          {reviews.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Ir para avaliação ${index + 1}`}
            />
          ))}
        </div>

        {/* Link para Google */}
        {settings?.googleUrl && (
          <div className="reviews-cta">
            <a 
              href={settings.googleUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="google-btn"
            >
              <FaGoogle />
              Ver todas as avaliações no Google
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default GoogleReviews;
