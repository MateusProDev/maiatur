import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FaStar, FaGoogle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import './GoogleReviews-new.css';

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

  // Reviews do Firebase
  const reviews = settings?.reviews && settings.reviews.length > 0 ? settings.reviews : [];

  const nextSlide = () => {
    if (reviews.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    if (reviews.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (!settings?.autoplay || reviews.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % reviews.length);
    }, settings?.autoplayDelay || 5000);

    return () => clearInterval(interval);
  }, [currentSlide, settings?.autoplay, settings?.autoplayDelay, reviews.length]);

  if (loading) {
    return (
      <div className="gr-loading">
        <div className="gr-spinner"></div>
      </div>
    );
  }

  if (!settings?.active || reviews.length === 0) {
    return null;
  }

  return (
    <section className="gr-section">
      <div className="gr-wrapper">
        {/* Header */}
        <div className="gr-header">
          {settings?.badge && (
            <span className="gr-badge">{settings.badge}</span>
          )}
          <h2 className="gr-title">{settings?.title || 'O que nossos clientes dizem'}</h2>
          {settings?.subtitle && (
            <p className="gr-description">{settings.subtitle}</p>
          )}
          
          {/* Google Rating Badge */}
          <div className="gr-rating-badge">
            <FaGoogle className="gr-google-icon" />
            <div className="gr-rating-content">
              <div className="gr-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} className="gr-star" />
                ))}
              </div>
              <span className="gr-rating-text">5.0 no Google</span>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="gr-carousel">
          <button 
            className="gr-btn gr-btn-prev" 
            onClick={prevSlide} 
            aria-label="Anterior"
            disabled={reviews.length <= 1}
          >
            <FaChevronLeft />
          </button>

          <div className="gr-track">
            <div 
              className="gr-slides"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="gr-card">
                  <div className="gr-card-inner">
                    <div className="gr-card-header">
                      <img 
                        src={review.photo} 
                        alt={review.name}
                        className="gr-avatar"
                      />
                      <div className="gr-reviewer-info">
                        <h3 className="gr-reviewer-name">{review.name}</h3>
                        <div className="gr-review-stars">
                          {[...Array(review.rating)].map((_, i) => (
                            <FaStar key={i} className="gr-review-star" />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="gr-review-text">{review.text}</p>
                    
                    <span className="gr-review-date">{review.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="gr-btn gr-btn-next" 
            onClick={nextSlide} 
            aria-label="Próximo"
            disabled={reviews.length <= 1}
          >
            <FaChevronRight />
          </button>
        </div>

        {/* Dots Navigation */}
        {reviews.length > 1 && (
          <div className="gr-dots">
            {reviews.map((_, index) => (
              <button
                key={index}
                className={`gr-dot ${index === currentSlide ? 'gr-dot-active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Ir para avaliação ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* CTA Button */}
        {settings?.googleUrl && (
          <div className="gr-cta">
            <a 
              href={settings.googleUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="gr-cta-btn"
            >
              <span className="gr-cta-text">Ver todas as avaliações no Google</span>
              <FiArrowRight className="gr-cta-icon" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default GoogleReviews;
