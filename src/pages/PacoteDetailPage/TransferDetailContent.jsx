import React, { useState, useEffect } from 'react';
import { FiClock, FiMapPin, FiArrowLeft, FiShare2, FiHeart, FiStar, FiHome } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import MarkdownRenderer from '../../components/MarkdownRenderer/MarkdownRenderer';
import VehicleGallery from '../../components/VehicleGallery/VehicleGallery';
import FAQSection from '../../components/FAQSection/FAQSection';
import ServiceAreas from '../../components/ServiceAreas/ServiceAreas';
import AmenitiesList from '../../components/AmenitiesList/AmenitiesList';
import BookingSteps from '../../components/BookingSteps/BookingSteps';
import AdvantagesList from '../../components/AdvantagesList/AdvantagesList';
import LocationMap from '../../components/LocationMap/LocationMap';
import PaymentSecuritySection from '../../components/PaymentSecuritySection/PaymentSecuritySection';
import { autoOptimize } from '../../utils/cloudinaryOptimizer';
import './TransferDetailContent.css';

/**
 * Componente TransferDetailContent
 * Renderiza o conteúdo detalhado de um pacote (usado para todos os tipos)
 * Inclui hero com carrossel, descrição, veículos, locais atendidos, comodidades, vantagens, passos de reserva, FAQ e localização
 */
