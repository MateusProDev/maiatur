import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import BannerCarousel from '../../components/BannerCarousel/BannerCarousel';
import BlogPreview from '../../components/BlogPreview/BlogPreview';
import PacotesCarousel from '../../components/PacotesCarousel/PacotesCarousel';
import GoogleReviews from '../../components/GoogleReviews/GoogleReviews';
import ImageCarousel from '../../components/ImageCarousel/ImageCarousel';
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import { seoData } from '../../utils/seoData';
import { 
  FiMapPin, 
  FiStar, 
  FiArrowRight,
  FiAward,
  FiSun,
  FiHeart,
  FiCamera,
  FiShield,
  FiSmile,
  FiCreditCard,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiCheckCircle
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './HomeUltraModern.css';

import { autoOptimize } from '../../utils/cloudinaryOptimizer';

const HomeUltraModern = () => {
  const navigate = useNavigate();
  const [pacotesPorCategoria, setPacotesPorCategoria] = useState({});
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [services, setServices] = useState([]);
  const [differentials, setDifferentials] = useState([]);
  const [differentialsSettings, setDifferentialsSettings] = useState({
    active: true,
    badge: 'Diferenciais',
    title: 'Por que escolher a Transfer Fortaleza Tur?',
    description: 'Mais de uma década transformando viagens em experiências memoráveis. Nossa dedicação é garantir que cada momento da sua jornada seja especial.'
  });
  const [carouselSettings, setCarouselSettings] = useState({
    active: true,
    speed: 50,
    images: []
  });

  const categorias = {
    'passeio': 'Passeios e Experiências',
    'transfers': 'Transfers e Traslados'
  };

  // Mapeamento de ícones react-icons/fi
  const iconMap = {
    'shield': <FiShield />,
    'smile': <FiSmile />,
    'credit-card': <FiCreditCard />,
    'heart': <FiHeart />,
    'star': <FiStar />,
    'award': <FiAward />,
    'sun': <FiSun />,
    'camera': <FiCamera />,
    'map-pin': <FiMapPin />,
    'check-circle': <FiCheckCircle />,
    'arrow-right': <FiArrowRight />,
    'chevron-right': <FiChevronRight />
  };

  const getIconComponent = (iconName) => {
    return iconMap[iconName] || <FiStar />;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar WhatsApp
        const whatsappDoc = await getDoc(doc(db, 'settings', 'whatsapp'));
        if (whatsappDoc.exists()) {
          setWhatsappNumber(whatsappDoc.data().number || '');
        }

        // Buscar Serviços do Firestore
        const servicesDoc = await getDoc(doc(db, 'content', 'servicesSection'));
        if (servicesDoc.exists() && servicesDoc.data().services) {
          setServices(servicesDoc.data().services);
          console.log('✅ Serviços carregados do Firestore:', servicesDoc.data().services);
        } else {
          // Fallback para dados estáticos se não encontrar no Firestore
          setServices([
            {
              image: '/aviaoservico.png',
              title: 'Transfers & Receptivo',
              description: 'Transporte seguro do aeroporto ao hotel com conforto e pontualidade',
              color: '#21A657'
            },
            {
              image: '/jericoaquaraservico.png',
              title: 'Passeios Privativos',
              description: 'Experiências exclusivas com roteiros personalizados para você',
              color: '#EE7C35'
            },
            {
              image: '/fortalezacityservico.png',
              title: 'City Tours',
              description: 'Conheça as principais atrações e cultura local com nossos guias',
              color: '#F8C144'
            }
          ]);
          console.log('⚠️ Usando serviços estáticos (Firestore não encontrado)');
        }

        // Buscar Diferenciais do Firestore
        const differentialsDoc = await getDoc(doc(db, 'content', 'differentialsSection'));
        if (differentialsDoc.exists()) {
          const data = differentialsDoc.data();
          setDifferentialsSettings({
            active: data.active ?? true,
            badge: data.badge || 'Diferenciais',
            title: data.title || 'Por que escolher a Transfer Fortaleza Tur?',
            description: data.description || 'Mais de uma década transformando viagens em experiências memoráveis.'
          });
          setDifferentials(data.differentials || []);
          console.log('✅ Diferenciais carregados do Firestore:', data.differentials);
        } else {
          // Usar dados estáticos como fallback
          setDifferentials([
            {
              icon: 'shield',
              title: 'Segurança Total',
              description: 'Veículos vistoriados e motoristas experientes',
              image: ''
            },
            {
              icon: 'smile',
              title: 'Atendimento Personalizado',
              description: 'Equipe dedicada para ajudar no planejamento da sua viagem',
              image: ''
            },
            {
              icon: 'credit-card',
              title: 'Melhor Custo-Benefício',
              description: 'Preços justos sem taxas ocultas',
              image: ''
            },
            {
              icon: 'heart',
              title: 'Paixão por Turismo',
              description: 'Cada viagem é única e especial para nós',
              image: ''
            }
          ]);
          console.log('⚠️ Usando diferenciais estáticos (Firestore não encontrado)');
        }

        // Buscar Carrossel de Imagens do Firestore
        const carouselDoc = await getDoc(doc(db, 'content', 'imageCarouselSection'));
        if (carouselDoc.exists()) {
          const data = carouselDoc.data();
          setCarouselSettings({
            active: data.active ?? true,
            speed: data.speed || 50,
            images: data.images || []
          });
          console.log('✅ Carrossel carregado do Firestore:', data.images);
        } else {
          // Usar dados padrão como fallback
          setCarouselSettings({
            active: true,
            speed: 50,
            images: [
              {
                id: 1,
                url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop',
                alt: 'Praia paradisíaca'
              },
              {
                id: 2,
                url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
                alt: 'Pôr do sol na praia'
              },
              {
                id: 3,
                url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&h=400&fit=crop',
                alt: 'Destino turístico'
              },
              {
                id: 4,
                url: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&h=400&fit=crop',
                alt: 'Viagem inesquecível'
              },
              {
                id: 5,
                url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop',
                alt: 'Aventura'
              }
            ]
          });
          console.log('⚠️ Usando carrossel padrão (Firestore não encontrado)');
        }

        // Buscar Pacotes (todos, não apenas 6)
        const pacotesQuery = query(
          collection(db, 'pacotes'),
          orderBy('createdAt', 'desc')
        );
        const pacotesSnapshot = await getDocs(pacotesQuery);
        const pacotesData = pacotesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // setPacotes(pacotesData);

        // Agrupar pacotes: Passeios separado e todos os Transfers juntos
        const passeios = [];
        const transfers = [];
        
        pacotesData.forEach(pacote => {
          const categoriaPrincipal = pacote.categoria || 'passeio';
          const categoriasAdicionais = pacote.categorias || [];
          
          // Verificar se é passeio
          if (categoriaPrincipal === 'passeio' || categoriasAdicionais.includes('passeio')) {
            if (!passeios.find(p => p.id === pacote.id)) {
              passeios.push(pacote);
            }
          }
          
          // Verificar se é transfer (qualquer tipo)
          const isTransfer = categoriaPrincipal.includes('transfer') || 
                            categoriasAdicionais.some(cat => cat.includes('transfer'));
          
          if (isTransfer) {
            if (!transfers.find(p => p.id === pacote.id)) {
              transfers.push(pacote);
            }
          }
        });
        
        // Limitar a 5 pacotes em destaque por categoria
        const passeiosLimitados = passeios.filter(p => p.destaque === true).slice(0, 5);
        const transfersLimitados = transfers.filter(p => p.destaque === true).slice(0, 5);
        
        // Criar objeto agrupado
        const grouped = {};
        if (passeiosLimitados.length > 0) {
          grouped['passeio'] = passeiosLimitados;
        }
        if (transfersLimitados.length > 0) {
          grouped['transfers'] = transfersLimitados;
        }
        
        setPacotesPorCategoria(grouped);
        
        // Debug
        console.log('📦 Total de pacotes:', pacotesData.length);
        console.log('🎯 Passeios em destaque (até 5):', passeiosLimitados.length);
        console.log('🚗 Transfers em destaque (até 5):', transfersLimitados.length);

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

  // Ensure document title and meta description for home (fallback if Helmet not applied fast enough)
  useEffect(() => {
    try {
      const fullTitle = seoData.home.title ? (seoData.home.title.includes('Transfer Fortaleza Tur') ? seoData.home.title : `${seoData.home.title} | Transfer Fortaleza Tur`) : 'Transfer Fortaleza Tur';
      document.title = fullTitle;
      const desc = seoData.home.description || '';
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', desc);
    } catch (e) {
      // noop
    }
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

  const handleWhatsApp = (message = '') => {
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
      <SEOHelmet 
        title={seoData.home.title}
        description={seoData.home.description}
        canonical={seoData.home.canonical}
        ogType="website"
      />
      
      <Header />
      
      {/* Hero Banner Carousel */}
      <BannerCarousel />

      {/* ========== EXPLORAR DESTINOS POR CATEGORIA ========== */}
      <section className="destinos-section-ultra">
        <div className="container-ultra">
          <div className="section-header-ultra">
            <span className="section-badge">
              <FiMapPin /> Destinos em Destaque
            </span>
            <h1 className="section-title-ultra">
              Escolha Sua Próxima <span className="gradient-text">Aventura</span>
            </h1>
            <p className="section-description">
              Pacotes exclusivos organizados por categoria para transformar sua viagem em uma experiência única
            </p>
          </div>

          {loading ? (
            <div className="loading-ultra">
              <div className="spinner-ultra"></div>
              <p>Carregando destinos incríveis...</p>
            </div>
          ) : Object.keys(pacotesPorCategoria).length === 0 ? (
            <div className="empty-state-ultra">
              <FiMapPin className="empty-icon" />
              <h3>Novos destinos em breve!</h3>
              <p>Estamos preparando experiências incríveis para você</p>
              <button onClick={() => handleWhatsApp('Gostaria de receber novidades sobre novos destinos!')} className="btn-notify">
                <FaWhatsapp /> Me notifique
              </button>
            </div>
          ) : (
            <div className="carousels-section">
              {Object.entries(pacotesPorCategoria).map(([categoria, pacotesCategoria]) => {
                // Definir link "Ver Mais" baseado na categoria
                const verMaisLink = categoria === 'passeio' ? '/categoria/passeio' : '/categoria/transfer_chegada';
                
                return (
                  <PacotesCarousel 
                    key={categoria}
                    pacotes={pacotesCategoria}
                    categoria={categorias[categoria] || categoria}
                    autoPlayInterval={5000}
                    verMaisLink={verMaisLink}
                  />
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
                key={service.id || index} 
                className="servico-card-ultra"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="servico-image-wrapper">
                  <img 
                    src={autoOptimize(service.image, 'serviceCard')}
                    alt={service.title}
                    className="servico-image"
                    loading="lazy"
                    width="665"
                    height="374"
                    onError={(e) => {
                      console.error('❌ Erro ao carregar imagem:', service.image);
                      e.target.src = '/placeholder-service.jpg';
                    }}
                  />
                  <div className="servico-overlay"></div>
                </div>
                <div className="servico-content">
                  <h3 className="servico-title">{service.title}</h3>
                  <p className="servico-description">{service.description}</p>
                  <button 
                    onClick={() => handleWhatsApp(`Gostaria de saber mais sobre: ${service.title}`)}
                    className="servico-link"
                  >
                    {service.linkText || 'Saiba mais'}
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CARROSSEL DE IMAGENS ========== */}
      {carouselSettings.active && carouselSettings.images.length > 0 && (
        <ImageCarousel 
          images={carouselSettings.images}
          autoPlay={true}
          speed={carouselSettings.speed}
        />
      )}

      {/* ========== POR QUE ESCOLHER ========== */}
      {differentialsSettings.active && (
        <section className="why-choose-ultra">
          <div className="container-ultra">
            <div className="why-choose-content">
              <div className="why-choose-left">
                <span className="section-badge">
                  <FiAward /> {differentialsSettings.badge}
                </span>
                <h2 className="section-title-ultra">
                  {differentialsSettings.title}
                </h2>
                <p className="section-text-large">
                  {differentialsSettings.description}
                </p>
                
                <div className="features-list-ultra">
                  {differentials.map((feature, index) => (
                    <div key={feature.id || index} className="feature-item-ultra">
                      <div className="feature-icon-circle">
                        {feature.image ? (
                          <img src={feature.image} alt={feature.title} />
                        ) : (
                          getIconComponent(feature.icon)
                        )}
                      </div>
                      <div className="feature-text">
                        <h4>{feature.title}</h4>
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/pacotes')} 
                  className="btn-cta-large"
                >
                  <FiPackage />
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
      )}

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
                        <p>{avaliacao.destino || 'Viajante Transfer Fortaleza Tur'}</p>
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

      <GoogleReviews />

      <BlogPreview />

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default HomeUltraModern;
