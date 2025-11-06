import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { inicializarAvaliacoes } from '../../utils/avaliacoesInitializer';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Chip,
  Rating,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  TrendingUp, 
  Explore, 
  LocalOffer, 
  Star, 
  ArrowForward,
  FlightTakeoff,
  Hotel,
  Restaurant,
  Tour,
  WhatsApp,
  Instagram,
  Facebook,
  CheckCircle
} from '@mui/icons-material';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import Newsletter from '../../components/Newsletter/Newsletter';
import './HomeNew.css';

const HomeNew = () => {
  const [pacotesDestaque, setPacotesDestaque] = useState([]);
  const [todosPacotes, setTodosPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        await inicializarAvaliacoes();
        
        const q = query(collection(db, 'pacotes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const pacotesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          preco: Number(doc.data().preco),
          precoOriginal: doc.data().precoOriginal ? Number(doc.data().precoOriginal) : null
        }));

        setPacotesDestaque(pacotesData.filter(p => p.destaque).slice(0, 3));
        setTodosPacotes(pacotesData);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar pacotes:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-new">
      <Header />
      
      {/* Hero Section - Banner Principal */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Container maxWidth="lg">
            <Box className="hero-text">
              <Typography variant="overline" className="hero-subtitle">
                Bem-vindo à Transfer Fortaleza Tur
              </Typography>
              <Typography variant="h1" className="hero-title">
                Descubra o Mundo<br />Com Quem Entende
              </Typography>
              <Typography variant="h5" className="hero-description">
                Transformamos sonhos em experiências inesquecíveis.<br />
                Pacotes personalizados para todos os estilos e bolsos.
              </Typography>
              <Box className="hero-actions">
                <Button 
                  variant="contained" 
                  size="large" 
                  className="btn-primary"
                  endIcon={<ArrowForward />}
                  component={Link}
                  to="/pacotes"
                >
                  Explorar Destinos
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  className="btn-secondary"
                  startIcon={<WhatsApp />}
                  href="https://wa.me/5500000000000"
                  target="_blank"
                >
                  Falar com Especialista
                </Button>
              </Box>
            </Box>
          </Container>
        </div>
        <div className="hero-scroll-indicator">
          <span>Role para explorar</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Stats Section - Números que impressionam */}
      <section className="stats-section">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={6} md={3}>
              <Box className="stat-card">
                <Typography variant="h3" className="stat-number">15+</Typography>
                <Typography variant="body1" className="stat-label">Anos de Experiência</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box className="stat-card">
                <Typography variant="h3" className="stat-number">50k+</Typography>
                <Typography variant="body1" className="stat-label">Viajantes Felizes</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box className="stat-card">
                <Typography variant="h3" className="stat-number">200+</Typography>
                <Typography variant="body1" className="stat-label">Destinos Disponíveis</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box className="stat-card">
                <Typography variant="h3" className="stat-number">98%</Typography>
                <Typography variant="body1" className="stat-label">Satisfação Garantida</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Featured Packages - Pacotes em Destaque */}
      {pacotesDestaque.length > 0 && (
        <section className="featured-section">
          <Container maxWidth="lg">
            <Box className="section-header">
              <Box>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Mais Procurados" 
                  className="section-chip"
                />
                <Typography variant="h2" className="section-title">
                  Pacotes em Destaque
                </Typography>
                <Typography variant="body1" className="section-description">
                  As experiências mais incríveis selecionadas especialmente para você
                </Typography>
              </Box>
              <Button 
                component={Link} 
                to="/pacotes" 
                endIcon={<ArrowForward />}
                className="view-all-btn"
              >
                Ver Todos
              </Button>
            </Box>

            <Grid container spacing={4}>
              {pacotesDestaque.map((pacote, index) => (
                <Grid item xs={12} md={4} key={pacote.id}>
                  <Card className={`featured-card card-${index + 1}`}>
                    <Box className="card-badge">
                      <Chip 
                        icon={<Star />} 
                        label="Destaque" 
                        size="small"
                        className="badge-chip"
                      />
                    </Box>
                    <CardMedia
                      component="img"
                      height="300"
                      image={pacote.imagens?.[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'}
                      alt={pacote.titulo}
                      className="card-image"
                    />
                    <CardContent className="card-content">
                      <Typography variant="h5" className="card-title">
                        {pacote.titulo}
                      </Typography>
                      <Typography variant="body2" className="card-description">
                        {pacote.descricaoCurta}
                      </Typography>
                      
                      <Box className="card-features">
                        <Chip icon={<FlightTakeoff />} label="Voo Incluso" size="small" />
                        <Chip icon={<Hotel />} label="Hotel 4★" size="small" />
                        <Chip icon={<Restaurant />} label="Refeições" size="small" />
                      </Box>

                      <Box className="card-footer">
                        <Box className="price-box">
                          {pacote.precoOriginal && (
                            <Typography variant="body2" className="price-old">
                              De R$ {pacote.precoOriginal.toLocaleString('pt-BR')}
                            </Typography>
                          )}
                          <Typography variant="h4" className="price-current">
                            R$ {pacote.preco.toLocaleString('pt-BR')}
                          </Typography>
                          <Typography variant="caption" className="price-info">
                            ou 12x sem juros
                          </Typography>
                        </Box>
                        <Button 
                          variant="contained" 
                          fullWidth 
                          className="card-btn"
                          component={Link}
                          to={`/pacote/${pacote.slug || pacote.id}`}
                          endIcon={<ArrowForward />}
                        >
                          Ver Detalhes
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="why-us-section">
        <Container maxWidth="lg">
          <Box className="section-header-center">
            <Typography variant="h2" className="section-title">
              Por Que Escolher a Transfer Fortaleza Tur?
            </Typography>
            <Typography variant="body1" className="section-description">
              Muito mais do que uma agência, somos parceiros da sua aventura
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box className="feature-card">
                <Box className="feature-icon">
                  <LocalOffer />
                </Box>
                <Typography variant="h5" className="feature-title">
                  Melhor Preço Garantido
                </Typography>
                <Typography variant="body2" className="feature-description">
                  Encontrou mais barato? Igualamos o preço! Compromisso com o melhor custo-benefício do mercado.
                </Typography>
                <Box className="feature-list">
                  <Box className="feature-item">
                    <CheckCircle /> <span>Parcelamento sem juros</span>
                  </Box>
                  <Box className="feature-item">
                    <CheckCircle /> <span>Descontos exclusivos</span>
                  </Box>
                  <Box className="feature-item">
                    <CheckCircle /> <span>Cashback em compras</span>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box className="feature-card">
                <Box className="feature-icon">
                  <Tour />
                </Box>
                <Typography variant="h5" className="feature-title">
                  Suporte 24/7
                </Typography>
                <Typography variant="body2" className="feature-description">
                  Estamos com você antes, durante e depois da viagem. Equipe especializada sempre à disposição.
                </Typography>
                <Box className="feature-list">
                  <Box className="feature-item">
                    <CheckCircle /> <span>Atendimento humanizado</span>
                  </Box>
                  <Box className="feature-item">
                    <CheckCircle /> <span>Chat online 24h</span>
                  </Box>
                  <Box className="feature-item">
                    <CheckCircle /> <span>WhatsApp dedicado</span>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box className="feature-card">
                <Box className="feature-icon">
                  <Star />
                </Box>
                <Typography variant="h5" className="feature-title">
                  Experiências Exclusivas
                </Typography>
                <Typography variant="body2" className="feature-description">
                  Roteiros únicos e personalizados. Viva momentos que só a Transfer Fortaleza Tur pode proporcionar.
                </Typography>
                <Box className="feature-list">
                  <Box className="feature-item">
                    <CheckCircle /> <span>Roteiros personalizados</span>
                  </Box>
                  <Box className="feature-item">
                    <CheckCircle /> <span>Guias especializados</span>
                  </Box>
                  <Box className="feature-item">
                    <CheckCircle /> <span>Experiências VIP</span>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Destinations Grid - Grade de Destinos */}
      <section className="destinations-section">
        <Container maxWidth="lg">
          <Box className="section-header-center">
            <Chip 
              icon={<Explore />} 
              label="Explore o Mundo" 
              className="section-chip"
            />
            <Typography variant="h2" className="section-title">
              Destinos Populares
            </Typography>
            <Typography variant="body1" className="section-description">
              Do nacional ao internacional, temos o destino perfeito para você
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box className="destination-card destination-main">
                <img src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325" alt="Destino Principal" />
                <Box className="destination-overlay">
                  <Typography variant="h3">Europa Clássica</Typography>
                  <Typography variant="body1">A partir de R$ 8.999</Typography>
                  <Button variant="contained" endIcon={<ArrowForward />}>Explorar</Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box className="destination-card destination-secondary">
                    <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34" alt="Paris" />
                    <Box className="destination-overlay">
                      <Typography variant="h4">Paris</Typography>
                      <Typography variant="body2">15 pacotes</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box className="destination-card destination-secondary">
                    <img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963" alt="Itália" />
                    <Box className="destination-overlay">
                      <Typography variant="h4">Itália</Typography>
                      <Typography variant="body2">22 pacotes</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Box className="destination-card destination-small">
                  <img src="https://images.unsplash.com/photo-1483664852095-d6cc6870702d" alt="Caribe" />
                  <Box className="destination-overlay">
                    <Typography variant="h6">Caribe</Typography>
                    <Typography variant="caption">18 pacotes</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box className="destination-card destination-small">
                  <img src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200" alt="Ásia" />
                  <Box className="destination-overlay">
                    <Typography variant="h6">Ásia</Typography>
                    <Typography variant="caption">25 pacotes</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box className="destination-card destination-small">
                  <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801" alt="África" />
                  <Box className="destination-overlay">
                    <Typography variant="h6">África</Typography>
                    <Typography variant="caption">12 pacotes</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box className="destination-card destination-small">
                  <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4" alt="América do Sul" />
                  <Box className="destination-overlay">
                    <Typography variant="h6">América do Sul</Typography>
                    <Typography variant="caption">30 pacotes</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <Container maxWidth="lg">
          <Box className="section-header-center">
            <Typography variant="h2" className="section-title">
              O Que Dizem Nossos Clientes
            </Typography>
            <Typography variant="body1" className="section-description">
              Mais de 50 mil viajantes satisfeitos compartilham suas experiências
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                name: 'Maria Silva',
                location: 'São Paulo, SP',
                rating: 5,
                text: 'Experiência incrível! A Transfer Fortaleza Tur cuidou de cada detalhe da nossa viagem para a Europa. Recomendo demais!',
                avatar: 'https://i.pravatar.cc/150?img=5'
              },
              {
                name: 'João Santos',
                location: 'Rio de Janeiro, RJ',
                rating: 5,
                text: 'Atendimento impecável e preços justos. Já é a terceira viagem que faço com eles e sempre superam as expectativas.',
                avatar: 'https://i.pravatar.cc/150?img=12'
              },
              {
                name: 'Ana Paula',
                location: 'Belo Horizonte, MG',
                rating: 5,
                text: 'Melhor agência de turismo! Profissionais experientes que realmente se importam com a satisfação do cliente.',
                avatar: 'https://i.pravatar.cc/150?img=9'
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card className="testimonial-card">
                  <CardContent>
                    <Rating value={testimonial.rating} readOnly className="testimonial-rating" />
                    <Typography variant="body1" className="testimonial-text">
                      "{testimonial.text}"
                    </Typography>
                    <Box className="testimonial-author">
                      <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" />
                      <Box>
                        <Typography variant="subtitle1" className="author-name">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="caption" className="author-location">
                          {testimonial.location}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      {/* CTA Section - Chamada para Ação */}
      <section className="cta-section">
        <Container maxWidth="lg">
          <Box className="cta-content">
            <Typography variant="h2" className="cta-title">
              Pronto para Sua Próxima Aventura?
            </Typography>
            <Typography variant="h6" className="cta-description">
              Fale com nossos especialistas e monte o roteiro perfeito para você
            </Typography>
            <Box className="cta-actions">
              <Button 
                variant="contained" 
                size="large"
                className="cta-btn-primary"
                startIcon={<WhatsApp />}
                href="https://wa.me/5500000000000"
                target="_blank"
              >
                Falar no WhatsApp
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                className="cta-btn-secondary"
                component={Link}
                to="/contato"
              >
                Solicitar Orçamento
              </Button>
            </Box>
            <Box className="cta-social">
              <Typography variant="body2">Siga-nos nas redes sociais</Typography>
              <Box className="social-icons">
                <IconButton className="social-icon">
                  <Instagram />
                </IconButton>
                <IconButton className="social-icon">
                  <Facebook />
                </IconButton>
                <IconButton className="social-icon">
                  <WhatsApp />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Container>
      </section>

      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default HomeNew;
