import React, { useState } from 'react';
import { FiClock, FiMapPin, FiArrowLeft, FiShare2, FiHeart, FiStar } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import MarkdownRenderer from '../../components/MarkdownRenderer/MarkdownRenderer';
import VehicleGallery from '../../components/VehicleGallery/VehicleGallery';
import FAQSection from '../../components/FAQSection/FAQSection';
import ServiceAreas from '../../components/ServiceAreas/ServiceAreas';
import AmenitiesList from '../../components/AmenitiesList/AmenitiesList';
import BookingSteps from '../../components/BookingSteps/BookingSteps';
import AdvantagesList from '../../components/AdvantagesList/AdvantagesList';
import LocationMap from '../../components/LocationMap/LocationMap';
import { autoOptimize } from '../../utils/cloudinaryOptimizer';
import './TransferDetailContent.css';

/**
 * Componente TransferDetailContent
 * Renderiza o conteúdo detalhado de um pacote (usado para todos os tipos)
 * Inclui hero com carrossel, descrição, veículos, locais atendidos, comodidades, vantagens, passos de reserva, FAQ e localização
 */
const TransferDetailContent = ({ pacote, onWhatsApp, whatsappLoading, onBack, onShare, onFavorite, isFavorite }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    titulo,
    descricao,
    descricaoCurta,
    preco,
    precoOriginal,
    mostrarPreco,
    imagens,
    destaque,
    destino,
    tempoPercurso,
    distancia,
    precoPorVeiculo,
    veiculos,
    locaisAtendidos,
    comodidades,
    vantagens,
    passosReserva,
    faq,
    localizacao,
    tipo,
    destaques
  } = pacote;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imagens.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imagens.length) % imagens.length);
  };

  const formatPrice = (value) => {
    return Number(value).toFixed(2).replace('.', ',');
  };

  const generateWhatsAppMessage = () => {
    if (tipo === 'transfer') {
      return `Olá! Tenho interesse no transfer "${titulo}" para ${destino}. Poderia me passar mais informações sobre disponibilidade e veículos?`;
    }
    return `Olá! Tenho interesse no pacote de viagem "${titulo}". Poderia me passar mais informações?`;
  };

  return (
    <div className="transfer-detail">
      {/* Hero Section com Carrossel */}
      <div className="transfer-hero-section">
        <button onClick={onBack} className="transfer-back-button">
          <FiArrowLeft />
          <span>Voltar</span>
        </button>

        <div className="transfer-hero-actions">
          <button onClick={onShare} className="transfer-action-btn" title="Compartilhar">
            <FiShare2 />
          </button>
          <button
            onClick={onFavorite}
            className={`transfer-action-btn ${isFavorite ? 'active' : ''}`}
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <FiHeart />
          </button>
        </div>

        <div className="transfer-hero-gallery">
          {imagens && imagens.length > 0 ? (
            <>
              <div className="transfer-main-image">
                <img
                  src={autoOptimize(imagens[currentImageIndex], 'banner')}
                  alt={titulo}
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    e.target.src = autoOptimize('https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80', 'banner');
                  }}
                />

                {imagens.length > 1 && (
                  <>
                    <button className="transfer-nav-btn transfer-prev" onClick={prevImage}>
                      ‹
                    </button>
                    <button className="transfer-nav-btn transfer-next" onClick={nextImage}>
                      ›
                    </button>
                  </>
                )}

                {destaque && (
                  <div className="transfer-hero-badge">
                    <FiStar /> Destaque
                  </div>
                )}
              </div>

              {imagens.length > 1 && (
                <div className="transfer-thumbnails">
                  {imagens.map((img, index) => (
                    <div
                      key={index}
                      className={`transfer-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={autoOptimize(img, 'packageCard')}
                        alt={`${titulo} ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="transfer-no-image">
              <FiMapPin />
              <p>Imagem não disponível</p>
            </div>
          )}
        </div>

        {/* Info Card - Título e Informações */}
        <div className="transfer-info-card">
          <h1 className="transfer-hero-title">{titulo}</h1>
          {descricaoCurta && (
            <p className="transfer-hero-subtitle">{descricaoCurta}</p>
          )}

          {/* Informações Rápidas */}
          <div className="transfer-hero-info">
            {destino && (
              <div className="transfer-info-item">
                <FiMapPin className="transfer-info-icon" />
                <div>
                  <span className="transfer-info-label">Destino</span>
                  <span className="transfer-info-value">{destino}</span>
                </div>
              </div>
            )}
            {tempoPercurso && (
              <div className="transfer-info-item">
                <FiClock className="transfer-info-icon" />
                <div>
                  <span className="transfer-info-label">Tempo de Percurso</span>
                  <span className="transfer-info-value">{tempoPercurso}</span>
                </div>
              </div>
            )}
            {distancia && (
              <div className="transfer-info-item">
                <FiMapPin className="transfer-info-icon" />
                <div>
                  <span className="transfer-info-label">Distância</span>
                  <span className="transfer-info-value">{distancia}</span>
                </div>
              </div>
            )}
          </div>

          {/* Preço */}
          {mostrarPreco === true && preco && preco > 0 && (
            <div className="transfer-hero-price">
              <div className="transfer-price-section">
                {precoPorVeiculo && (
                  <span className="transfer-price-badge">Preço por veículo</span>
                )}
                {precoOriginal && (
                  <span className="transfer-price-original">
                    R$ {formatPrice(precoOriginal)}
                  </span>
                )}
                <div className="transfer-price-current">
                  <span className="transfer-price-currency">R$</span>
                  <span className="transfer-price-value">{formatPrice(preco)}</span>
                </div>
                {precoOriginal && (
                  <span className="transfer-price-discount">
                    Economize R$ {formatPrice(precoOriginal - preco)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sobre o Pacote/Transfer */}
      <div className="transfer-section">
        <h2 className="transfer-section-title">{tipo === 'transfer' ? 'Sobre este Transfer' : 'Sobre este Pacote'}</h2>
        <div className="transfer-description">
          <MarkdownRenderer content={descricao} />
        </div>
      </div>

      {/* Vantagens / Destaques */}
      {(vantagens && vantagens.length > 0) || (destaques && destaques.length > 0) ? (
        <div className="transfer-section">
          <AdvantagesList vantagens={vantagens || destaques} />
        </div>
      ) : (
        <div className="transfer-section transfer-empty-section">
          <h2 className="transfer-section-title">{tipo === 'transfer' ? 'Vantagens' : 'O que está incluído'}</h2>
          <div className="transfer-empty-state">
            <div className="transfer-empty-state-icon">🌟</div>
            <p className="transfer-empty-state-text">
              {tipo === 'transfer' 
                ? 'As vantagens deste transfer serão adicionadas em breve.' 
                : 'Os destaques deste pacote serão adicionados em breve.'}
            </p>
          </div>
        </div>
      )}

      {/* Veículos */}
      {veiculos && veiculos.length > 0 ? (
        <div className="transfer-section">
          <VehicleGallery veiculos={veiculos} />
        </div>
      ) : (
        <div className="transfer-section transfer-empty-section">
          <h2 className="transfer-section-title">Veículos Disponíveis</h2>
          <div className="transfer-empty-state">
            <div className="transfer-empty-state-icon">🚐</div>
            <p className="transfer-empty-state-text">Informações sobre os veículos serão adicionadas em breve.</p>
          </div>
        </div>
      )}

      {/* Locais Atendidos */}
      {locaisAtendidos && locaisAtendidos.length > 0 ? (
        <div className="transfer-section">
          <ServiceAreas locais={locaisAtendidos} />
        </div>
      ) : (
        <div className="transfer-section transfer-empty-section">
          <h2 className="transfer-section-title">Locais Atendidos</h2>
          <div className="transfer-empty-state">
            <div className="transfer-empty-state-icon">📍</div>
            <p className="transfer-empty-state-text">A lista de locais atendidos será adicionada em breve.</p>
          </div>
        </div>
      )}

      {/* Comodidades */}
      {comodidades && comodidades.length > 0 ? (
        <div className="transfer-section">
          <AmenitiesList comodidades={comodidades} />
        </div>
      ) : (
        <div className="transfer-section transfer-empty-section">
          <h2 className="transfer-section-title">Comodidades</h2>
          <div className="transfer-empty-state">
            <div className="transfer-empty-state-icon">✨</div>
            <p className="transfer-empty-state-text">As comodidades disponíveis serão listadas em breve.</p>
          </div>
        </div>
      )}

      {/* Como Funciona a Reserva */}
      {passosReserva && passosReserva.length > 0 ? (
        <div className="transfer-section">
          <BookingSteps passos={passosReserva} />
        </div>
      ) : (
        <div className="transfer-section transfer-empty-section">
          <h2 className="transfer-section-title">Como Funciona a Reserva</h2>
          <div className="transfer-empty-state">
            <div className="transfer-empty-state-icon">📋</div>
            <p className="transfer-empty-state-text">O processo de reserva será detalhado em breve.</p>
          </div>
        </div>
      )}

      {/* Localização */}
      {localizacao && (localizacao.descricao || localizacao.imagemMapa || localizacao.coordenadas) ? (
        <div className="transfer-section">
          <LocationMap localizacao={localizacao} />
        </div>
      ) : (
        <div className="transfer-section transfer-empty-section">
          <h2 className="transfer-section-title">Localização do Destino</h2>
          <div className="transfer-empty-state">
            <div className="transfer-empty-state-icon">🗺️</div>
            <p className="transfer-empty-state-text">Informações sobre a localização serão adicionadas em breve.</p>
          </div>
        </div>
      )}

      {/* FAQ */}
      {faq && faq.length > 0 ? (
        <div className="transfer-section">
          <FAQSection faq={faq} />
        </div>
      ) : (
        <div className="transfer-section transfer-empty-section">
          <h2 className="transfer-section-title">Perguntas Frequentes</h2>
          <div className="transfer-empty-state">
            <div className="transfer-empty-state-icon">❓</div>
            <p className="transfer-empty-state-text">As perguntas frequentes serão adicionadas em breve.</p>
          </div>
        </div>
      )}

      {/* CTA Final */}
      <div className="transfer-cta-section">
        <div className="transfer-cta-card">
          <h3 className="transfer-cta-title">
            {tipo === 'transfer' ? 'Pronto para reservar seu transfer?' : 'Pronto para reservar seu passeio?'}
          </h3>
          <p className="transfer-cta-text">
            Entre em contato conosco pelo WhatsApp para verificar disponibilidade e finalizar sua reserva.
          </p>
          
          {mostrarPreco === true && preco && preco > 0 && (
            <div className="transfer-cta-price">
              <span className="transfer-cta-price-label">A partir de</span>
              <span className="transfer-cta-price-value">R$ {formatPrice(preco)}</span>
              {precoPorVeiculo && (
                <span className="transfer-cta-price-badge">por veículo</span>
              )}
            </div>
          )}

          <button
            className="transfer-cta-button"
            onClick={() => onWhatsApp ? onWhatsApp(generateWhatsAppMessage()) : null}
            disabled={whatsappLoading}
          >
            <FaWhatsapp />
            <span>Solicitar Reserva via WhatsApp</span>
          </button>

          <div className="transfer-cta-info">
            <p className="transfer-cta-info-item">
              <strong>Cancelamento:</strong> Gratuito até 24 horas antes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferDetailContent;
