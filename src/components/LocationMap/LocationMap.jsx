import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import { autoOptimize } from '../../utils/cloudinaryOptimizer';
import './LocationMap.css';

/**
 * Componente LocationMap
 * Exibe mapa e descrição do destino do transfer
 */
const LocationMap = ({ localizacao = {} }) => {
  if (!localizacao || (!localizacao.descricao && !localizacao.imagemMapa)) {
    return null;
  }

  const { descricao, imagemMapa, coordenadas } = localizacao;

  const openGoogleMaps = () => {
    if (coordenadas) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${coordenadas}`, '_blank');
    }
  };

  return (
    <div className="location-map-section">
      <h2 className="location-map-title">
        <FiMapPin className="location-map-title-icon" />
        Sobre o Destino
      </h2>
      
      {descricao && (
        <p className="location-map-description">{descricao}</p>
      )}
      
      {imagemMapa && (
        <div className="location-map-container">
          <img
            src={autoOptimize(imagemMapa, 'banner')}
            alt="Mapa do destino"
            className="location-map-image"
            loading="lazy"
            decoding="async"
            onClick={openGoogleMaps}
            style={{ cursor: coordenadas ? 'pointer' : 'default' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {coordenadas && (
            <button 
              className="location-map-button"
              onClick={openGoogleMaps}
              aria-label="Abrir no Google Maps"
            >
              <FiMapPin />
              <span>Abrir no Google Maps</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationMap;
