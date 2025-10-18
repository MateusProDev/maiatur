import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiInfo, 
  FiMapPin,
  FiPackage,
  FiPhone,
  FiMessageCircle
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Header = () => {
  const [logoUrl, setLogoUrl] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const headerRef = doc(db, 'content', 'header');
        const headerDoc = await getDoc(headerRef);

        if (headerDoc.exists()) {
          const url = headerDoc.data().logoUrl;
          setLogoUrl(url);
        }

        // Buscar número do WhatsApp
        const whatsappRef = doc(db, 'settings', 'whatsapp');
        const whatsappDoc = await getDoc(whatsappRef);
        if (whatsappDoc.exists()) {
          setWhatsappNumber(whatsappDoc.data().phoneNumber || '5511999999999');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do header:', error);
      }
    };

    fetchHeaderData();

    // Detectar scroll para adicionar efeito
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Olá! Gostaria de mais informações sobre os pacotes da Maiatur.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    setMenuOpen(false);
  };

  return (
    <header className={`header-modern ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container-modern">
        <Link to="/" className="header-logo-modern">
          {logoUrl ? (
            <img src={logoUrl} alt="Maiatur Logo" />
          ) : (
            <div className="logo-placeholder-modern">
              <span className="logo-text">MAIATUR</span>
              <span className="logo-tagline">Viagens & Turismo</span>
            </div>
          )}
        </Link>

        <button 
          className="header-menu-toggle-modern" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <nav className={`header-nav-modern ${menuOpen ? 'nav-open' : ''}`}>
          <ul className="header-nav-list-modern">
            <li>
              <Link to="/" onClick={() => setMenuOpen(false)} className="nav-link-modern">
                <FiHome className="nav-icon-modern" /> 
                <span>Início</span>
              </Link>
            </li>
            <li>
              <Link to="/pacotes" onClick={() => setMenuOpen(false)} className="nav-link-modern">
                <FiPackage className="nav-icon-modern" /> 
                <span>Pacotes</span>
              </Link>
            </li>
            <li>
              <Link to="/destinos" onClick={() => setMenuOpen(false)} className="nav-link-modern">
                <FiMapPin className="nav-icon-modern" /> 
                <span>Destinos</span>
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="nav-link-modern">
                <FiInfo className="nav-icon-modern" /> 
                <span>Sobre</span>
              </Link>
            </li>
            <li>
              <Link to="/contato" onClick={() => setMenuOpen(false)} className="nav-link-modern">
                <FiPhone className="nav-icon-modern" /> 
                <span>Contato</span>
              </Link>
            </li>
            <li>
              <button 
                onClick={handleWhatsAppClick}
                className="nav-link-modern whatsapp-btn-nav"
              >
                <FaWhatsapp className="nav-icon-modern" /> 
                <span>WhatsApp</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;