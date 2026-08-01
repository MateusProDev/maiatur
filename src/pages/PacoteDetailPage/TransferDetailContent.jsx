import React from 'react';
import { FiClock, FiMapPin } from 'react-icons/fi';
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
 * Renderiza o conteúdo detalhado de um pacote do tipo 'transfer'
 * Inclui hero, descrição, veículos, locais atendidos, comodidades, vantagens, passos de reserva, FAQ e localização
 */
const TransferDetailContent = ({ pacote, onWhatsApp, whatsappLoading }) => {
  const {
    titulo,
    descricao,
    descricaoCurta,
    preco,
    precoOriginal,
    mostrarPreco,
    imagens,
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
    localizacao
  } = pacote;

  const formatPrice = (value) => {
    return Number(value).toFixed(2).replace('.', ',');
  };

  const generateWhatsAppMessage = () => {
    return `Olá! Tenho interesse no transfer "${titulo}" para ${destino}. Poderia me passar mais informações sobre disponibilidade e veículos?`;
  };

  return (
    <div className="transfer-detail">
      {/* Hero Section */}
      <div className="transfer-hero">
        <div className="transfer-hero-content">
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

        {/* Imagem Principal */}
        {imagens && imagens.length > 0 && (
          <div className="transfer-hero-image">
            <img
              src={autoOptimize(imagens[0], 'banner')}
              alt={titulo}
              loading="eager"
              decoding="async"
              onError={(e) => {
                e.target.src = autoOptimize('https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80', 'banner');
              }}
            />
          </div>
        )}
      </div>

      {/* Sobre o Transfer */}
      <div className="transfer-section">
        <h2 className="transfer-section-title">Sobre este Transfer</h2>
        <div className="transfer-description">
          <MarkdownRenderer content={descricao} />
        </div>
      </div>

      {/* Vantagens */}
      {vantagens && vantagens.length > 0 && (
        <div className="transfer-section">
          <AdvantagesList vantagens={vantagens} />
        </div>
      )}

      {/* Veículos */}
      {veiculos && veiculos.length > 0 && (
        <div className="transfer-section">
          <VehicleGallery veiculos={veiculos} />
        </div>
      )}

      {/* Locais Atendidos */}
      {locaisAtendidos && locaisAtendidos.length > 0 && (
        <div className="transfer-section">
          <ServiceAreas locais={locaisAtendidos} />
        </div>
      )}

      {/* Comodidades */}
      {comodidades && comodidades.length > 0 && (
        <div className="transfer-section">
          <AmenitiesList comodidades={comodidades} />
        </div>
      )}

      {/* Como Funciona a Reserva */}
      {passosReserva && passosReserva.length > 0 && (
        <div className="transfer-section">
          <BookingSteps passos={passosReserva} />
        </div>
      )}

      {/* Localização */}
      {localizacao && (
        <div className="transfer-section">
          <LocationMap localizacao={localizacao} />
        </div>
      )}

      {/* FAQ */}
      {faq && faq.length > 0 && (
        <div className="transfer-section">
          <FAQSection faq={faq} />
        </div>
      )}

      {/* CTA Final */}
      <div className="transfer-cta-section">
        <div className="transfer-cta-card">
          <h3 className="transfer-cta-title">Pronto para reservar seu transfer?</h3>
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
            <FaWhatsappIcon />
            <span>Solicitar Reserva via WhatsApp</span>
          </button>

          <div className="transfer-cta-info">
            <p className="transfer-cta-info-item">
              <strong>Pagamento:</strong> 30% de entrada via Pix, 70% no serviço
            </p>
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
