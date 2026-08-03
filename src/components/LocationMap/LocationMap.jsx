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

  // Verifica se é um link do Google Maps
  const isGoogleMapsLink = (value) => {
    return value && (value.includes('maps.google.com') || value.includes('goo.gl') || value.includes('google.com/maps'));
  };

  // Extrair coordenadas de um link do Google Maps se possível
  const extractCoordinatesFromLink = (link) => {
    if (!link) return null;
    
    // Tenta extrair coordenadas de diferentes formatos de links do Google Maps
    const coordMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      return `${coordMatch[1]},${coordMatch[2]}`;
    }
    
    const qMatch = link.match(/[?&]q=([^&]+)/);
    if (qMatch) {
      return decodeURIComponent(qMatch[1]);
    }
    
    return null;
  };

  // Obter coordenadas válidas (seja direto ou extraída de link)
  const getValidCoordinates = () => {
    if (!coordenadas) return null;
    
    // Se for um link, tenta extrair as coordenadas
    if (isGoogleMapsLink(coordenadas)) {
      return extractCoordinatesFromLink(coordenadas);
    }
    
    // Se já for coordenadas, retorna como está
    return coordenadas;
  };

  const validCoords = getValidCoordinates();

  const openGoogleMaps = () => {
    if (coordenadas) {
      // Verifica se é um link do Google Maps ou coordenadas
      if (isGoogleMapsLink(coordenadas)) {
        window.open(coordenadas, '_blank');
      } else {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordenadas)}`, '_blank');
      }
    }
  };

  // Fallback: usar OpenStreetMap (não precisa de API key)
  const getOpenStreetMapUrl = () => {
    if (!validCoords) return null;
    
    const [lat, lng] = validCoords.split(',').map(c => c.trim());
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  // Converter link do Google Maps para formato embed
  const getGoogleMapsEmbedUrl = () => {
    if (!coordenadas || !isGoogleMapsLink(coordenadas)) return null;
    
    // Tenta converter link normal para embed
    if (coordenadas.includes('/maps/place/')) {
      return coordenadas.replace('/maps/place/', '/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17Rw');
    }
    
    // Se tiver coordenadas no link, usa embed com coordenadas
    const coords = extractCoordinatesFromLink(coordenadas);
    if (coords) {
      const [lat, lng] = coords.split(',').map(c => c.trim());
      return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17Rw&center=${lat},${lng}&zoom=15`;
    }
    
    return null;
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
      
      {/* Prioridade: 1. Google Maps embed (se for link), 2. OpenStreetMap (se for coordenadas), 3. Imagem estática */}
      {getGoogleMapsEmbedUrl() ? (
        <div className="location-map-container">
          <iframe
            src={getGoogleMapsEmbedUrl()}
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
      ) : validCoords && getOpenStreetMapUrl() ? (
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
