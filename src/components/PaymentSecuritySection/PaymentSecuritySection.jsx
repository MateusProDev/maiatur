import React from 'react';
import { FaShieldAlt, FaLock, FaCreditCard } from 'react-icons/fa';
import './PaymentSecuritySection.css';

const PaymentSecuritySection = ({ pagamentoSeguranca = {} }) => {
  const { bandeiras = [], seloSeguranca, textoSeguranca } = pagamentoSeguranca;

  if (!bandeiras.length && !seloSeguranca && !textoSeguranca) {
    return null;
  }

  // Ícones das bandeiras
  const getBandeiraIcon = (bandeira) => {
    const icons = {
      'Visa': '💳',
      'Mastercard': '💳',
      'American Express': '💳',
      'Elo': '💳',
      'Hipercard': '💳',
      'Pix': '📱'
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
                  <span className="payment-bandeira-icon">{getBandeiraIcon(bandeira)}</span>
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
