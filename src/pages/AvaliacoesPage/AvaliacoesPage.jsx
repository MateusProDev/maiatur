import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { FiStar, FiChevronLeft, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import Footer from '../../components/Footer/Footer';
import seoData from '../../utils/seoData';
import './AvaliacoesPage.css';

const AvaliacoesPage = () => {
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filtroNota, setFiltroNota] = useState('todas');
  const trackRef = useRef(null);

  // Filtrar avaliações por nota (declarado cedo para evitar ReferenceError)
  const avaliacoesFiltradas = filtroNota === 'todas'
    ? avaliacoes
    : avaliacoes.filter(av => av.nota === Number(filtroNota));

  useEffect(() => {
    loadAvaliacoes();
  }, []);

  // Resetar slide quando filtro mudar
  useEffect(() => {
    setCurrentSlide(0);
  }, [filtroNota]);

  const loadAvaliacoes = async () => {
    try {
      setLoading(true);
      
      // Buscar do documento content/googleReviews
      const googleReviewsRef = doc(db, 'content', 'googleReviews');
      const googleReviewsDoc = await getDoc(googleReviewsRef);
      
      if (googleReviewsDoc.exists()) {
        const data = googleReviewsDoc.data();
        const reviews = data.reviews || [];
        
        // Transformar os dados para o formato esperado
        const avaliacoesData = reviews.map(review => ({
          id: review.id || Math.random(),
          nomeUsuario: review.name,
          nomeCliente: review.name,
          nota: review.rating,
          comentario: review.text,
          createdAt: review.date,
          avatarUsuario: review.photo
        }));
        
        setAvaliacoes(avaliacoesData);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === avaliacoesFiltradas.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? avaliacoesFiltradas.length - 1 : prev - 1
    );
  };

  // We'll use native horizontal scrolling for swipe; center active slide when currentSlide changes
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const active = track.children[currentSlide];
    if (!active) return;
    // Calculate offset to center the active card
    const offset = active.offsetLeft - (track.clientWidth - active.clientWidth) / 2;
    track.scrollTo({ left: offset, behavior: 'smooth' });
  }, [currentSlide, avaliacoesFiltradas.length]);

  const calcularMedia = () => {
    if (avaliacoes.length === 0) return 0;
    const soma = avaliacoes.reduce((acc, av) => acc + (av.nota || 0), 0);
    return (soma / avaliacoes.length).toFixed(1);
  };

  const contarPorNota = (nota) => {
    return avaliacoes.filter(av => av.nota === nota).length;
  };

  const formatarData = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    
    // Se for string no formato "DD/MM/YYYY"
    if (typeof timestamp === 'string') {
      return timestamp;
    }
    
    let date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };


  return (
    <>
    <div className="avaliacoespage-container-unique">
      <SEOHelmet 
        title={seoData.avaliacoes.title}
        description={seoData.avaliacoes.description}
        canonical={seoData.avaliacoes.canonical}
        noindex={seoData.avaliacoes.noindex}
      />
      {/* Header com botão voltar */}
      <div className="avaliacoespage-header-unique">
        <button 
          className="avaliacoespage-btn-back-unique"
          onClick={() => navigate('/')}
        >
          <FiArrowLeft /> Voltar
        </button>
        <h1 className="avaliacoespage-title-unique">
          Avaliações dos Nossos <span className="avaliacoespage-highlight-unique">Clientes</span>
        </h1>
        <p className="avaliacoespage-subtitle-unique">
          Veja o que nossos viajantes têm a dizer sobre suas experiências
        </p>
      </div>

      {/* Estatísticas */}
      <div className="avaliacoespage-stats-unique">
        <div className="avaliacoespage-stat-card-unique">
          <div className="avaliacoespage-stat-number-unique">{calcularMedia()}</div>
          <div className="avaliacoespage-stat-label-unique">Nota Média</div>
          <div className="avaliacoespage-stat-stars-unique">
            {[...Array(5)].map((_, i) => (
              <FiStar 
                key={i} 
                className={i < Math.round(calcularMedia()) ? 'avaliacoespage-star-filled-unique' : 'avaliacoespage-star-empty-unique'}
              />
            ))}
          </div>
        </div>

        <div className="avaliacoespage-stat-card-unique">
          <div className="avaliacoespage-stat-number-unique">{avaliacoes.length}</div>
          <div className="avaliacoespage-stat-label-unique">Total de Avaliações</div>
        </div>

        <div className="avaliacoespage-stat-card-unique">
          <div className="avaliacoespage-stat-number-unique">{contarPorNota(5)}</div>
          <div className="avaliacoespage-stat-label-unique">5 Estrelas</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="avaliacoespage-filters-unique">
        <button 
          className={`avaliacoespage-filter-btn-unique ${filtroNota === 'todas' ? 'avaliacoespage-filter-active-unique' : ''}`}
          onClick={() => setFiltroNota('todas')}
        >
          Todas ({avaliacoes.length})
        </button>
        {[5, 4, 3, 2, 1].map(nota => (
          <button
            key={nota}
            className={`avaliacoespage-filter-btn-unique ${filtroNota === String(nota) ? 'avaliacoespage-filter-active-unique' : ''}`}
            onClick={() => setFiltroNota(String(nota))}
          >
            {nota} <FiStar className="avaliacoespage-filter-star-unique" /> ({contarPorNota(nota)})
          </button>
        ))}
      </div>

      {/* Carrossel Principal */}
      {loading ? (
        <div className="avaliacoespage-loading-unique">
          <div className="avaliacoespage-spinner-unique"></div>
          <p>Carregando avaliações...</p>
        </div>
      ) : avaliacoesFiltradas.length === 0 ? (
        <div className="avaliacoespage-empty-unique">
          <FiStar className="avaliacoespage-empty-icon-unique" />
          <h3>Nenhuma avaliação encontrada</h3>
          <p>Não há avaliações com este filtro!</p>
        </div>
      ) : (
        <>
          <div className="avaliacoespage-carousel-unique">
            <button 
              className="avaliacoespage-carousel-btn-unique avaliacoespage-carousel-prev-unique"
              onClick={prevSlide}
            >
              <FiChevronLeft />
            </button>

              <div
                className="avaliacoespage-carousel-track-unique"
                ref={trackRef}
                role="region"
                aria-label="Carrossel de avaliações"
              >
                {avaliacoesFiltradas.map((avaliacao, index) => (
                  <div
                    key={avaliacao.id}
                    className={`avaliacoespage-carousel-card-unique ${
                      index === currentSlide ? 'avaliacoespage-carousel-active-unique' : ''
                    }`}
                  >
                  <div className="avaliacoespage-card-stars-unique">
                    {[...Array(avaliacao.nota || 5)].map((_, i) => (
                      <FiStar key={i} className="avaliacoespage-star-filled-unique" />
                    ))}
                  </div>

                  <p className="avaliacoespage-card-comment-unique">
                    "{avaliacao.comentario}"
                  </p>

                  <div className="avaliacoespage-card-author-unique">
                    <div className="avaliacoespage-author-avatar-unique">
                      {avaliacao.avatarUsuario ? (
                        <img src={avaliacao.avatarUsuario} alt={avaliacao.nomeUsuario} className="avaliacoespage-avatar-img-unique" />
                      ) : (
                        (avaliacao.nomeUsuario || avaliacao.nomeCliente || 'C').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="avaliacoespage-author-info-unique">
                      <h4>{avaliacao.nomeUsuario || avaliacao.nomeCliente || 'Cliente Satisfeito'}</h4>
                      <p>{formatarData(avaliacao.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="avaliacoespage-carousel-btn-unique avaliacoespage-carousel-next-unique"
              onClick={nextSlide}
            >
              <FiChevronRight />
            </button>
          </div>

          <div className="avaliacoespage-carousel-dots-unique">
            {avaliacoesFiltradas.map((_, index) => (
              <button
                key={index}
                aria-label={`Ir para avaliação ${index + 1}`}
                className={`avaliacoespage-dot-unique ${
                  index === currentSlide ? 'avaliacoespage-dot-active-unique' : ''
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-pressed={index === currentSlide}
              />
            ))}
          </div>

        </>
      )}
      
    </div>
    <Footer />
    </>
  );
};

export default AvaliacoesPage;

