import React from 'react';
import './BookingSteps.css';

/**
 * Componente BookingSteps
 * Exibe passos para reserva em formato timeline
 * Layout horizontal desktop, vertical mobile
 */
const BookingSteps = ({ passos = [], showTitle = true }) => {
  if (!passos || passos.length === 0) {
    return null;
  }

  return (
    <div className="booking-steps">
      {showTitle && <h2 className="booking-steps-title">Como Funciona a Reserva</h2>}
      <div className="booking-steps-container">
        {passos.map((passo, index) => (
          <div key={index} className="step-item">
            <div className="step-number">
              <span>{index + 1}</span>
            </div>
            <div className="step-content">
              <p className="step-text">{passo}</p>
            </div>
            {index < passos.length - 1 && <div className="step-connector" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingSteps;
