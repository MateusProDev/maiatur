import React, { useState, useEffect } from "react";
import styles from './FooterUltraModern.module.css';
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { 
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaTwitter,
  FaYoutube
} from "react-icons/fa";
import { 
  FiMail, 
  FiSend, 
  FiMapPin, 
  FiPhone as FiPhoneIcon,
  FiMail as FiMailIcon,
  FiHeart,
  FiArrowRight,
  FiGlobe
} from "react-icons/fi";

// helper mapping for CSS Module class strings
const cx = (cls) => {
  if (!cls) return '';
  return String(cls)
    .split(/\s+/)
    .filter(Boolean)
    .map((c) => styles[c] || c)
    .join(' ');
};

const FooterUltraModern = () => {
  const [footerData, setFooterData] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const footerRef = doc(db, "content", "footer");
        const footerDoc = await getDoc(footerRef);
        if (footerDoc.exists()) {
          setFooterData(footerDoc.data());
        }
      } catch (error) {
        console.error("Erro ao buscar rodapé:", error);
      }
    };

    fetchFooterData();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email && /\S+@\S+\.\S+/.test(email)) {
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus(''), 3000);
    } else {
      setSubscribeStatus('error');
      setTimeout(() => setSubscribeStatus(''), 3000);
    }
  };

  if (!footerData) return null;

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Pacotes', path: '/pacotes' },
    { name: 'Destinos', path: '/destinos' },
    { name: 'Sobre Nós', path: '/sobre' },
    { name: 'Blog', path: '/blog' },
    { name: 'Transfers', path: '/categoria/transfer' },
    { name: 'Beach Park', path: '/categoria/beach-park' },
    { name: 'Contato', path: '/contato' }
  ];

  return (
    <footer className={cx('footer-ultra-modern')}>
      {/* Formas decorativas de fundo */}
      <div className={cx('footer-bg-shapes')}>
        <div className={cx('footer-shape footer-shape-1')}></div>
        <div className={cx('footer-shape footer-shape-2')}></div>
        <div className={cx('footer-shape footer-shape-3')}></div>
      </div>

      <div className={cx('footer-ultra-container')}>
        {/* ========== SEÇÃO PRINCIPAL ========== */}
        <div className={cx('footer-main-grid')}>
          
          {/* Coluna 1: Brand + Newsletter */}
          <div className={cx('footer-brand-section')}>
            <Link to="/" className={cx('footer-logo-ultra')}>
              <FiGlobe className={cx('footer-logo-icon')} />
              <h2>{footerData.companyName || "Transfer Fortaleza Tur"}</h2>
            </Link>
            <p className={cx('footer-tagline')}>
              {footerData.text || "Transformando sonhos em experiências inesquecíveis"}
            </p>

            {/* Newsletter */}
            <div className={cx('footer-newsletter-ultra')}>
              <h4 className={cx('newsletter-title-ultra')}>
                <FiMail className={cx('newsletter-icon-ultra')} />
                Receba Ofertas Exclusivas
              </h4>
              <form onSubmit={handleNewsletterSubmit} className={cx('newsletter-form-ultra')}>
                <div className={cx('newsletter-input-wrapper-ultra')}>
                  <input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cx('newsletter-input-ultra')}
                  />
                  <button type="submit" className={cx('newsletter-btn-ultra')} aria-label="Inscrever na newsletter">
                    <FiSend />
                  </button>
                </div>
                {subscribeStatus === 'success' && (
                  <p className={cx('newsletter-success')}>✓ Inscrição realizada com sucesso!</p>
                )}
                {subscribeStatus === 'error' && (
                  <p className={cx('newsletter-error')}>✗ Por favor, insira um e-mail válido</p>
                )}
              </form>
            </div>

            {/* Redes Sociais */}
            <div className={cx('footer-social-ultra')}>
              <h4 className={cx('social-title-ultra')}>Conecte-se Conosco</h4>
              <div className={cx('social-icons-grid-ultra')}>
                {footerData.social?.instagram?.link && (
                  <a href={footerData.social.instagram.link} target="_blank" rel="noopener noreferrer" 
                     className={cx('social-icon-ultra social-instagram-ultra')} title="Instagram"
                     style={{background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', borderColor: '#fd1d1d'}}>
                    <FaInstagram style={{ color: '#fff', fontSize: '40px' }} />
                  </a>
                )}
                {footerData.social?.facebook?.link && (
                  <a href={footerData.social.facebook.link} target="_blank" rel="noopener noreferrer"
                     className={cx('social-icon-ultra social-facebook-ultra')} title="Facebook"
                     style={{background: '#1877f2', borderColor: '#1877f2'}}>
                    <FaFacebookF style={{ color: '#fff', fontSize: '24px' }} />
                  </a>
                )}
                {footerData.social?.whatsapp?.link && (
                  <a href={footerData.social.whatsapp.link} target="_blank" rel="noopener noreferrer"
                     className={cx('social-icon-ultra social-whatsapp-ultra')} title="WhatsApp"
                     style={{background: '#25d366', borderColor: '#25d366'}}>
                    <FaWhatsapp style={{ color: '#fff', fontSize: '24px' }} />
                  </a>
                )}
                {footerData.social?.twitter?.link && (
                  <a href={footerData.social.twitter.link} target="_blank" rel="noopener noreferrer"
                     className={cx('social-icon-ultra social-twitter-ultra')} title="Twitter"
                     style={{background: '#1da1f2', borderColor: '#1da1f2'}}>
                    <FaTwitter style={{ color: '#fff', fontSize: '24px' }} />
                  </a>
                )}
                {footerData.social?.youtube?.link && (
                  <a href={footerData.social.youtube.link} target="_blank" rel="noopener noreferrer"
                     className={cx('social-icon-ultra social-youtube-ultra')} title="YouTube"
                     style={{background: '#ff0000', borderColor: '#ff0000'}}>
                    <FaYoutube style={{ color: '#fff', fontSize: '24px' }} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div className={cx('footer-links-section')}>
            <h4 className={cx('footer-section-title-ultra')}>Navegação Rápida</h4>
            <ul className={cx('footer-links-list-ultra')}>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className={cx('footer-link-ultra')}>
                    <FiArrowRight className={cx('link-arrow-ultra')} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div className={cx('footer-contact-section')}>
            <h4 className={cx('footer-section-title-ultra')}>Fale Conosco</h4>
            <div className={cx('contact-info-ultra')}>
              {footerData.contact?.phone && (
                <a href={`tel:${footerData.contact.phone}`} className={cx('contact-item-ultra')}>
                  <div className={cx('contact-icon-wrapper-ultra')}>
                    <FiPhoneIcon />
                  </div>
                  <div className={cx('contact-text-ultra')}>
                    <span className={cx('contact-label-ultra')}>Telefone</span>
                    <span className={cx('contact-value-ultra')}>{footerData.contact.phone}</span>
                  </div>
                </a>
              )}
              
              {footerData.contact?.email && (
                <a href={`mailto:${footerData.contact.email}`} className={cx('contact-item-ultra')}>
                  <div className={cx('contact-icon-wrapper-ultra')}>
                    <FiMailIcon />
                  </div>
                  <div className={cx('contact-text-ultra')}>
                    <span className={cx('contact-label-ultra')}>E-mail</span>
                    <span className={cx('contact-value-ultra')}>{footerData.contact.email}</span>
                  </div>
                </a>
              )}
              
              {footerData.contact?.address && (
                <div className={cx('contact-item-ultra')}>
                  <div className={cx('contact-icon-wrapper-ultra')}>
                    <FiMapPin />
                  </div>
                  <div className={cx('contact-text-ultra')}>
                    <span className={cx('contact-label-ultra')}>Endereço</span>
                    <span className={cx('contact-value-ultra')}>{footerData.contact.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== BOTTOM BAR ========== */}
        <div className={cx('footer-bottom-ultra')}>
          <div className={cx('footer-bottom-content-ultra')}>
            <p className={cx('footer-copyright-ultra')}>
              &copy; {new Date().getFullYear()} <Link to="/" className={cx('footer-company-link')}>{footerData.companyName || "Transfer Fortaleza Tur"}</Link>. Todos os direitos reservados.
            </p>
            <nav className={cx('footer-links-ultra')}>
              <Link to="/destinos">Destinos</Link> |{' '}
              <Link to="/pacotes">Pacotes</Link> |{' '}
              <Link to="/blog">Blog</Link> |{' '}
              <Link to="/categoria/transfer">Transfers</Link> |{' '}
              <Link to="/categoria/beach-park">Beach Park</Link> |{' '}
              <Link to="/politica">Política</Link> |{' '}
              <Link to="/contato">Contato</Link>
            </nav>
            <p className={cx('footer-love-ultra')}>
              Feito com <FiHeart className={cx('heart-icon-ultra')} /> para quem ama viajar
            </p>
          </div>
          {/* Crédito Turvia */}
          <div className={cx('footer-credit-turvia')}>
            <a 
              href="https://turvia.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className={cx('turvia-link')}
              title="Desenvolvido por Turvia"
            >
              Criado por Turvia
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterUltraModern;

