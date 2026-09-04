import React from 'react';
import { FiCheck, FiWifi, FiAirplay, FiCoffee, FiShield, FiSun } from 'react-icons/fi';
import './AmenitiesList.css';

/**
 * Componente AmenitiesList
 * Exibe lista de comodidades com ícones
 * Formato de badges/cards
 */
const AmenitiesList = ({ comodidades = [], showTitle = true }) => {
  if (!comodidades || comodidades.length === 0) {
    return null;
  }

  // Mapeamento de ícones baseado em palavras-chave
  const getIconForAmenity = (amenity) => {
    const text = amenity.toLowerCase();
    if (text.includes('wifi') || text.includes('internet')) return FiWifi;
    if (text.includes('ar') || text.includes('climat')) return FiAirplay;
    if (text.includes('água') || text.includes('bebida')) return FiCoffee;
    if (text.includes('segurança') || text.includes('cadeirinha')) return FiShield;
    if (text.includes('sol') || text.includes('clima')) return FiSun;
    return FiCheck;
  };

  return (
    <div className="amenities-list">
      {showTitle && <h2 className="amenities-list-title">Comodidades</h2>}
      <div className="amenities-grid">
        {comodidades.map((comodidade, index) => {
          const Icon = getIconForAmenity(comodidade);
          return (
            <div key={index} className="amenity-item">
              <Icon className="amenity-icon" />
              <span className="amenity-text">{comodidade}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AmenitiesList;
