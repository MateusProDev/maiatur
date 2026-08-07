import React, { useState, useEffect } from 'react';
import { FiMapPin } from 'react-icons/fi';
import { autoOptimize } from '../../utils/cloudinaryOptimizer';
import './LocationMap.css';

/**
 * Componente LocationMap
 * Exibe mapa e descrição do destino do transfer
 */
const LocationMap = ({ localizacao = {} }) => {
  const [resolvedCoords, setResolvedCoords] = useState(null);
  const [loading, setLoading] = useState(false);

  const { descricao, imagemMapa, coordenadas } = localizacao;

  // Resolver links curtos do Google Maps para obter coordenadas
  useEffect(() => {
    const resolveShortLink = async () => {
      if (!coordenadas) return;
      
      // Se já for coordenadas diretas, não precisa resolver
      if (/^-?\d+\.\d+,-?\d+\.\d+$/.test(coordenadas.trim())) {
        setResolvedCoords(coordenadas.trim());
        return;
      }

      // Se for um link curto do Google Maps, precisa resolver
      if (coordenadas.includes('maps.app.goo.gl') || coordenadas.includes('goo.gl')) {
        setLoading(true);
        try {
          // Usar um serviço de redirecionamento ou fazer fetch direto
          // Como não podemos fazer fetch direto por CORS, vamos tentar extrair de outras formas
          const extracted = extractCoordinatesFromLink(coordenadas);
          if (extracted) {
            setResolvedCoords(extracted);
          } else {
            // Se não conseguir extrair, usa o valor original
            setResolvedCoords(coordenadas);
          }
        } catch (error) {
          console.error('Erro ao resolver link curto:', error);
          setResolvedCoords(coordenadas);
        } finally {
          setLoading(false);
        }
      } else {
        // Se não for link curto, tenta extrair coordenadas normalmente
        const extracted = extractCoordinatesFromLink(coordenadas);
        setResolvedCoords(extracted || coordenadas);
      }
    };

    resolveShortLink();
  }, [coordenadas]);

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
    
    // Se já for coordenadas diretas, retorna como está
    if (/^-?\d+\.\d+,-?\d+\.\d+$/.test(coordenadas.trim())) {
      return coordenadas.trim();
    }
    
    // Se for um link, tenta extrair as coordenadas
    if (isMapLink(coordenadas)) {
      return extractCoordinatesFromLink(coordenadas);
    }
    
    // Se não for coordenadas nem link, retorna null
    return null;
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
    // Usar resolvedCoords se disponível, senão validCoords
    const coordsToUse = resolvedCoords || validCoords;
    if (!coordsToUse) return null;
    
    const [lat, lng] = coordsToUse.split(',').map(c => c.trim());
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
    
    // Usar Google Maps Static com marker (não precisa de API key para uso básico)
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=800x400&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17Rw`;
  };

  // Converter link do Google Maps para formato embed
  const getGoogleMapsEmbedUrl = () => {
    if (!coordenadas) return null;
    
    // Se for coordenadas diretas, usa Google Maps embed
    if (/^-?\d+\.\d+,-?\d+\.\d+$/.test(coordenadas.trim())) {
      const [lat, lng] = coordenadas.trim().split(',').map(c => c.trim());
      return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17Rw&center=${lat},${lng}&zoom=15&maptype=roadmap`;
    }
    
    // Se for link do Google Maps, tenta converter para embed
    if (isMapLink(coordenadas) && (coordenadas.includes('google.com') || coordenadas.includes('maps.google.com'))) {
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
    }
    
    return null;
  };

  // Para links que não podem ser convertidos para embed, usar iframe direto
  const getDirectEmbedUrl = () => {
    if (!coordenadas || !isMapLink(coordenadas)) return null;
    
    // Se for link do Google Maps, tenta usar o formato embed
    if (coordenadas.includes('google.com') || coordenadas.includes('maps.google.com')) {
      // Converter link normal para embed
      if (coordenadas.includes('/maps/place/')) {
        const placeId = coordenadas.match(/\/maps\/place\/([^\/]+)/);
        if (placeId) {
          return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17Rw&q=${encodeURIComponent(placeId[1])}`;
        }
      }
      
      // Se tiver coordenadas
      const coords = extractCoordinatesFromLink(coordenadas);
      if (coords) {
        const [lat, lng] = coords.split(',').map(c => c.trim());
        return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17Rw&center=${lat},${lng}&zoom=15`;
      }
      
      // Para links curtos, não é possível converter, retorna null
      if (coordenadas.includes('maps.app.goo.gl') || coordenadas.includes('goo.gl')) {
        return null;
      }
    }
    
    // Se for link do Bing Maps, não é possível usar embed
    if (coordenadas.includes('bing.com/maps')) {
      return null;
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
      
      {/* Prioridade: 1. Google Maps embed (se for coordenadas ou link do Google), 2. Google Maps Static com marcador, 3. OpenStreetMap, 4. Imagem estática, 5. Botão para abrir link */}
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
      ) : coordenadas ? (
        // Se houver coordenadas/link mas não foi possível gerar mapa, mostra botão para abrir
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
                ? 'Links curtos do Google Maps não podem ser exibidos diretamente. Clique abaixo para abrir no Google Maps.'
                : 'Não foi possível gerar o mapa embutido. Clique abaixo para abrir no Google Maps.'}
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
