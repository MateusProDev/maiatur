import React from 'react';
import './LoadingSpinner.css';

/**
 * Loading Spinner Padronizado - Tema Turismo
 * Usa ondas do mar como referência ao turismo
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {string} text - Texto opcional para exibir
 * @param {boolean} fullScreen - Se deve ocupar tela inteira
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  text = '', 
  fullScreen = false 
}) => {
  const containerClass = fullScreen 
    ? 'loading-spinner-fullscreen' 
    : 'loading-spinner-container';

  return (
    <div className={containerClass}>
      <div className={`wave-spinner wave-spinner-${size}`}>
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
