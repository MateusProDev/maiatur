import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPackage, 
  FiCalendar, 
  FiMapPin, 
  FiPhone, 
  FiMail,
  FiMessageCircle 
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './GoogleHub.css';

const GoogleHub = () => {
  const handleWhatsApp = () => {
    const numero = "5585988776655";
    const mensagem = "Olá! Vim pelo Google e gostaria de mais informações.";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const actions = [
    {
      icon: FiPackage,
      title: 'Ver Pacotes',
      description: 'Explore nossos pacotes de viagem',
      link: '/pacotes',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: FiCalendar,
      title: 'Fazer Reserva',
      description: 'Reserve seu passeio ou transfer',
      link: '/reservas',
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: FiMapPin,
      title: 'Destinos',
      description: 'Conheça nossos destinos',
      link: '/destinos',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: FiMessageCircle,
      title: 'Fale Conosco',
      description: 'Entre em contato',
      link: '/contato',
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="google-hub">
      <div className="google-hub-container">
        {/* Header */}
        <div className="google-hub-header">
          <div className="google-badge">
            <span className="google-icon">G</span>
            <span>Vindos do Google</span>
          </div>
          <h1>Bem-vindo à Transfer Fortaleza Tur!</h1>
          <p>Escolha uma das opções abaixo para começar</p>
        </div>

        {/* Actions Grid */}
        <div className="actions-grid">
          {actions.map((action, index) => (
            <Link 
              key={index} 
              to={action.link} 
              className={`action-card action-${action.color}`}
            >
              <div className="action-icon-wrapper">
                <action.icon className="action-icon" />
              </div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
              <div className="action-arrow">→</div>
            </Link>
          ))}
        </div>

        {/* Quick Contact */}
        <div className="quick-contact">
          <h3>Prefere falar diretamente?</h3>
          <div className="contact-buttons">
            <button onClick={handleWhatsApp} className="contact-btn whatsapp">
              <FaWhatsapp />
              <span>WhatsApp</span>
            </button>
            <a href="tel:+5585988776655" className="contact-btn phone">
              <FiPhone />
              <span>(85) 98877-6655</span>
            </a>
            <a href="mailto:contato@Transfer Fortaleza Tur.com.br" className="contact-btn email">
              <FiMail />
              <span>Email</span>
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="trust-section">
          <div className="trust-item">
            <div className="trust-number">500+</div>
            <div className="trust-label">Clientes Satisfeitos</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">4.9★</div>
            <div className="trust-label">Avaliação Google</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">✓</div>
            <div className="trust-label">Suporte Dedicado</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleHub;
