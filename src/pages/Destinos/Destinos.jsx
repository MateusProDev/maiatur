import React from 'react';
import { Link } from 'react-router-dom';
import './Destinos.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import { seoData } from '../../utils/seoData';

const Destinos = () => {
  return (
    <div className="destinos-page">
      <SEOHelmet 
        title={seoData.destinos.title}
        description={seoData.destinos.description}
        canonical={seoData.destinos.canonical}
        noindex={seoData.destinos.noindex}
      />
      <Header />
      <main className="destinos-main">
        <div className="destinos-container">
          <Breadcrumb 
            currentPage="Destinos"
          />
          
          <h1 className="destinos-title">Nossos Destinos</h1>
          <p className="destinos-description">
            Explore os destinos mais incríveis da região de Fortaleza. 
            De praias paradisíacas a experiências culturais únicas, 
            temos o destino perfeito para sua próxima aventura.
          </p>
          
          <div className="destinos-content">
            <div className="destino-card">
              <h3>Praias do Ceará</h3>
              <p>Descubra as praias mais bonitas do litoral cearense</p>
            </div>
            
            <div className="destino-card">
              <h3>Passeios Regionais</h3>
              <p>Conheça os melhores passeios de Fortaleza e região</p>
            </div>
            
            <div className="destino-card">
              <h3>Pacotes Exclusivos</h3>
              <p>Experiências únicas e personalizadas</p>
            </div>
          </div>
        </div>
      </main>
        {/* Veja Também - contextual link to categoria/passeio to improve inbound links */}
        <section className="veja-tambem-section" style={{ padding: '1.5rem 0', background: '#fafafa' }}>
          <div className="veja-tambem-container" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1rem' }}>
            <h3 style={{ margin: 0, marginBottom: '.5rem', fontSize: '1.1rem' }}>Veja também</h3>
            <div>
              <Link to="/categoria/passeio" style={{ color: '#21A657', textDecoration: 'none', fontWeight: 600 }}>
                Passeios e experiências em Fortaleza
              </Link>
            </div>
          </div>
        </section>

        <Footer />
    </div>
  );
};

export default Destinos;
