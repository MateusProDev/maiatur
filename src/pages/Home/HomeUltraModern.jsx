import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import { 
  FiMapPin, 
  FiClock, 
  FiStar, 
  FiArrowRight,
  FiTrendingUp,
  FiAward,
  FiUsers,
  FiGlobe,
  FiCompass,
  FiSun,
  FiHeart,
  FiCamera,
  FiNavigation,
  FiShield,
  FiSmile,
  FiCreditCard,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { FaWhatsapp, FaPlaneDeparture, FaUmbrellaBeach, FaMountain, FaCity } from 'react-icons/fa';
import './HomeUltraModern.css';

const HomeUltraModern = () => {
  const [pacotes, setPacotes] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const heroRef = useRef(null);

  const stats = [
    { icon: <FiUsers />, value: '15.000+', label: 'Clientes Felizes' },
    { icon: <FiGlobe />, value: '120+', label: 'Destinos' },
    { icon: <FiAward />, value: '98%', label: 'Satisfação' },
    { icon: <FiTrendingUp />, value: '12 Anos', label: 'de Experiência' }
  ];

  const services = [
    {
      icon: <FaPlaneDeparture />,
      title: 'Transfers & Receptivo',
      description: 'Transporte seguro do aeroporto ao hotel com conforto e pontualidade',
      color: '#667eea'
    },
    {
      icon: <FaUmbrellaBeach />,
      title: 'Passeios Privativos',
      description: 'Experiências exclusivas com roteiros personalizados para você',
      color: '#f093fb'
    },
    {
      icon: <FaMountain />,
      title: 'Aventuras Radicais',
      description: 'Buggy, quadriciclo, lancha e muito mais para os aventureiros',
      color: '#4facfe'
    },
    {
      icon: <FaCity />,
      title: 'City Tours',
      description: 'Conheça as principais atrações e cultura local com nossos guias',
      color: '#43e97b'
    }
  ];

  const whyChooseUs = [
    {
      icon: <FiShield />,
      title: 'Segurança Total',
      description: 'Veículos vistoriados e motoristas experientes'
    },
    {
      icon: <FiSmile />,
      title: 'Atendimento Premium',
      description: 'Equipe dedicada 24/7 para sua viagem perfeita'
    },
    {
      icon: <FiCreditCard />,
      title: 'Melhor Custo-Benefício',
      description: 'Preços justos sem taxas ocultas'
    },
    {
      icon: <FiHeart />,
      title: 'Paixão por Turismo',
      description: 'Cada viagem é única e especial para nós'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar WhatsApp
        const whatsappDoc = await getDoc(doc(db, 'settings', 'whatsapp'));
        if (whatsappDoc.exists()) {
          setWhatsappNumber(whatsappDoc.data().phoneNumber || '');
        }

        // Buscar Pacotes
        const pacotesQuery = query(
          collection(db, 'pacotes'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const pacotesSnapshot = await getDocs(pacotesQuery);
        const pacotesData = pacotesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Debug: Verificar campos de imagem
        if (pacotesData.length > 0) {
          console.log('📦 Primeiro pacote do Firebase:', pacotesData[0]);
          console.log('🖼️ Campos de imagem disponíveis:', {
            imagemUrl: pacotesData[0].imagemUrl,
            imagem: pacotesData[0].imagem,
            imageUrl: pacotesData[0].imageUrl,
            image: pacotesData[0].image,
            foto: pacotesData[0].foto
          });
        }
        
        setPacotes(pacotesData);

        // Buscar Avaliações
        const avaliacoesQuery = query(
          collection(db, 'avaliacoes'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const avaliacoesSnapshot = await getDocs(avaliacoesQuery);
        const avaliacoesData = avaliacoesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAvaliacoes(avaliacoesData);

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-play testimonials
  useEffect(() => {
    if (avaliacoes.length > 0) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => 
          prev === avaliacoes.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [avaliacoes]);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsApp = (message = 'Olá! Gostaria de mais informações sobre os pacotes da Maiatur.') => {
    const encodedMessage = encodeURIComponent(message);
    const number = whatsappNumber || '5511999999999';
    window.open(`https://wa.me/${number}?text=${encodedMessage}`, '_blank');
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === avaliacoes.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === 0 ? avaliacoes.length - 1 : prev - 1
    );
  };

  return (
    <div className="home-ultra-modern">
      <Header />
      
      {/* ========== HERO IMERSIVO ========== */}
      <section className="hero-ultra" ref={heroRef}>
        <div className="hero-gradient-overlay"></div>
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="hero-content-ultra">
          <div className="hero-badge-ultra">
            <FiCompass className="badge-icon-spin" />
            <span>Explore o Mundo com Estilo</span>
          </div>
          
          <h1 className="hero-title-ultra">
            Viva Experiências
            <span className="title-highlight"> Inesquecíveis</span>
          </h1>
          
          <p className="hero-subtitle-ultra">
            Descubra destinos paradisíacos com pacotes personalizados, 
            conforto excepcional e momentos que ficam para sempre na memória.
          </p>
          
          <div className="hero-cta-group">
            <Link to="/pacotes" className="btn-hero-primary">
              <FiNavigation />
              Explorar Destinos
            </Link>
            <button onClick={() => handleWhatsApp()} className="btn-hero-secondary">
              <FaWhatsapp />
              Falar com Especialista
            </button>
          </div>

          {/* Stats flutuantes */}
          <div className="hero-stats-floating">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card-float" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Role para explorar</span>
        </div>
      </section>

      {/* ========== EXPLORAR DESTINOS ========== */}
      <section className="destinos-section-ultra">
        <div className="container-ultra">
          <div className="section-header-ultra">
            <span className="section-badge">
              <FiMapPin /> Destinos em Destaque
            </span>
            <h2 className="section-title-ultra">
              Escolha Sua Próxima
              <span className="gradient-text"> Aventura</span>
            </h2>
            <p className="section-description">
              Pacotes exclusivos para transformar sua viagem em uma experiência única
            </p>
          </div>

          {loading ? (
            <div className="loading-ultra">
              <div className="spinner-ultra"></div>
              <p>Carregando destinos incríveis...</p>
            </div>
          ) : pacotes.length === 0 ? (
            <div className="empty-state-ultra">
              <FiMapPin className="empty-icon" />
              <h3>Novos destinos em breve!</h3>
              <p>Estamos preparando experiências incríveis para você</p>
              <button onClick={() => handleWhatsApp('Gostaria de receber novidades sobre novos destinos!')} className="btn-notify">
                <FaWhatsapp /> Me notifique
              </button>
            </div>
          ) : (
            <div className="pacotes-grid-ultra">
              {pacotes.map((pacote, index) => {
                // Suporte para diferentes nomes de campos de imagem
                // IMPORTANTE: O Firebase usa 'imagens' como array
                const imagemUrl = pacote.imagens?.[0] || 
                                 pacote.imagemUrl || 
                                 pacote.imagem || 
                                 pacote.imageUrl || 
                                 pacote.image || 
                                 pacote.foto || 
                                 pacote.thumbnail || 
                                 pacote.bannerUrl || 
                                 pacote.cover || 
                                 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'; // Fallback
                
                console.log(`🖼️ Pacote ${pacote.nome || pacote.titulo}:`, imagemUrl);
                
                return (
                <Link 
                  to={`/pacote/${pacote.id}`} 
                  key={pacote.id} 
                  className="pacote-card-ultra"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="pacote-image-wrapper">
                    <img 
                      src={imagemUrl} 
                      alt={pacote.nome || pacote.titulo || 'Pacote turístico'}
                      loading="lazy"
                      onLoad={(e) => {
                        console.log('✅ Imagem carregada:', imagemUrl);
                        e.target.style.opacity = '1';
                      }}
                      onError={(e) => {
                        console.error('❌ Erro ao carregar imagem:', imagemUrl);
                        // Tenta usar placeholder do Unsplash
                        if (!e.target.src.includes('unsplash.com')) {
                          e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';
                        } else {
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentElement.querySelector('.pacote-placeholder');
                          if (placeholder) placeholder.style.display = 'flex';
                        }
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                    />
                    <div className="pacote-placeholder" style={{ display: 'none' }}>
                      <FiMapPin />
                    </div>
                    <div className="pacote-overlay"></div>
                    <div className="pacote-badge-top">
                      {pacote.destaque && <span className="badge-destaque">Destaque</span>}
                    </div>
                  </div>
                  
                  <div className="pacote-content-ultra">
                    <h3 className="pacote-title">{pacote.nome || pacote.titulo}</h3>
                    
                    <p className="pacote-description">
                      {(pacote.descricao || pacote.descricaoCurta || '')?.substring(0, 80)}
                      {((pacote.descricao || pacote.descricaoCurta || '').length > 80) ? '...' : ''}
                    </p>
                    
                    <div className="pacote-info-row">
                      {pacote.duracao && (
                        <div className="info-item">
                          <FiClock />
                          <span>{pacote.duracao}</span>
                        </div>
                      )}
                      {pacote.avaliacao && (
                        <div className="info-item">
                          <FiStar className="star-filled" />
                          <span>{pacote.avaliacao}</span>
                        </div>
                      )}
                    </div>
                    
                    {pacote.preco && (
                      <div className="pacote-price-section">
                        <span className="price-label">A partir de</span>
                        <span className="price-value">
                          R$ {parseFloat(pacote.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    
                    <div className="pacote-cta">
                      <span>Ver Detalhes</span>
                      <FiArrowRight className="arrow-icon" />
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          )}

          <div className="section-cta-center">
            <Link to="/pacotes" className="btn-view-all">
              Ver Todos os Pacotes
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== SERVIÇOS PREMIUM ========== */}
      <section className="servicos-section-ultra">
        <div className="container-ultra">
          <div className="section-header-ultra center">
            <span className="section-badge">
              <FiSun /> Nossos Serviços
            </span>
            <h2 className="section-title-ultra">
              Experiências
              <span className="gradient-text"> Personalizadas</span>
            </h2>
            <p className="section-description">
              Cada detalhe pensado para tornar sua viagem perfeita
            </p>
          </div>

          <div className="servicos-grid-ultra">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="servico-card-ultra"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="servico-icon-wrapper" style={{ background: `linear-gradient(135deg, ${service.color}, ${service.color}dd)` }}>
                  {service.icon}
                </div>
                <h3 className="servico-title">{service.title}</h3>
                <p className="servico-description">{service.description}</p>
                <button 
                  onClick={() => handleWhatsApp(`Gostaria de saber mais sobre: ${service.title}`)}
                  className="servico-link"
                >
                  Saiba mais
                  <FiArrowRight />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== POR QUE ESCOLHER ========== */}
      <section className="why-choose-ultra">
        <div className="container-ultra">
          <div className="why-choose-content">
            <div className="why-choose-left">
              <span className="section-badge">
                <FiAward /> Diferenciais
              </span>
              <h2 className="section-title-ultra">
                Por que escolher a
                <span className="gradient-text"> Maiatur?</span>
              </h2>
              <p className="section-text-large">
                Mais de uma década transformando viagens em experiências memoráveis. 
                Nossa dedicação é garantir que cada momento da sua jornada seja especial.
              </p>
              
              <div className="features-list-ultra">
                {whyChooseUs.map((feature, index) => (
                  <div key={index} className="feature-item-ultra">
                    <div className="feature-icon-circle">
                      {feature.icon}
                    </div>
                    <div className="feature-text">
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => handleWhatsApp()} className="btn-cta-large">
                <FaWhatsapp />
                Planejar Minha Viagem
              </button>
            </div>

            <div className="why-choose-right">
              <div className="image-collage">
                <div className="collage-item collage-1">
                  <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=800&fit=crop" alt="Destino" />
                </div>
                <div className="collage-item collage-2">
                  <img src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&h=500&fit=crop" alt="Experiência" />
                </div>
                <div className="collage-item collage-3">
                  <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=600&fit=crop" alt="Aventura" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== DEPOIMENTOS ========== */}
      {avaliacoes.length > 0 && (
        <section className="testimonials-section-ultra">
          <div className="container-ultra">
            <div className="section-header-ultra center">
              <span className="section-badge">
                <FiHeart /> Depoimentos
              </span>
              <h2 className="section-title-ultra">
                O que nossos clientes
                <span className="gradient-text"> dizem</span>
              </h2>
            </div>

            <div className="testimonials-slider-ultra">
              <button onClick={prevTestimonial} className="slider-nav prev">
                <FiChevronLeft />
              </button>

              <div className="testimonials-track">
                {avaliacoes.map((avaliacao, index) => (
                  <div 
                    key={avaliacao.id}
                    className={`testimonial-card-ultra ${index === currentTestimonial ? 'active' : ''}`}
                    style={{ 
                      transform: `translateX(${(index - currentTestimonial) * 105}%)`,
                      opacity: index === currentTestimonial ? 1 : 0.3
                    }}
                  >
                    <div className="testimonial-stars">
                      {[...Array(avaliacao.nota || 5)].map((_, i) => (
                        <FiStar key={i} className="star-filled" />
                      ))}
                    </div>
                    
                    <p className="testimonial-text">
                      "{avaliacao.comentario}"
                    </p>
                    
                    <div className="testimonial-author">
                      <div className="author-avatar">
                        {avaliacao.nomeCliente?.charAt(0) || 'C'}
                      </div>
                      <div className="author-info">
                        <h4>{avaliacao.nomeCliente || 'Cliente Satisfeito'}</h4>
                        <p>{avaliacao.destino || 'Viajante Maiatur'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={nextTestimonial} className="slider-nav next">
                <FiChevronRight />
              </button>

              <div className="slider-dots">
                {avaliacoes.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== CTA FINAL ========== */}
      <section className="cta-final-ultra">
        <div className="cta-shapes">
          <div className="cta-shape cta-shape-1"></div>
          <div className="cta-shape cta-shape-2"></div>
        </div>
        
        <div className="container-ultra">
          <div className="cta-content-ultra">
            <FiCamera className="cta-icon-large" />
            <h2 className="cta-title-ultra">
              Pronto para sua próxima aventura?
            </h2>
            <p className="cta-text-ultra">
              Fale com nossos especialistas e monte o roteiro perfeito para você
            </p>
            <div className="cta-buttons-group">
              <button onClick={() => handleWhatsApp()} className="btn-cta-whatsapp">
                <FaWhatsapp />
                Chamar no WhatsApp
              </button>
              <Link to="/pacotes" className="btn-cta-explore">
                Ver Pacotes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default HomeUltraModern;
