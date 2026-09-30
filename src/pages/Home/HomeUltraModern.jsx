import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import BannerCarousel from '../../components/BannerCarousel/BannerCarousel';
import BlogPreview from '../../components/BlogPreview/BlogPreview';
import PacotesCarousel from '../../components/PacotesCarousel/PacotesCarousel';
import GoogleReviews from '../../components/GoogleReviews/GoogleReviews';
import ImageCarousel from '../../components/ImageCarousel/ImageCarousel';
import TransferBeberibe from '../../components/TransferBeberibe/TransferBeberibe';
import HomeFAQSection from '../../components/HomeFAQSection/HomeFAQSection';
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
import './ServicesMissingImages.css';

import { autoOptimize, generateCloudinarySrcset } from '../../utils/cloudinaryOptimizer';

const DEFAULT_HOME_FEATURED_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=630&fit=crop';
const HOME_CACHE_KEY = 'home_pacotes_data';
const HOME_CACHE_TTL = 5 * 60 * 1000;

/*
 * Imagens padrão da seção de serviços.
 * Apontam para o Cloudinary (f_auto,q_auto:eco) — os PNGs locais antigos
 * (aviaoservico.png, jericoaquaraservico.png, fortalezacityservico.png)
 * foram removidos por pesarem ~1,4 MB cada e não são mais usados.
 */
const SERVICES_DEFAULT_IMAGE = {
  transfer: 'https://res.cloudinary.com/dqejvdl8w/image/upload/f_auto,q_auto:eco,dpr_auto,c_fill,w_600,h_600/services/q459tqsslmbtdmp5hojb.jpg',
  passeio: 'https://res.cloudinary.com/dqejvdl8w/image/upload/f_auto,q_auto:eco,dpr_auto,c_fill,w_600,h_600/services/fniea42zhtccycew2ogm.jpg',
  citytour: 'https://res.cloudinary.com/dqejvdl8w/image/upload/f_auto,q_auto:eco,dpr_auto,c_fill,w_600,h_600/services/awotkycgcb1cyqzezj6x.jpg'
};

/**
 * Uma imagem é considerada "faltando" quando o campo está vazio, aponta para
 * um placeholder ou para um caminho local legado que não existe mais.
 */
const isImageMissing = (image) => {
  if (!image || typeof image !== 'string') return true;
  const value = image.trim();
  if (!value) return true;
  if (value.includes('placeholder.com')) return true;
  if (value.includes('via.placeholder')) return true;
  if (value.startsWith('/') && /\.(png|jpe?g)$/i.test(value)) return true;
  return false;
};

const DEFAULT_SERVICES = [
  {
    image: SERVICES_DEFAULT_IMAGE.transfer,
    title: 'Transfers & Receptivo',
    description: 'Transporte seguro do aeroporto ao hotel com conforto e pontualidade',
    color: '#21A657'
  },
  {
    image: SERVICES_DEFAULT_IMAGE.passeio,
    title: 'Passeios Privativos',
    description: 'Experiências exclusivas com roteiros personalizados para você',
    color: '#EE7C35'
  },
  {
    image: SERVICES_DEFAULT_IMAGE.citytour,
    title: 'City Tours',
    description: 'Conheça as principais atrações e cultura local com nossos guias',
    color: '#F8C144'
  }
];

const DEFAULT_DIFFERENTIALS = [
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
];

