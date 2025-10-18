import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import OperatingHours from "./OperatingHours";
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaTwitter,
  FaYoutube
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [showHours, setShowHours] = useState(false);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const footerRef = doc(db, "content", "footer");
        const footerDoc = await getDoc(footerRef);
        if (footerDoc.exists()) {
          setFooterData(footerDoc.data());
        }

        // Verificar se há dados de horários
        const hoursRef = doc(db, "content", "hours");
        const hoursDoc = await getDoc(hoursRef);
        if (hoursDoc.exists() && hoursDoc.data().hours?.length > 0) {
          setShowHours(true);
        }
      } catch (error) {
        console.error("Erro ao buscar rodapé:", error);
      }
    };

    fetchFooterData();
  }, []);

  if (!footerData) return <div className="footer-loading">Carregando...</div>;

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          {/* Brand/Logo Column */}
          <div className="footer-col footer-brand-col">
            <div className="footer-brand">
              {footerData.companyName || "20 Buscar"}
            </div>
            <div className="footer-description">
              {footerData.text || "Sua melhor experiência turística no Rio de Janeiro"}
            </div>
            
            {/* Redes Sociais com React Icons */}
            <div className="footer-social">
              {footerData.social?.instagram?.link && (
                <a 
                  href={footerData.social.instagram.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-icon social-instagram"
                  title="Instagram"
                >
                  <FaInstagram />
                </a>
              )}
              {footerData.social?.facebook?.link && (
                <a 
                  href={footerData.social.facebook.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-icon social-facebook"
                  title="Facebook"
                >
                  <FaFacebookF />
                </a>
              )}
              {footerData.social?.whatsapp?.link && (
                <a 
                  href={footerData.social.whatsapp.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-icon social-whatsapp"
                  title="WhatsApp"
                >
                  <FaWhatsapp />
                </a>
              )}
              {footerData.social?.twitter?.link && (
                <a 
                  href={footerData.social.twitter.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-icon social-twitter"
                  title="Twitter"
                >
                  <FaTwitter />
                </a>
              )}
              {footerData.social?.youtube?.link && (
                <a 
                  href={footerData.social.youtube.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-icon social-youtube"
                  title="YouTube"
                >
                  <FaYoutube />
                </a>
              )}
              
              {/* Fallback para redes sociais customizadas */}
              {footerData.social && Object.keys(footerData.social).map((key) => {
                if (['instagram', 'facebook', 'whatsapp', 'twitter', 'youtube'].includes(key)) return null;
                const network = footerData.social[key];
                return network.logo && network.link ? (
                  <a 
                    key={key} 
                    href={network.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-icon social-custom"
                    title={network.title || key}
                  >
                    <img 
                      src={network.logo} 
                      alt={network.title || key} 
                      width="20"
                      height="20"
                    />
                  </a>
                ) : null;
              })}
            </div>
          </div>

          {/* Contact Column */}
          <div className="footer-col footer-contact-col">
            <h4 className="footer-title">Entre em Contato</h4>
            <div className="footer-contact">
              {footerData.contact?.phone && (
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <span>{footerData.contact.phone}</span>
                </div>
              )}
              {footerData.contact?.email && (
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <span>{footerData.contact.email}</span>
                </div>
              )}
              {footerData.contact?.address && (
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>{footerData.contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Hours Column - Only shows if hours data exists */}
          {showHours && (
            <div className="footer-col footer-hours-col">
              <h4 className="footer-title">
                <FaClock className="title-icon" />
                Horários
              </h4>
              <OperatingHours />
            </div>
          )}
        </div>

        {/* Map - Full Width */}
        {footerData.contact?.address && (
          <div className="footer-map">
            <iframe
              title="Localização da Empresa"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                footerData.contact.address
              )}&output=embed`}
              width="100%"
              height="300"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        )}

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>
              &copy; {footerData.year || new Date().getFullYear()}{" "}
              {footerData.companyName || "20 Buscar"}. Todos os direitos reservados.
            </p>
          </div>
          {footerData.legalLinks && footerData.legalLinks.length > 0 && (
            <div className="footer-legal">
              {footerData.legalLinks.map((link, index) => (
                <a key={index} href={link.url}>{link.text}</a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;