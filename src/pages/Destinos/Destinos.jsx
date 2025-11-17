import React from 'react';
import { Helmet } from 'react-helmet-async';
import './Destinos.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import { seoData } from '../../utils/seoData';

const Destinos = () => {
  return (
    <div className="destinos-page">
      <Helmet>
        <title>Destinos em Fortaleza | Transfer Fortaleza Tur</title>
        <meta name="description" content="Explore os melhores destinos turísticos de Fortaleza e região com a Transfer Fortaleza Tur. Praias, passeios e experiências únicas para sua viagem." />
      </Helmet>
      <SEOHelmet 
        title={seoData.destinos.title}
        description={seoData.destinos.description}
        canonical={seoData.destinos.canonical}
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
      <Footer />
    </div>
  );
};

export default Destinos;
