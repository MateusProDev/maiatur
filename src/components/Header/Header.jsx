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
  FiMessageCircle,
  FiMail,
  FiSmartphone
} from 'react-icons/fi';
import { 
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaLinkedinIn
} from 'react-icons/fa';

const Header = () => {
  const [logoUrl, setLogoUrl] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [socialMedia, setSocialMedia] = useState({});
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(true);
  const [showInstallModal, setShowInstallModal] = useState(false); // Sempre visível para teste

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

        // Buscar redes sociais do footer
        const footerRef = doc(db, 'content', 'footer');
        const footerDoc = await getDoc(footerRef);
        if (footerDoc.exists() && footerDoc.data().social) {
          setSocialMedia(footerDoc.data().social);
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

    // Detectar se o PWA pode ser instalado
    const handleBeforeInstallPrompt = (e) => {
      console.log('🎉 Evento beforeinstallprompt capturado!');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar se o PWA já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    console.log('App já instalado?', isStandalone);
    
    if (isStandalone) {
      setShowInstallButton(false);
    }

    // Log para debug
    console.log('PWA: Listeners configurados');

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    console.log('Botão de instalação clicado. deferredPrompt:', deferredPrompt);
    
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setShowInstallButton(false);
      return;
    }

    // Sempre abre o modal primeiro
    setShowInstallModal(true);
  };

  const handleInstallNow = async () => {
    if (!deferredPrompt) {
      // Se não há prompt disponível, fecha o modal
      console.log('Prompt de instalação não disponível');
      setShowInstallModal(false);
      return;
    }

    try {
      // Mostra o prompt de instalação nativo
      console.log('Mostrando prompt de instalação nativo...');
      await deferredPrompt.prompt();
      
      // Aguarda a escolha do usuário
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Resultado da instalação:', outcome);

      if (outcome === 'accepted') {
        console.log('✅ Usuário aceitou instalar o PWA');
        setShowInstallButton(false);
      }

      setDeferredPrompt(null);
      setShowInstallModal(false);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      setShowInstallModal(false);
    }
  };

  console.log('Header - showInstallButton:', showInstallButton);

  return (
    <header className={`header-modern ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container-modern">
        <Link to="/" className="header-logo-modern">
          {logoUrl ? (
            <img src={logoUrl} alt="Transfer Fortaleza Tur Logo" />
          ) : (
            <div className="logo-placeholder-modern">
              <span className="logo-text">TRANSFER FORTALEZA TUR</span>
              <span className="logo-tagline">Viagens & Turismo</span>
            </div>
          )}
        </Link>

        <div className="header-actions-modern">
          {showInstallButton && (
            <button 
              className="header-install-btn-modern" 
              onClick={handleInstallClick}
              aria-label="Instalar aplicativo"
              title="Instalar Transfer Fortaleza Tur como App"
            >
              <FiSmartphone />
              <span className="install-text">App</span>
            </button>
          )}

          <button 
            className="header-menu-toggle-modern" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

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
                <span>Sobre Nós</span>
              </Link>
            </li>
            <li>
              <Link to="/contato" onClick={() => setMenuOpen(false)} className="nav-link-modern">
                <FiPhone className="nav-icon-modern" /> 
                <span>Contato</span>
              </Link>
            </li>
          </ul>

          {/* Seção de Redes Sociais */}
          <div className="header-nav-social">
            <h4 className="nav-social-title">
              <FiMessageCircle className="nav-social-icon-title" />
              Conecte-se Conosco
            </h4>
            <div className="nav-social-grid">
              {socialMedia.whatsapp?.link && (
                <a 
                  href={socialMedia.whatsapp.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="nav-social-btn nav-social-whatsapp"
                  onClick={() => setMenuOpen(false)}
                  title="WhatsApp"
                >
                  <FaWhatsapp />
                </a>
              )}
              {socialMedia.instagram?.link && (
                <a 
                  href={socialMedia.instagram.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="nav-social-btn nav-social-instagram"
                  onClick={() => setMenuOpen(false)}
                  title="Instagram"
                >
                  <FaInstagram />
                </a>
              )}
              {socialMedia.facebook?.link && (
                <a 
                  href={socialMedia.facebook.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="nav-social-btn nav-social-facebook"
                  onClick={() => setMenuOpen(false)}
                  title="Facebook"
                >
                  <FaFacebookF />
                </a>
              )}
              {socialMedia.youtube?.link && (
                <a 
                  href={socialMedia.youtube.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="nav-social-btn nav-social-youtube"
                  onClick={() => setMenuOpen(false)}
                  title="YouTube"
                >
                  <FaYoutube />
                </a>
              )}
              {socialMedia.twitter?.link && (
                <a 
                  href={socialMedia.twitter.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="nav-social-btn nav-social-twitter"
                  onClick={() => setMenuOpen(false)}
                  title="Twitter"
                >
                  <FaTwitter />
                </a>
              )}
              {socialMedia.linkedin?.link && (
                <a 
                  href={socialMedia.linkedin.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="nav-social-btn nav-social-linkedin"
                  onClick={() => setMenuOpen(false)}
                  title="LinkedIn"
                >
                  <FaLinkedinIn />
                </a>
              )}
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="header-nav-contact">
            <a href={`tel:${whatsappNumber}`} className="nav-contact-item">
              <FiPhone className="nav-contact-icon" />
              <span>Ligue para Nós</span>
            </a>
            <a href="mailto:contato@maiatur.com.br" className="nav-contact-item">
              <FiMail className="nav-contact-icon" />
              <span>Envie um E-mail</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Modal de Instalação do App */}
      {showInstallModal && (
        <div className="install-modal" onClick={() => setShowInstallModal(false)}>
          <div className="modal-backdrop"></div>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <FiSmartphone className="modal-icon" />
              <h3 className="modal-title">Instalar App Transfer Fortaleza Tur</h3>
            </div>
            <div className="modal-body">
              <p className="modal-text">
                📱 Instale o app Transfer Fortaleza Tur para acesso rápido e experiência melhorada!
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowInstallModal(false)}
              >
                Agora não
              </button>
              <button 
                className="modal-btn modal-btn-install"
                onClick={handleInstallNow}
                disabled={!deferredPrompt}
                style={{
                  background: 'linear-gradient(135deg, #EE7C35 0%, #F8C144 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 15px rgba(238, 124, 53, 0.25)',
                  border: 'none'
                }}
              >
                Instalar Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

