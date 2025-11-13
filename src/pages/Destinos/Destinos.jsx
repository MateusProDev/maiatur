import React from 'react';
import './Destinos.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

const Destinos = () => {
  return (
    <div className="destinos-page">
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