const HomeUltraModern = () => {
  const navigate = useNavigate();
  const [pacotesPorCategoria, setPacotesPorCategoria] = useState({});
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [servicesSectionData, setServicesSectionData] = useState({
    badge: 'Experiências Personalizadas',
    title: 'Nossos Serviços',
    subtitle: 'Cada detalhe pensado para tornar sua viagem perfeita'
  });
  const [differentials, setDifferentials] = useState(DEFAULT_DIFFERENTIALS);
  const [categoriasConfig, setCategoriasConfig] = useState({
    destinos_home: {
      titulo: "Escolha Sua Próxima Aventura",
      descricao: "Pacotes exclusivos organizados por categoria para transformar sua viagem em uma experiência única"
    }
  });
  const [differentialsSettings, setDifferentialsSettings] = useState({
    active: true,
    badge: 'Diferenciais',
    title: 'Por que escolher a Transfer Fortaleza Tur?',
    description: 'Mais de uma década transformando viagens em experiências memoráveis. Nossa dedicação é garantir que cada momento da sua jornada seja especial.',
    collageImages: {
      image1: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=800&fit=crop',
      image2: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&h=500&fit=crop',
      image3: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=600&fit=crop'
    }
  });
  const [carouselSettings, setCarouselSettings] = useState({
    active: true,
    speed: 50,
    images: []
  });
  const [homeSeo, setHomeSeo] = useState(seoData.home);

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
        const cacheKey = HOME_CACHE_KEY;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(`${cacheKey}_time`);

        const cachedHomeData = cachedData && cacheTime
          ? (() => {
              const cacheAge = Date.now() - parseInt(cacheTime, 10);
              if (cacheAge < HOME_CACHE_TTL) {
                console.log('📦 Usando cache de pacotes da Home');
                return JSON.parse(cachedData);
              }
              return null;
            })()
          : null;

        if (cachedHomeData) {
          setPacotesPorCategoria(cachedHomeData.pacotesPorCategoria || {});
          setAvaliacoes(cachedHomeData.avaliacoes || []);
        }

        const [homeSeoDoc, pacotesSnapshot] = await Promise.all([
          getDoc(doc(db, 'content', 'homeSeo')),
          getDocs(query(
            collection(db, 'pacotes'),
            orderBy('createdAt', 'desc')
          ))
        ]);

        if (homeSeoDoc.exists()) {
          setHomeSeo({ ...seoData.home, ...homeSeoDoc.data() });
        }
        
        // Buscar WhatsApp
        const whatsappDoc = await getDoc(doc(db, 'settings', 'whatsapp'));
        if (whatsappDoc.exists()) {
          setWhatsappNumber(whatsappDoc.data().number || '');
        }

        // Buscar Serviços do Firestore
        const servicesDoc = await getDoc(doc(db, 'content', 'servicesSection'));
        if (servicesDoc.exists()) {
          const data = servicesDoc.data();
          if (data.services) {
            setServices(data.services);
            console.log('✅ Serviços carregados do Firestore:', data.services);
          }
          // Carregar dados da seção (badge, title, subtitle)
          if (data.badge || data.title || data.subtitle) {
            setServicesSectionData({
              badge: data.badge || 'Experiências Personalizadas',
              title: data.title || 'Nossos Serviços',
              subtitle: data.subtitle || 'Cada detalhe pensado para tornar sua viagem perfeita'
            });
            console.log('✅ Dados da seção de serviços carregados:', {
              badge: data.badge,
              title: data.title,
              subtitle: data.subtitle
            });
          }
        } else {
          // Fallback para dados estáticos se não encontrar no Firestore
          setServices([
            {
              image: SERVICES_DEFAULT_IMAGE.transfer,
              title: 'Transfers & Receptivo',
              description: 'Transporte seguro do aeroporto ao hotel com conforto e pontualidade',
              color: '#21A657'
            },
            {
              image: SERVICES_DEFAULT_IMAGE.passeio,
              title: 'Passeios Privativos',
              description: 'Experiências exclusivas com roteiros personalizados para você',
              color: '#EE7C35'
            },
            {
              image: SERVICES_DEFAULT_IMAGE.citytour,
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
            description: data.description || 'Mais de uma década transformando viagens em experiências memoráveis.',
            collageImages: data.collageImages || {
              image1: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=800&fit=crop',
              image2: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&h=500&fit=crop',
              image3: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=600&fit=crop'
            }
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

        // Buscar configurações das categorias do Firestore
        const categoriasDoc = await getDoc(doc(db, 'content', 'categories'));
        if (categoriasDoc.exists()) {
          const data = categoriasDoc.data();
          setCategoriasConfig({
            destinos_home: {
              titulo: data.destinos_home?.titulo || "Escolha Sua Próxima Aventura",
              descricao: data.destinos_home?.descricao || "Pacotes exclusivos organizados por categoria para transformar sua viagem em uma experiência única"
            }
          });
          console.log('✅ Configurações de categorias carregadas do Firestore');
        } else {
          console.log('⚠️ Usando configurações padrão de categorias (Firestore não encontrado)');
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
        
        // Salvar no cache
        localStorage.setItem(cacheKey, JSON.stringify({
          pacotesPorCategoria: grouped,
          avaliacoes: avaliacoesData
        }));
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
      } catch (error) {
        console.error("Erro ao carregar dados da Home:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Carrossel automático de depoimentos
  useEffect(() => {
    if (avaliacoes.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % avaliacoes.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [avaliacoes.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % avaliacoes.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + avaliacoes.length) % avaliacoes.length);
  };

  return (
    <>
      <SEOHelmet
        title={homeSeo?.title || seoData.home.title}
        description={homeSeo?.description || seoData.home.description}
        keywords={homeSeo?.keywords || seoData.home.keywords}
        canonical={homeSeo?.canonical || '/'}
        ogImage={homeSeo?.ogImage || DEFAULT_HOME_FEATURED_IMAGE}
        ogType="website"
      />
      <Header />
      
      <main className="home-ultra-modern">
        {/* Banner Carousel */}
        <section className="home-hero-section">
          <BannerCarousel />
        </section>

        {/* Nossos Serviços */}
        {services && services.length > 0 && (
          <section className="home-services-section">
            <div className="home-services-container">
              <div className="home-services-header">
                <span className="home-services-badge">
                  {servicesSectionData.badge}
                </span>
                <h2 className="home-services-title">
                  {servicesSectionData.title}
                </h2>
                <p className="home-services-subtitle">
                  {servicesSectionData.subtitle}
                </p>
              </div>

              <div className="home-services-grid">
                {services.map((service, index) => (
                  <Link
                    key={index}
                    to={service.link || '/pacotes'}
                    className={`home-service-card${isImageMissing(service.image) ? ' home-service-card--no-image' : ''}`}
                  >
                    <div className={`home-service-image-wrapper${isImageMissing(service.image) ? ' home-service-image-wrapper--no-image' : ''}`}>
                      {isImageMissing(service.image) ? (
                        <div className="home-service-image-missing">
                          <span>Imagem não enviada</span>
                        </div>
                      ) : (
                        <img
                          src={autoOptimize(service.image, 'serviceCard')}
                          srcSet={generateCloudinarySrcset(service.image, [400, 600, 800]) || undefined}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                          alt={service.alt || service.title || 'Serviço'}
                          className="servico-image"
                          loading={index === 0 ? 'eager' : 'lazy'}
                          fetchPriority={index === 0 ? 'high' : 'auto'}
                          decoding="async"
                          width="665"
                          height="374"
                        />
                      )}
                      <div 
                        className="home-service-overlay"
                        style={{ background: `linear-gradient(135deg, ${service.color}dd, ${service.color}99)` }}
                      />
                    </div>
                    <div className="home-service-content">
                      <h3 className="home-service-title">{service.title}</h3>
                      <p className="home-service-description">{service.description}</p>
                      <span className="home-service-link">
                        {service.linkText || 'Saiba mais'}
                        <FiArrowRight />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pacotes em Destaque */}
        {Object.keys(pacotesPorCategoria).length > 0 && (
          <section className="home-pacotes-section">
            <div className="home-pacotes-container">
              <div className="home-pacotes-header">
                <span className="home-pacotes-badge">Destinos Selecionados</span>
                <h2 className="home-pacotes-title">
                  {categoriasConfig.destinos_home.titulo}
                </h2>
                <p className="home-pacotes-subtitle">
                  {categoriasConfig.destinos_home.descricao}
                </p>
              </div>

              {Object.entries(pacotesPorCategoria).map(([categoria, pacotes]) => (
                <div key={categoria} className="home-pacotes-categoria">
                  <h3 className="home-pacotes-categoria-title">
                    {categorias[categoria] || categoria}
                  </h3>
                  <PacotesCarousel pacotes={pacotes} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Transfer Beberibe */}
        <TransferBeberibe />

        {/* Diferenciais */}
        {differentialsSettings.active && (
          <section className="home-differentials-section">
            <div className="home-differentials-container">
              <div className="home-differentials-header">
                <span className="home-differentials-badge">
                  {differentialsSettings.badge}
                </span>
                <h2 className="home-differentials-title">
                  {differentialsSettings.title}
                </h2>
                <p className="home-differentials-description">
                  {differentialsSettings.description}
                </p>
              </div>

              <div className="home-differentials-grid">
                {differentials.map((item, index) => (
                  <div key={index} className="home-differential-card">
                    <div className="home-differential-icon">
                      {getIconComponent(item.icon)}
                    </div>
                    <h3 className="home-differential-title">{item.title}</h3>
                    <p className="home-differential-description">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Carrossel de Imagens */}
        {carouselSettings.active && carouselSettings.images.length > 0 && (
          <ImageCarousel
            images={carouselSettings.images}
            speed={carouselSettings.speed}
          />
        )}

        {/* Avaliações */}
        {avaliacoes.length > 0 && (
          <section className="home-testimonials-section">
            <div className="home-testimonials-container">
              <div className="home-testimonials-header">
                <span className="home-testimonials-badge">Depoimentos</span>
                <h2 className="home-testimonials-title">
                  O Que Nossos Clientes Dizem
                </h2>
              </div>

              <div className="home-testimonial-card">
                <div className="home-testimonial-content">
                  <div className="home-testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="star-icon" />
                    ))}
                  </div>
                  <p className="home-testimonial-text">
                    "{avaliacoes[currentTestimonial]?.texto || avaliacoes[currentTestimonial]?.text || ''}"
                  </p>
                  <div className="home-testimonial-author">
                    <strong>{avaliacoes[currentTestimonial]?.nome || avaliacoes[currentTestimonial]?.name || 'Cliente'}</strong>
                  </div>
                </div>

                {avaliacoes.length > 1 && (
                  <div className="home-testimonial-controls">
                    <button onClick={prevTestimonial} className="testimonial-nav-btn">
                      <FiChevronLeft />
                    </button>
                    <div className="testimonial-dots">
                      {avaliacoes.map((_, index) => (
                        <span
                          key={index}
                          className={`testimonial-dot ${index === currentTestimonial ? 'active' : ''}`}
                          onClick={() => setCurrentTestimonial(index)}
                        />
                      ))}
                    </div>
                    <button onClick={nextTestimonial} className="testimonial-nav-btn">
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Google Reviews */}
        <GoogleReviews />

        {/* Blog Preview */}
        <BlogPreview />

        {/* FAQ */}
        <HomeFAQSection />

        {/* CTA Final WhatsApp */}
        <section className="home-cta-section">
          <div className="home-cta-container">
            <FiPackage className="home-cta-icon" />
            <h2 className="home-cta-title">
              Pronto para sua próxima aventura?
            </h2>
            <p className="home-cta-description">
              Entre em contato conosco e monte o roteiro perfeito para sua viagem
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de mais informações sobre os pacotes de viagem.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="home-cta-button"
            >
              <FaWhatsapp />
              Falar no WhatsApp
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default HomeUltraModern;
