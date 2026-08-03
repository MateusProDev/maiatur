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

  // Verifica se é um link de mapa (Google Maps, Bing Maps, etc.)
  const isMapLink = (value) => {
    return value && (
      value.includes('maps.google.com') || 
      value.includes('goo.gl') || 
      value.includes('google.com/maps') ||
      value.includes('bing.com/maps')
    );
  };

  // Extrair coordenadas de um link de mapa (Google Maps, Bing Maps, etc.)
  const extractCoordinatesFromLink = (link) => {
    if (!link) return null;
    
    // Google Maps: formato @lat,lng
    const googleCoordMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (googleCoordMatch) {
      return `${googleCoordMatch[1]},${googleCoordMatch[2]}`;
    }
    
    // Google Maps: parâmetro q
    const googleQMatch = link.match(/[?&]q=([^&]+)/);
    if (googleQMatch) {
      const qValue = decodeURIComponent(googleQMatch[1]);
      // Verifica se o valor de q já são coordenadas
      if (/^-?\d+\.\d+,-?\d+\.\d+$/.test(qValue)) {
        return qValue;
      }
    }
    
    // Bing Maps: parâmetro cp (center point) no formato lat~lng
    const bingCpMatch = link.match(/[?&]cp=(-?\d+\.\d+)~(-?\d+\.\d+)/);
    if (bingCpMatch) {
      return `${bingCpMatch[1]},${bingCpMatch[2]}`;
    }
    
    // Bing Maps: parâmetro where
    const bingWhereMatch = link.match(/[?&]where=([^&]+)/);
    if (bingWhereMatch) {
      return decodeURIComponent(bingWhereMatch[1]);
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
      // Se for um link de mapa, abre diretamente
      if (isMapLink(coordenadas)) {
        window.open(coordenadas, '_blank');
      } else {
        // Se for coordenadas, abre no Google Maps
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordenadas)}`, '_blank');
      }
    }
  };

  // Fallback: usar OpenStreetMap (não precisa de API key)
  const getOpenStreetMapUrl = () => {
    if (!validCoords) return null;
    
    const [lat, lng] = validCoords.split(',').map(c => c.trim());
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
    
    // Usar OpenStreetMap com marker usando a API de embed
    // O marker é adicionado como um parâmetro de query
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  // Usar Google Maps Static API para mostrar mapa com marcador (sem API key)
  const getGoogleMapsStaticUrl = () => {
    if (!validCoords) return null;
    
    const [lat, lng] = validCoords.split(',').map(c => c.trim());
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
    
    // Usar Google Maps Static com marker (não precisa de API key para uso básico)
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=800x400&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17Rw`;
  };

  // Converter link do Google Maps para formato embed
  const getGoogleMapsEmbedUrl = () => {
    if (!coordenadas || !isMapLink(coordenadas)) return null;
    
    // Apenas Google Maps suporta embed API
    if (!coordenadas.includes('google.com') && !coordenadas.includes('maps.google.com')) return null;
    
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
      
      {/* Prioridade: 1. Google Maps embed (se for link do Google), 2. Google Maps Static com marcador (se houver coordenadas), 3. OpenStreetMap, 4. Imagem estática */}
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
      ) : validCoords && getGoogleMapsStaticUrl() ? (
        <div className="location-map-container">
          <img
            src={getGoogleMapsStaticUrl()}
            alt="Mapa do destino"
            className="location-map-image"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              // Se falhar, tenta usar OpenStreetMap
              const osmUrl = getOpenStreetMapUrl();
              if (osmUrl) {
                e.target.src = osmUrl;
              } else {
                e.target.style.display = 'none';
              }
            }}
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
