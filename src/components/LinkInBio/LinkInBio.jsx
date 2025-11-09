import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FiExternalLink } from 'react-icons/fi';
import './LinkInBio.css';

const LinkInBio = () => {
  const [bioData, setBioData] = useState(null);
  const [headerLogo, setHeaderLogo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBioData = async () => {
      try {
        // Buscar dados do Link in Bio
        const bioRef = doc(db, 'content', 'linkInBio');
        const bioDoc = await getDoc(bioRef);
        
        if (bioDoc.exists()) {
          setBioData(bioDoc.data());
        }

        // Buscar logo do Header/Navbar
        const headerRef = doc(db, 'content', 'header');
        const headerDoc = await getDoc(headerRef);
        
        if (headerDoc.exists() && headerDoc.data().logoUrl) {
          setHeaderLogo(headerDoc.data().logoUrl);
        }
      } catch (error) {
        console.error('Erro ao carregar link in bio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBioData();
  }, []);

  if (loading) {
    return (
      <div className="link-bio-loading">
        <div className="bio-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!bioData) {
    return (
      <div className="link-bio-error">
        <p>Link in Bio não configurado</p>
      </div>
    );
  }

  const getIconComponent = (iconName) => {
    const icons = {
      instagram: '📷',
      facebook: '👍',
      tiktok: '🎵',
      youtube: '▶️',
      globe: '🌐',
      blog: '📝',
      mail: '📧',
      phone: '📞',
      whatsapp: '💬',
      mapPin: '📍',
      tripadvisor: '🦉',
      googleReviews: '⭐',
      beachPark: '🎢',
      tickets: '🎫',
      externalLink: '🔗'
    };
    
    return icons[iconName] || '🔗';
  };

  const getIconLabel = (iconName) => {
    const labels = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      tiktok: 'TikTok',
      youtube: 'YouTube',
      globe: 'Website',
      blog: 'Blog',
      mail: 'Email',
      phone: 'Telefone',
      whatsapp: 'WhatsApp',
      mapPin: 'Localização',
      tripadvisor: 'TripAdvisor',
      googleReviews: 'Avaliações Google',
      beachPark: 'Beach Park',
      tickets: 'Ingressos',
      externalLink: 'Link'
    };
    
    return labels[iconName] || 'Link';
  };

  return (
    <div className="link-in-bio">
      {/* Background com tema de turismo */}
      <div className="bio-background">
        <div className="bio-gradient"></div>
        <div className="tourism-elements">
          <div className="floating-icon" style={{ top: '10%', left: '10%', animationDelay: '0s' }}>✈️</div>
          <div className="floating-icon" style={{ top: '20%', right: '15%', animationDelay: '1s' }}>🏖️</div>
          <div className="floating-icon" style={{ top: '60%', left: '8%', animationDelay: '2s' }}>🌴</div>
          <div className="floating-icon" style={{ bottom: '20%', right: '10%', animationDelay: '3s' }}>🌊</div>
          <div className="floating-icon" style={{ top: '40%', right: '5%', animationDelay: '1.5s' }}>☀️</div>
          <div className="floating-icon" style={{ bottom: '30%', left: '15%', animationDelay: '2.5s' }}>🗺️</div>
        </div>
        <div className="bio-particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="bio-container">
        {/* Header com Logo/Avatar */}
        <div className="bio-header">
          {(headerLogo || bioData.logo) && (
            <div className="bio-avatar">
              <img src={headerLogo || bioData.logo} alt={bioData.name} />
              <div className="avatar-ring"></div>
            </div>
          )}
          
          <h1 className="bio-name">{bioData.name || 'Maiatur Turismo'}</h1>
          
          {bioData.description && (
            <p className="bio-description">{bioData.description}</p>
          )}

          {/* Social Icons */}
          {bioData.socialLinks && bioData.socialLinks.length > 0 && (
            <div className="bio-social-icons">
              {bioData.socialLinks.map((social, index) => {
                const iconEmoji = getIconComponent(social.icon);
                const iconLabel = getIconLabel(social.icon);
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon-link"
                    aria-label={social.label || iconLabel}
                    title={social.label || iconLabel}
                  >
                    <span className="icon-emoji">{iconEmoji}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Links/Buttons */}
        <div className="bio-links">
          {bioData.links && bioData.links
            .filter(link => link.active)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((link, index) => {
              const iconEmoji = getIconComponent(link.icon);
              
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bio-link ${link.highlighted ? 'highlighted' : ''}`}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="link-content">
                    <div className="link-icon">
                      <span className="icon-emoji">{iconEmoji}</span>
                    </div>
                    <div className="link-text">
                      <span className="link-title">{link.title}</span>
                      {link.subtitle && (
                        <span className="link-subtitle">{link.subtitle}</span>
                      )}
                    </div>
                  </div>
                  <FiExternalLink className="link-arrow" />
                </a>
              );
            })}
        </div>

        {/* Footer */}
        <div className="bio-footer">
          {bioData.footerText && (
            <p className="footer-text">{bioData.footerText}</p>
          )}
          <p className="powered-by">
            ✈️ Powered by <strong>Maiatur Turismo</strong> 🌴
          </p>
        </div>
      </div>
    </div>
  );
};

export default LinkInBio;
