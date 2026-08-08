import React from 'react';
import { FaShieldAlt, FaLock, FaCreditCard } from 'react-icons/fa';
import { SiVisa, SiMastercard, SiAmericanexpress } from 'react-icons/si';
import './PaymentSecuritySection.css';

const PaymentSecuritySection = ({ pagamentoSeguranca = {} }) => {
  const { bandeiras = [], seloSeguranca, textoSeguranca } = pagamentoSeguranca;

  if (!bandeiras.length && !seloSeguranca && !textoSeguranca) {
    return null;
  }

  // Ícones das bandeiras usando react-icons
  const getBandeiraIcon = (bandeira) => {
    const icons = {
      'Visa': <SiVisa size={32} color="#1A1F71" />,
      'Mastercard': <SiMastercard size={32} color="#EB001B" />,
      'American Express': <SiAmericanexpress size={32} color="#006FCF" />,
      'Elo': <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF6B00' }}>ELO</span>,
      'Hipercard': <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#7B1FA2' }}>HIPER</span>,
      'Pix': <span style={{ fontSize: '28px' }}>📱</span>
    };
    return icons[bandeira] || '💳';
  };

  return (
    <div className="payment-security-section">
      <div className="payment-security-header">
        <h2 className="payment-security-title">
          <FaShieldAlt className="payment-security-icon" />
          Pagamento e Segurança
        </h2>
      </div>

      <div className="payment-security-content">
        {/* Bandeiras de pagamento */}
        {bandeiras.length > 0 && (
          <div className="payment-bandeiras">
            <div className="payment-bandeiras-label">
              <FaCreditCard className="payment-bandeiras-icon" />
              <span>Formas de Pagamento Aceitas</span>
            </div>
            <div className="payment-bandeiras-list">
              {bandeiras.map((bandeira, index) => (
                <div key={index} className="payment-bandeira-item">
                  <div className="payment-bandeira-icon">{getBandeiraIcon(bandeira)}</div>
                  <span className="payment-bandeira-name">{bandeira}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selo de segurança */}
        {seloSeguranca && (
          <div className="payment-selo">
            <img
              src={seloSeguranca}
              alt="Selo de Segurança"
              className="payment-selo-image"
              loading="lazy"
            />
          </div>
        )}

        {/* Texto de segurança */}
        {textoSeguranca && (
          <div className="payment-texto-seguranca">
            <FaLock className="payment-lock-icon" />
            <p className="payment-texto">{textoSeguranca}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSecuritySection;
