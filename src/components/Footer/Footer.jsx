import React, { useState, useEffect } from "react";
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
import "./FooterUltraModern.css";

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
    { name: 'Contato', path: '/contato' }
  ];

  return (
    <footer className="footer-ultra-modern">
      {/* Formas decorativas de fundo */}
      <div className="footer-bg-shapes">
        <div className="footer-shape footer-shape-1"></div>
        <div className="footer-shape footer-shape-2"></div>
        <div className="footer-shape footer-shape-3"></div>
      </div>

      <div className="footer-ultra-container">
        {/* ========== SEÇÃO PRINCIPAL ========== */}
        <div className="footer-main-grid">
          
          {/* Coluna 1: Brand + Newsletter */}
          <div className="footer-brand-section">
            <div className="footer-logo-ultra">
              <FiGlobe className="footer-logo-icon" />
              <h2>{footerData.companyName || "Transfer Fortaleza Tur"}</h2>
            </div>
            <p className="footer-tagline">
              {footerData.text || "Transformando sonhos em experiências inesquecíveis"}
            </p>

            {/* Newsletter */}
            <div className="footer-newsletter-ultra">
              <h4 className="newsletter-title-ultra">
                <FiMail className="newsletter-icon-ultra" />
                Receba Ofertas Exclusivas
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form-ultra">
                <div className="newsletter-input-wrapper-ultra">
                  <input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input-ultra"
                  />
                  <button type="submit" className="newsletter-btn-ultra" aria-label="Inscrever na newsletter">
                    <FiSend />
                  </button>
                </div>
                {subscribeStatus === 'success' && (
                  <p className="newsletter-success">✓ Inscrição realizada com sucesso!</p>
                )}
                {subscribeStatus === 'error' && (
                  <p className="newsletter-error">✗ Por favor, insira um e-mail válido</p>
                )}
              </form>
            </div>

            {/* Redes Sociais */}
            <div className="footer-social-ultra">
              <h4 className="social-title-ultra">Conecte-se Conosco</h4>
              <div className="social-icons-grid-ultra">
                {footerData.social?.instagram?.link && (
                  <a href={footerData.social.instagram.link} target="_blank" rel="noopener noreferrer" 
                     className="social-icon-ultra social-instagram-ultra" title="Instagram">
                    <FaInstagram />
                  </a>
                )}
                {footerData.social?.facebook?.link && (
                  <a href={footerData.social.facebook.link} target="_blank" rel="noopener noreferrer"
                     className="social-icon-ultra social-facebook-ultra" title="Facebook">
                    <FaFacebookF />
                  </a>
                )}
                {footerData.social?.whatsapp?.link && (
                  <a href={footerData.social.whatsapp.link} target="_blank" rel="noopener noreferrer"
                     className="social-icon-ultra social-whatsapp-ultra" title="WhatsApp">
                    <FaWhatsapp />
                  </a>
                )}
                {footerData.social?.twitter?.link && (
                  <a href={footerData.social.twitter.link} target="_blank" rel="noopener noreferrer"
                     className="social-icon-ultra social-twitter-ultra" title="Twitter">
                    <FaTwitter />
                  </a>
                )}
                {footerData.social?.youtube?.link && (
                  <a href={footerData.social.youtube.link} target="_blank" rel="noopener noreferrer"
                     className="social-icon-ultra social-youtube-ultra" title="YouTube">
                    <FaYoutube />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div className="footer-links-section">
            <h4 className="footer-section-title-ultra">Navegação Rápida</h4>
            <ul className="footer-links-list-ultra">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="footer-link-ultra">
                    <FiArrowRight className="link-arrow-ultra" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div className="footer-contact-section">
            <h4 className="footer-section-title-ultra">Fale Conosco</h4>
            <div className="contact-info-ultra">
              {footerData.contact?.phone && (
                <a href={`tel:${footerData.contact.phone}`} className="contact-item-ultra">
                  <div className="contact-icon-wrapper-ultra">
                    <FiPhoneIcon />
                  </div>
                  <div className="contact-text-ultra">
                    <span className="contact-label-ultra">Telefone</span>
                    <span className="contact-value-ultra">{footerData.contact.phone}</span>
                  </div>
                </a>
              )}
              
              {footerData.contact?.email && (
                <a href={`mailto:${footerData.contact.email}`} className="contact-item-ultra">
                  <div className="contact-icon-wrapper-ultra">
                    <FiMailIcon />
                  </div>
                  <div className="contact-text-ultra">
                    <span className="contact-label-ultra">E-mail</span>
                    <span className="contact-value-ultra">{footerData.contact.email}</span>
                  </div>
                </a>
              )}
              
              {footerData.contact?.address && (
                <div className="contact-item-ultra">
                  <div className="contact-icon-wrapper-ultra">
                    <FiMapPin />
                  </div>
                  <div className="contact-text-ultra">
                    <span className="contact-label-ultra">Endereço</span>
                    <span className="contact-value-ultra">{footerData.contact.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== BOTTOM BAR ========== */}
        <div className="footer-bottom-ultra">
          <div className="footer-bottom-content-ultra">
            <p className="footer-copyright-ultra">
              &copy; {new Date().getFullYear()} {footerData.companyName || "Transfer Fortaleza Tur"}. Todos os direitos reservados.
            </p>
            <p className="footer-love-ultra">
              Feito com <FiHeart className="heart-icon-ultra" /> para quem ama viajar
            </p>
          </div>
          
          {/* Crédito Turvia */}
          <div className="footer-credit-turvia">
            <a 
              href="https://turvia.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="turvia-link"
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

