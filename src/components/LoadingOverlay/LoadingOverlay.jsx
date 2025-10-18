// src/components/LoadingOverlay/LoadingOverlay.jsx
import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ children }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        {children || (
          <div className="spinner">
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;