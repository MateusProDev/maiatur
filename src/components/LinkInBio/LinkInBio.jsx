import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FiInstagram, FiFacebook, FiGlobe, FiMail, FiPhone, FiMapPin, FiExternalLink } from 'react-icons/fi';
import './LinkInBio.css';

const LinkInBio = () => {
  const [bioData, setBioData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBioData = async () => {
      try {
        const bioRef = doc(db, 'content', 'linkInBio');
        const bioDoc = await getDoc(bioRef);
        
        if (bioDoc.exists()) {
          setBioData(bioDoc.data());
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
      instagram: FiInstagram,
      facebook: FiFacebook,
      globe: FiGlobe,
      mail: FiMail,
      phone: FiPhone,
      mapPin: FiMapPin,
      externalLink: FiExternalLink
    };
    
    return icons[iconName] || FiExternalLink;
  };

  return (
    <div className="link-in-bio">
      <div className="bio-background">
        <div className="bio-gradient"></div>
        <div className="bio-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}></div>
          ))}
        </div>
      </div>

      <div className="bio-container">
        {/* Header com Logo/Avatar */}
        <div className="bio-header">
          {bioData.logo && (
            <div className="bio-avatar">
              <img src={bioData.logo} alt={bioData.name} />
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
                const IconComponent = getIconComponent(social.icon);
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon-link"
                    aria-label={social.label}
                  >
                    <IconComponent />
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
              const IconComponent = getIconComponent(link.icon);
              
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
                      <IconComponent />
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
            Powered by <strong>Maiatur Turismo</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LinkInBio;
