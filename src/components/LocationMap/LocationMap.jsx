import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import { autoOptimize } from '../../utils/cloudinaryOptimizer';
import MapWithMarker from './MapWithMarker';
import './LocationMap.css';

/**
 * Componente LocationMap
 * Exibe mapa e descrição do destino do transfer
 */
const LocationMap = ({ localizacao = {} }) => {
  const { descricao, imagemMapa, coordenadas } = localizacao;

  console.log('🗺️ LocationMap recebeu:', { descricao, imagemMapa, coordenadas });

  // Verifica se é um link de mapa (Google Maps, Bing Maps, etc.)
  const isMapLink = (value) => {
    return value && (
      value.includes('maps.google.com') || 
      value.includes('goo.gl') || 
      value.includes('google.com/maps') ||
      value.includes('maps.app.goo.gl') ||
      value.includes('bing.com/maps')
    );
  };

  // Extrair coordenadas de um link de mapa (Google Maps, Bing Maps, etc.)
  const extractCoordinatesFromLink = (link) => {
    if (!link) return null;
    
    console.log('🗺️ Tentando extrair coordenadas do link:', link);
    
    // Google Maps: formato @lat,lng
    const googleCoordMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (googleCoordMatch) {
      const coords = `${googleCoordMatch[1]},${googleCoordMatch[2]}`;
      console.log('✅ Coordenadas extraídas do formato @lat,lng:', coords);
      return coords;
    }
    
    // Google Maps: parâmetro q
    const googleQMatch = link.match(/[?&]q=([^&]+)/);
    if (googleQMatch) {
      const qValue = decodeURIComponent(googleQMatch[1]);
      // Verifica se o valor de q já são coordenadas
      if (/^-?\d+\.\d+,-?\d+\.\d+$/.test(qValue)) {
        console.log('✅ Coordenadas extraídas do parâmetro q:', qValue);
        return qValue;
      }
    }
    
    // Bing Maps: parâmetro cp (center point) no formato lat~lng
    const bingCpMatch = link.match(/[?&]cp=(-?\d+\.\d+)~(-?\d+\.\d+)/);
    if (bingCpMatch) {
      const coords = `${bingCpMatch[1]},${bingCpMatch[2]}`;
      console.log('✅ Coordenadas extraídas do Bing Maps cp:', coords);
      return coords;
    }
    
    // Bing Maps: parâmetro where
    const bingWhereMatch = link.match(/[?&]where=([^&]+)/);
    if (bingWhereMatch) {
      const coords = decodeURIComponent(bingWhereMatch[1]);
      console.log('✅ Coordenadas extraídas do Bing Maps where:', coords);
      return coords;
    }
    
    console.log('❌ Não foi possível extrair coordenadas do link');
    return null;
  };

  // Obter coordenadas válidas (seja direto ou extraída de link)
  const getValidCoordinates = () => {
    if (!coordenadas) return null;
    
    console.log('🗺️ getValidCoordinates - coordenadas:', coordenadas);
    
    // Se já for coordenadas diretas, retorna como está
    if (/^-?\d+\.\d+,-?\d+\.\d+$/.test(coordenadas.trim())) {
      console.log('✅ Coordenadas diretas detectadas');
      return coordenadas.trim();
    }
    
    // Se for um link, tenta extrair as coordenadas
    if (isMapLink(coordenadas)) {
      console.log('🔗 É um link de mapa, tentando extrair coordenadas');
      return extractCoordinatesFromLink(coordenadas);
    }
    
    console.log('❌ Não é coordenadas diretas nem link de mapa');
    // Se não for coordenadas nem link, retorna null
    return null;
  };

  const validCoords = getValidCoordinates();
  console.log('🗺️ validCoords final:', validCoords);

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


  return (
    <div className="location-map-section">
      <h2 className="location-map-title">
        <FiMapPin className="location-map-title-icon" />
        Localização do Destino
      </h2>
      
      {descricao && (
        <p className="location-map-description">{descricao}</p>
      )}
      
      {/* Prioridade: 1. MapWithMarker (Leaflet) com coordenadas, 2. Imagem estática, 3. Botão para abrir link */}
      {validCoords ? (
        <div className="location-map-container">
          <MapWithMarker coordinates={validCoords} description={descricao} />
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
      ) : coordenadas ? (
        // Se houver link mas não foi possível extrair coordenadas, mostra botão para abrir
        <div className="location-map-container" style={{ 
          minHeight: '300px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafb 0%, #f1f5f9 100%)'
        }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <FiMapPin style={{ fontSize: '3rem', color: '#21A657', marginBottom: '1rem' }} />
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              {coordenadas.includes('maps.app.goo.gl') || coordenadas.includes('goo.gl') 
                ? 'Links curtos do Google Maps não podem ser exibidos diretamente. Use coordenadas diretas.'
                : 'Não foi possível extrair coordenadas do link. Use coordenadas diretas (ex: -4.534686, -37.679838).'}
            </p>
            <button 
              className="location-map-button"
              onClick={openGoogleMaps}
              style={{ display: 'inline-flex' }}
              aria-label="Abrir no Google Maps"
            >
              <FiMapPin />
              <span>Abrir no Google Maps</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LocationMap;