const TransferDetailContent = ({ pacote, onWhatsApp, whatsappLoading, onBack, onShare, onFavorite, isFavorite, pacotesRecomendados }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const {
    titulo,
    descricao,
    descricaoCurta,
    preco,
    precoOriginal,
    mostrarPreco,
    imagens,
    imagensAlt,
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
    pagamentoSeguranca,
    tipo,
    destaques
  } = pacote;

  // Buscar produtos relacionados
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        let related = [];

        // Se houver pacotes recomendados selecionados, buscar esses específicos
        if (pacotesRecomendados && pacotesRecomendados.length > 0) {
          const packagePromises = pacotesRecomendados.map(async (pkgId) => {
            try {
              const docRef = doc(db, 'pacotes', pkgId);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
              }
              return null;
            } catch (error) {
              console.error('Erro ao buscar pacote recomendado:', pkgId, error);
              return null;
            }
          });

          const results = await Promise.all(packagePromises);
          related = results.filter(p => p !== null && p.id !== pacote.id);
        } else {
          // Fallback: buscar pacotes aleatórios do mesmo tipo se não houver seleção
          const pacotesRef = collection(db, 'pacotes');
          const q = query(
            pacotesRef,
            where('tipo', '==', tipo),
            limit(4)
          );
          const querySnapshot = await getDocs(q);
          
          related = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(p => p.id !== pacote.id && p.slug !== pacote.slug)
            .slice(0, 3);
        }
        
        setRelatedProducts(related);
      } catch (error) {
        console.error('Erro ao buscar produtos relacionados:', error);
      }
    };

    if (pacote?.tipo) {
      fetchRelatedProducts();
    }
  }, [pacote?.tipo, pacote?.id, pacote?.slug, tipo, pacotesRecomendados]);

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
      {/* Breadcrumb */}
      <nav className="transfer-breadcrumb" aria-label="Navegação">
        <Link to="/" className="breadcrumb-link">
          <FiHome />
          <span>Início</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/pacotes" className="breadcrumb-link">
          <span>{tipo === 'transfer' ? 'Transfers' : 'Pacotes e Passeios'}</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{titulo}</span>
      </nav>

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
                  alt={imagensAlt?.[currentImageIndex] || `${titulo} - Imagem principal`}
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    e.target.src = autoOptimize('https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80', 'banner');
                  }}
                />

                {imagens.length > 1 && (
                  <>
                    <button className="transfer-nav-btn transfer-prev" onClick={prevImage} aria-label="Imagem anterior">
                      ‹
                    </button>
                    <button className="transfer-nav-btn transfer-next" onClick={nextImage} aria-label="Próxima imagem">
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
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver imagem ${index + 1} de ${imagens.length}`}
                    >
                      <img
                        src={autoOptimize(img, 'packageCard')}
                        alt={imagensAlt?.[index] || `${titulo} - Imagem ${index + 1}`}
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

          {/* Preço e CTA Principal */}
          <div className="transfer-hero-cta-container">
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

            <button
              className="transfer-hero-cta-button"
              onClick={() => onWhatsApp ? onWhatsApp(generateWhatsAppMessage()) : null}
              disabled={whatsappLoading}
            >
              <FaWhatsapp />
              <span>{tipo === 'transfer' ? 'SOLICITAR RESERVA' : 'RESERVAR AGORA'}</span>
            </button>

            {!mostrarPreco && (
              <p className="transfer-price-consult">
                Consulte o valor via WhatsApp
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sobre o Pacote/Transfer */}
      <div className="transfer-section">
        <h2 className="transfer-section-title">{tipo === 'transfer' ? 'Sobre este Transfer' : 'Sobre este Passeio'}</h2>
        <div className="transfer-description">
          <MarkdownRenderer content={descricao} />
        </div>
      </div>

      {/* Vantagens / Destaques */}
      {(vantagens && vantagens.length > 0) || (destaques && destaques.length > 0) ? (
        <div className="transfer-section">
          <h2 className="transfer-section-title">{tipo === 'transfer' ? 'Vantagens' : 'O que está incluído'}</h2>
          <AdvantagesList vantagens={vantagens || destaques} showTitle={false} />
        </div>
      ) : null}

      {/* Veículos */}
      {veiculos && veiculos.length > 0 ? (
        <div className="transfer-section">
          <h2 className="transfer-section-title">Veículos Disponíveis</h2>
          <VehicleGallery veiculos={veiculos} showTitle={false} />
        </div>
      ) : null}

      {/* Locais Atendidos */}
      {locaisAtendidos && locaisAtendidos.length > 0 ? (
        <div className="transfer-section">
          <h2 className="transfer-section-title">Locais Atendidos</h2>
          <ServiceAreas locais={locaisAtendidos} showTitle={false} />
        </div>
      ) : null}

      {/* Comodidades */}
      {comodidades && comodidades.length > 0 ? (
        <div className="transfer-section">
          <h2 className="transfer-section-title">Comodidades</h2>
          <AmenitiesList comodidades={comodidades} showTitle={false} />
        </div>
      ) : null}

      {/* Como Funciona a Reserva */}
      {passosReserva && passosReserva.length > 0 ? (
        <div className="transfer-section">
          <h2 className="transfer-section-title">Como Funciona a Reserva</h2>
          <BookingSteps passos={passosReserva} showTitle={false} />
        </div>
      ) : null}

      {/* Localização */}
      {localizacao && (localizacao.descricao || localizacao.imagemMapa || localizacao.coordenadas) ? (
        <div className="transfer-section">
          <h2 className="transfer-section-title">Localização do Destino</h2>
          <LocationMap localizacao={localizacao} showTitle={false} />
        </div>
      ) : null}

      {/* Pagamento e Segurança */}
      {pagamentoSeguranca && (pagamentoSeguranca.bandeiras?.length > 0 || pagamentoSeguranca.seloSeguranca || pagamentoSeguranca.textoSeguranca) ? (
        <div className="transfer-section">
          <h2 className="transfer-section-title">Pagamento e Segurança</h2>
          <PaymentSecuritySection pagamentoSeguranca={pagamentoSeguranca} showTitle={false} />
        </div>
      ) : null}

      {/* FAQ */}
      {faq && faq.length > 0 ? (
        <div className="transfer-section">
          <h2 className="transfer-section-title">Perguntas Frequentes</h2>
          <FAQSection faq={faq} showTitle={false} />
        </div>
      ) : null}

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

      {/* Produtos Relacionados */}
      {relatedProducts.length > 0 && (
        <div className="transfer-section">
          <h2 className="transfer-section-title">Você também pode gostar</h2>
          <div className="related-products-grid">
            {relatedProducts.map((product) => (
              <Link
                key={product.id}
                to={`/pacote/${product.slug}`}
                className="related-product-card"
              >
                {product.imagens && product.imagens.length > 0 && (
                  <div className="related-product-image">
                    <img
                      src={autoOptimize(product.imagens[0], 'packageCard')}
                      alt={product.imagensAlt?.[0] || product.titulo || 'Imagem do pacote'}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="related-product-content">
                  <h3 className="related-product-title">{product.titulo}</h3>
                  {product.descricaoCurta && (
                    <p className="related-product-description">{product.descricaoCurta}</p>
                  )}
                  {product.mostrarPreco && product.preco && (
                    <div className="related-product-price">
                      <span className="related-product-price-label">A partir de</span>
                      <span className="related-product-price-value">R$ {formatPrice(product.preco)}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA Fixo Mobile */}
      <div className="transfer-mobile-cta">
        {mostrarPreco === true && preco && preco > 0 && (
          <div className="mobile-cta-price">
            <span className="mobile-cta-price-label">A partir de</span>
            <span className="mobile-cta-price-value">R$ {formatPrice(preco)}</span>
          </div>
        )}
        <button
          className="mobile-cta-button"
          onClick={() => onWhatsApp ? onWhatsApp(generateWhatsAppMessage()) : null}
          disabled={whatsappLoading}
        >
          <FaWhatsapp />
          <span>{tipo === 'transfer' ? 'RESERVAR' : 'RESERVAR'}</span>
        </button>
      </div>
    </div>
  );
};

export default TransferDetailContent;
