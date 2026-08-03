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

  // Gerar URL do iframe do Google Maps usando coordenadas
  const getMapEmbedUrl = () => {
    if (!coordenadas) return null;
    // Usar o embed do Google Maps com as coordenadas
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${coordenadas}`;
  };

  // Fallback: usar OpenStreetMap (não precisa de API key)
  const getOpenStreetMapUrl = () => {
    if (!coordenadas) return null;
    const [lat, lng] = coordenadas.split(',').map(c => c.trim());
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  return (
    <div className="location-map-section">
      <h2 className="location-map-title">
        <FiMapPin className="location-map-title-icon" />
        Localização do Destino
      </h2>
      
      {descricao && (
        <p className="location-map-description">{descricao}</p>
      )}
      
      {/* Prioridade: iframe com coordenadas, depois imagem estática */}
      {coordenadas ? (
        <div className="location-map-container">
          <iframe
            src={getOpenStreetMapUrl()}
            title="Mapa do destino"
            className="location-map-iframe"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          <button 
            className="location-map-button"
            onClick={openGoogleMaps}
            aria-label="Abrir no Google Maps"
          >
            <FiMapPin />
            <span>Abrir no Google Maps</span>
          </button>
        </div>
      ) : imagemMapa ? (
        <div className="location-map-container">
          <img
            src={autoOptimize(imagemMapa, 'banner')}
            alt="Mapa do destino"
            className="location-map-image"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default LocationMap;
