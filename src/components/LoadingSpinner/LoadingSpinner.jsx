import React from 'react';
import './LoadingSpinner.css';

/**
 * Loading Spinner Padronizado - Tema Turismo
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
      <div className={`loading-indicator loading-indicator-${size}`} aria-hidden="true">
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
