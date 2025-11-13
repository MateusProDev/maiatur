import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
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
  FiGlobe
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './HomeModern.css';

const HomeModern = () => {
  const [pacotes, setPacotes] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clientes: 2500,
    destinos: 50,
    satisfacao: 98,
    anos: 10
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
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
        setPacotes(pacotesData);

        // Buscar Avaliações
        const avaliacoesQuery = query(
          collection(db, 'avaliacoes'),
          orderBy('createdAt', 'desc'),
          limit(3)
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

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de mais informações sobre os pacotes da Transfer Fortaleza Tur.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  return (
    <div className="home-modern">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section-modern">
        <div className="hero-overlay"></div>
        <div className="hero-content-wrapper">
          <div className="hero-content">
            <span className="hero-badge">
              <FiGlobe /> Viagens Inesquecíveis
            </span>
            <h1 className="hero-title">
              Descubra Destinos Incríveis com a
              <span className="gradient-text"> Transfer Fortaleza Tur</span>
            </h1>
            <p className="hero-description">
              Transforme seus sonhos em realidade com pacotes personalizados 
              e experiências únicas em Fortaleza e região.
            </p>
            <div className="hero-actions">
              <Link to="/pacotes" className="btn-primary-hero">
                Explorar Pacotes
                <FiArrowRight />
              </Link>
              <button onClick={handleWhatsApp} className="btn-secondary-hero">
                <FaWhatsapp />
                Falar no WhatsApp
              </button>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span>Role para baixo</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section-modern">
        <div className="container-modern">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.clientes.toLocaleString()}+</h3>
                <p className="stat-label">Clientes Felizes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiMapPin />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.destinos}+</h3>
                <p className="stat-label">Destinos</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiAward />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.satisfacao}%</h3>
                <p className="stat-label">Satisfação</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiTrendingUp />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.anos}+</h3>
                <p className="stat-label">Anos de Experiência</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pacotes Destaque Section */}
      <section className="featured-packages-section">
        <div className="container-modern">
          <div className="section-header-modern">
            <span className="section-badge">Ofertas Especiais</span>
            <h2 className="section-title-modern">
              Pacotes em Destaque
            </h2>
            <p className="section-description-modern">
              Selecionamos as melhores ofertas para você viajar com economia e conforto
            </p>
          </div>

          {loading ? (
            <div className="loading-modern">
              <div className="spinner-modern"></div>
              <p>Carregando pacotes...</p>
            </div>
          ) : (
            <div className="packages-grid-modern">
              {pacotes.slice(0, 6).map((pacote) => (
                <Link 
                  key={pacote.id} 
                  to={`/pacote/${pacote.slug || pacote.id}`}
                  className="package-card-modern"
                >
                  <div className="package-image-wrapper">
                    <img 
                      src={pacote.imagens?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500'} 
                      alt={pacote.titulo}
                      className="package-image"
                    />
                    {pacote.destaque && (
                      <span className="package-badge">Destaque</span>
                    )}
                  </div>
                  <div className="package-content">
                    <h3 className="package-title">{pacote.titulo}</h3>
                    <p className="package-description">
                      {pacote.descricaoCurta || 'Experiência incrível esperando por você'}
                    </p>
                    <div className="package-meta">
                      <span className="package-duration">
                        <FiClock />
                        {pacote.duracao || '5 dias'}
                      </span>
                      <span className="package-rating">
                        <FiStar />
                        {pacote.rating || '4.8'}
                      </span>
                    </div>
                    <div className="package-footer">
                      <div className="package-price">
                        {pacote.precoOriginal && (
                          <span className="price-original">
                            R$ {Number(pacote.precoOriginal).toFixed(2)}
                          </span>
                        )}
                        <span className="price-current">
                          R$ {Number(pacote.preco || 0).toFixed(2)}
                        </span>
                      </div>
                      <button className="btn-package-details">
                        Ver Detalhes
                        <FiArrowRight />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="section-cta-modern">
            <Link to="/pacotes" className="btn-view-all">
              Ver Todos os Pacotes
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Por que escolher a Transfer Fortaleza Tur */}
      <section className="why-choose-section">
        <div className="container-modern">
          <div className="section-header-modern">
            <span className="section-badge">Diferenciais</span>
            <h2 className="section-title-modern">
              Por que Escolher a Transfer Fortaleza Tur?
            </h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FiAward />
              </div>
              <h3>Qualidade Garantida</h3>
              <p>Pacotes cuidadosamente selecionados com os melhores fornecedores</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiUsers />
              </div>
              <h3>Atendimento Personalizado</h3>
              <p>Equipe especializada para atender suas necessidades</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiMapPin />
              </div>
              <h3>Destinos Exclusivos</h3>
              <p>Acesso a lugares incríveis em Fortaleza e região</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiTrendingUp />
              </div>
              <h3>Melhor Custo-Benefício</h3>
              <p>Preços competitivos sem abrir mão da qualidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos Section */}
      {avaliacoes.length > 0 && (
        <section className="testimonials-section-modern">
          <div className="container-modern">
            <div className="section-header-modern">
              <span className="section-badge">Depoimentos</span>
              <h2 className="section-title-modern">
                O Que Nossos Clientes Dizem
              </h2>
            </div>

            <div className="testimonials-grid">
              {avaliacoes.map((avaliacao) => (
                <div key={avaliacao.id} className="testimonial-card-modern">
                  <div className="testimonial-stars">
                    {[...Array(avaliacao.nota || 5)].map((_, i) => (
                      <FiStar key={i} className="star-filled" />
                    ))}
                  </div>
                  <p className="testimonial-text">
                    "{avaliacao.comentario || avaliacao.texto}"
                  </p>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      {avaliacao.nome?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h4>{avaliacao.nome || 'Cliente'}</h4>
                      <p>{avaliacao.destino || 'Viajante'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final Section */}
      <section className="cta-final-section">
        <div className="container-modern">
          <div className="cta-content-modern">
            <h2>Pronto para Sua Próxima Aventura?</h2>
            <p>Entre em contato conosco e comece a planejar a viagem dos seus sonhos hoje mesmo!</p>
            <div className="cta-buttons-modern">
              <Link to="/pacotes" className="btn-cta-primary">
                Explorar Pacotes
              </Link>
              <button onClick={handleWhatsApp} className="btn-cta-whatsapp">
                <FaWhatsapp />
                Falar com Especialista
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default HomeModern;
