import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { FiArrowLeft, FiCheck, FiClock, FiMapPin, FiCalendar, FiUsers, FiStar, FiShare2, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import { useWhatsAppNumber } from '../../hooks/useWhatsAppNumber';
import MarkdownRenderer from '../../components/MarkdownRenderer/MarkdownRenderer';
import './PacoteDetailPage.css';

const PacoteDetailPage = () => {
  const { pacoteSlug } = useParams();
  const [pacote, setPacote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { phoneNumber: whatsappNumber, loading: whatsappLoading } = useWhatsAppNumber();
  const navigate = useNavigate();

  const formatPacoteData = useCallback((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      titulo: data.titulo || '',
      descricao: data.descricao || '',
      descricaoCurta: data.descricaoCurta || '',
      preco: parseFloat(data.preco) || 0,
      precoOriginal: data.precoOriginal ? parseFloat(data.precoOriginal) : null,
      mostrarPreco: data.mostrarPreco === true,
      imagens: Array.isArray(data.imagens) ? data.imagens : [],
      slug: data.slug || pacoteSlug,
      destaque: data.destaque || false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }, [pacoteSlug]);

  useEffect(() => {
    const fetchPacote = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const pacotesRef = collection(db, 'pacotes');
        const q = query(pacotesRef, where("slug", "==", pacoteSlug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setPacote(formatPacoteData(doc));
          return;
        }
        
        try {
          const docRef = doc(db, 'pacotes', pacoteSlug);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setPacote(formatPacoteData(docSnap));
          } else {
            setError("Pacote não encontrado");
          }
        } catch (err) {
          console.error("Erro ao buscar pacote por ID:", err);
          setError("Pacote não encontrado");
        }
      } catch (err) {
        console.error("Erro ao buscar pacote:", err);
        setError("Erro ao carregar pacote. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPacote();
  }, [pacoteSlug, formatPacoteData]);

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === pacote.imagens.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? pacote.imagens.length - 1 : prev - 1
    );
  };

  // Removed unused handleAccordionChange

  const handleReserveWhatsApp = () => {
    if (whatsappLoading) return;
    const message = `Olá! Tenho interesse no pacote de viagem "${pacote.titulo}". Poderia me passar mais informações?`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pacote.titulo,
          text: pacote.descricaoCurta,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aqui você pode adicionar lógica para salvar no localStorage ou backend
  };

  if (loading || whatsappLoading) {
    return (
      <>
        <Header />
        <LoadingSpinner size="large" text="Carregando detalhes do pacote..." fullScreen={true} />
        <Footer />
      </>
    );
  }

  if (error || !pacote) {
    return (
      <>
        <Header />
        <div className="pdp-error-container">
          <div className="pdp-error-content">
            <h1>😕 Ops! Pacote não encontrado</h1>
            <p>{error || 'O pacote que você está procurando não existe ou foi removido.'}</p>
            <button onClick={() => navigate('/pacotes')} className="pdp-btn-back-home">
              <FiArrowLeft /> Voltar para Pacotes
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="pdp-modern-container">
        {/* Hero Section com Imagem Principal */}
        <div className="pdp-hero-section">
          <button onClick={() => navigate(-1)} className="pdp-back-button">
            <FiArrowLeft />
            <span>Voltar</span>
          </button>

          <div className="pdp-hero-actions">
            <button onClick={handleShare} className="pdp-action-btn" title="Compartilhar">
              <FiShare2 />
            </button>
            <button 
              onClick={toggleFavorite} 
              className={`pdp-action-btn ${isFavorite ? 'active' : ''}`}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <FiHeart />
            </button>
          </div>

          <div className="pdp-hero-image-gallery">
            {pacote.imagens && pacote.imagens.length > 0 ? (
              <>
                <div className="pdp-main-image">
                  <img 
                    src={pacote.imagens[currentImageIndex]} 
                    alt={pacote.titulo}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80';
                    }}
                  />
                  
                  {pacote.imagens.length > 1 && (
                    <>
                      <button className="pdp-nav-btn pdp-prev" onClick={prevImage}>
                        ‹
                      </button>
                      <button className="pdp-nav-btn pdp-next" onClick={nextImage}>
                        ›
                      </button>
                    </>
                  )}

                  {pacote.destaque && (
                    <div className="pdp-hero-badge">
                      <FiStar /> Destaque
                    </div>
                  )}
                </div>

                {pacote.imagens.length > 1 && (
                  <div className="pdp-thumbnails">
                    {pacote.imagens.map((img, index) => (
                      <div
                        key={index}
                        className={`pdp-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img src={img} alt={`${pacote.titulo} ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="pdp-no-image">
                <FiMapPin />
                <p>Imagem não disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="pdp-content-wrapper">
          <div className="pdp-main-content">
            {/* Título e Descrição Curta */}
            <div className="pdp-header-info">
              <h1 className="pdp-title">{pacote.titulo}</h1>
              {pacote.descricaoCurta && (
                <p className="pdp-subtitle">{pacote.descricaoCurta}</p>
              )}
            </div>

            {/* Descrição Completa */}
            <div className="pdp-description-card">
              <h2 className="pdp-section-title">
                <span className="pdp-title-icon">📋</span>
                Sobre este Pacote
              </h2>
              <div className="pdp-description-content">
                <MarkdownRenderer content={pacote.descricao} />
              </div>
            </div>

            {/* Características/Destaques */}
            {pacote.destaques && pacote.destaques.length > 0 && (
              <div className="pdp-features-card">
                <h2 className="pdp-section-title">
                  <span className="pdp-title-icon">✨</span>
                  O que está incluído
                </h2>
                <div className="pdp-features-grid">
                  {pacote.destaques.map((destaque, index) => (
                    <div key={index} className="pdp-feature-item">
                      <FiCheck className="pdp-feature-icon" />
                      <span>{destaque}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar com Preço e CTA */}
          <aside className="pdp-sidebar">
            <div className="pdp-price-card">
              {pacote.mostrarPreco === true && pacote.preco && pacote.preco > 0 && (
                <div className="pdp-price-section">
                  <span className="pdp-price-label">A partir de</span>
                  {pacote.precoOriginal && (
                    <span className="pdp-price-original">
                      R$ {Number(pacote.precoOriginal).toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  <div className="pdp-price-current">
                    <span className="pdp-price-currency">R$</span>
                    <span className="pdp-price-value">
                      {Number(pacote.preco).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  {pacote.precoOriginal && (
                    <span className="pdp-price-discount">
                      Economize R$ {(pacote.precoOriginal - pacote.preco).toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
              )}

              <button 
                className="pdp-cta-button pdp-cta-whatsapp"
                onClick={handleReserveWhatsApp}
                disabled={whatsappLoading}
              >
                <FaWhatsapp />
                <span>Solicitar Cotação</span>
              </button>

              <button 
                className="pdp-cta-button pdp-cta-secondary"
                onClick={handleReserveWhatsApp}
              >
                <FiCalendar />
                <span>Consultar Disponibilidade</span>
              </button>

              {/* Info Adicional */}
              <div className="pdp-info-list">
                <div className="pdp-info-item">
                  <FiClock />
                  <span>Resposta rápida via WhatsApp</span>
                </div>
                <div className="pdp-info-item">
                  <FiUsers />
                  <span>Atendimento personalizado</span>
                </div>
                <div className="pdp-info-item">
                  <FiCheck />
                  <span>Melhor preço garantido</span>
                </div>
              </div>
            </div>

            {/* Banner de Confiança */}
            <div className="pdp-trust-banner">
              <h3>🛡️ Viaje com Segurança</h3>
              <ul>
                <li>✅ Pacotes verificados</li>
                <li>✅ Suporte 24/7</li>
                <li>✅ Pagamento seguro</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PacoteDetailPage;
