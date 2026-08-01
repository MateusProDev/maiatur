import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import './ServiceAreas.css';

/**
 * Componente ServiceAreas
 * Exibe lista de locais atendidos pelo transfer
 * Responsivo com grid layout
 */
const ServiceAreas = ({ locais = [] }) => {
  if (!locais || locais.length === 0) {
    return null;
  }

  return (
    <div className="service-areas">
      <h2 className="service-areas-title">Locais Atendidos</h2>
      <div className="service-areas-grid">
        {locais.map((local, index) => (
          <div key={index} className="service-area-item">
            <FiMapPin className="service-area-icon" />
            <span className="service-area-text">{local}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceAreas;
