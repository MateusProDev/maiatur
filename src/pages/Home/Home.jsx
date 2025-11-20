import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Banner from '../../components/Banner/Banner';
import Boxes from '../../components/Boxes/Boxes';
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import Carousel from '../../components/Carousel/Carousel';
import AvaliacoesSection from '../../components/AvaliacoesSection/AvaliacoesSection';
import AvaliacoesPreview from '../../components/AvaliacoesPreview/AvaliacoesPreview';
import AboutSection from '../../components/About/AboutSection';
import Depoimentos from '../../components/Depoimentos/Depoimentos';
import DestinosGrid from '../../components/DestinosGrid/DestinosGrid';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { inicializarAvaliacoes } from '../../utils/avaliacoesInitializer';
import { Box, Typography, Button } from '@mui/material';
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import { seoData } from '../../utils/seoData';
import './Home.css';

const Home = () => {
  const [destaques, setDestaques] = useState([]);
  const [outrosPacotes, setOutrosPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        // Inicializar dados de avaliações se necessário
        await inicializarAvaliacoes();
        
        const q = query(collection(db, 'pacotes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const pacotesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          preco: Number(doc.data().preco),
          precoOriginal: doc.data().precoOriginal ? Number(doc.data().precoOriginal) : null
        }));

        setDestaques(pacotesData.filter(p => p.destaque));
        setOutrosPacotes(pacotesData.filter(p => !p.destaque));
        
        // Se não há dados, adicionar dados de exemplo para teste
        if (pacotesData.length === 0) {
          const dadosExemplo = [
            {
              id: 'exemplo1',
              titulo: 'Tour Favela Chique - Completo',
              descricaoCurta: 'Conheça a história e cultura da comunidade com guia local.',
              preco: 150.00,
              precoOriginal: 200.00,
              imagens: ['https://via.placeholder.com/500x300?text=Tour+Completo'],
              slug: 'tour-completo',
              destaque: true
            },
            {
              id: 'exemplo2',
              titulo: 'Caminhada Cultural',
              descricaoCurta: 'Experiência cultural única através dos pontos históricos.',
              preco: 80.00,
              imagens: ['https://via.placeholder.com/500x300?text=Caminhada+Cultural'],
              slug: 'caminhada-cultural',
              destaque: false
            },
            {
              id: 'exemplo3',
              titulo: 'Tour Gastronômico',
              descricaoCurta: 'Deguste pratos típicos preparados pela comunidade.',
              preco: 120.00,
              imagens: ['https://via.placeholder.com/500x300?text=Tour+Gastronomico'],
              slug: 'tour-gastronomico',
              destaque: false
            }
          ];
          setDestaques(dadosExemplo.filter(p => p.destaque));
          setOutrosPacotes(dadosExemplo.filter(p => !p.destaque));
        }
      } catch (err) {
        console.error("Erro ao buscar pacotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    if (destaques.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % destaques.length);
      }, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [destaques.length]);

  if (loading) {
    return (
      <LoadingSpinner size="large" text="Carregando página inicial..." fullScreen={true} />
    );
  }

  return (
    <div className="home-container">
      <SEOHelmet
        title={seoData.home.title}
        description={seoData.home.description}
        canonical={seoData.home.canonical}
      />
      <Header />
      <Banner />
      
      {/* Highlights Carousel Section */}
      {destaques.length > 0 && (
        <section className="destaques-section">
          <div className="section-header">
            <Typography variant="h2" className="section-title">
              Pacotes em Destaque 
            </Typography>
            {/* <div className="carousel-controls">
              <IconButton 
                className="nav-button"
                onClick={() => {
                  clearInterval(intervalRef.current);
                  setCurrentSlide(prev => (prev - 1 + destaques.length) % destaques.length);
                }}
                aria-label="Anterior"
              >
                <ChevronLeft />
              </IconButton>
              <IconButton 
                className="nav-button"
                onClick={() => {
                  clearInterval(intervalRef.current);
                  setCurrentSlide(prev => (prev + 1) % destaques.length);
                }}
                aria-label="Próximo"
              >
                <ChevronRight />
              </IconButton>
            </div> */}
          </div>
          <div className="destaques-carousel">
            <div 
              className="carousel-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {destaques.map((pkg, index) => (
                <div 
                  key={pkg.id}
                  className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                >
                  <Link 
                    to={`/pacote/${pkg.slug || pkg.id}`} 
                    className="destaque-link"
                  >
                    <div className="destaque-card">
                      <div className="image-container">
                        <img 
                          src={pkg.imagens?.[0] || 'https://via.placeholder.com/500x500'} 
                          alt={pkg.titulo} 
                          loading="lazy"
                        />
                        {pkg.precoOriginal && (
                          <span className="discount-badge">
                            {Math.round((1 - pkg.preco / pkg.precoOriginal) * 100)}% OFF
                          </span>
                        )}
                      </div>
                      <div className="card-content">
                        <h3>{pkg.titulo}</h3>
                        <p className="short-description">{pkg.descricaoCurta}</p>
                        <div className="price-container">
                          {pkg.precoOriginal && (
                            <span className="original-price">
                              De: R$ {pkg.precoOriginal.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                          <span className="current-price">
                            Por: R$ {pkg.preco.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <Button
                          component="div"
                          variant="contained"
                          className="details-button"
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <div className="carousel-indicators">
              {destaques.map((_, index) => (
                <button
                  key={index}
                  className={`indicator${index === currentSlide ? ' active' : ''}`}
                  onClick={() => {
                    clearInterval(intervalRef.current);
                    setCurrentSlide(index);
                  }}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      <Boxes />
      
      <AboutSection />
      
      <DestinosGrid />

      {/* Outros Pacotes Section */}
      {outrosPacotes.length > 0 && (
        <section className="outros-pacotes-section">
          <div className="section-container">
            <Typography variant="h2" className="section-title">
              Nossos Pacotes
            </Typography>
            <div style={{ height: '1.5rem' }} />
            <div className="scroll-container">
              {outrosPacotes.map(pkg => (
                <div key={pkg.id} className="pacote-card">
                  <Link 
                    to={`/pacote/${pkg.slug || pkg.id}`} 
                    className="pacote-link"
                  >
                    <div className="card-image">
                      <img 
                        src={pkg.imagens?.[0] || 'https://via.placeholder.com/300x200'} 
                        alt={pkg.titulo}
                        loading="lazy" 
                      />
                    </div>
                    <div className="card-details">
                      <h3>{pkg.titulo}</h3>
                      <p className="description">{pkg.descricaoCurta}</p>
                      <div className="price-container">
                        {pkg.precoOriginal && (
                          <span className="original-price">
                            R$ {pkg.precoOriginal.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                        <span className="current-price">
                          R$ {pkg.preco.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <Button
                        component="div"
                        variant="outlined"
                        className="details-button"
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <AvaliacoesSection />
      
      <Depoimentos />

      <Carousel />
      
      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default Home;