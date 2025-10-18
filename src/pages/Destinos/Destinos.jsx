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
            Explore os destinos mais incríveis que oferecemos. 
            De praias paradisíacas a montanhas majestosas, 
            temos o destino perfeito para sua próxima aventura.
          </p>
          
          <div className="destinos-content">
            <div className="destino-card">
              <h3>Destinos Nacionais</h3>
              <p>Descubra as belezas do Brasil</p>
            </div>
            
            <div className="destino-card">
              <h3>Destinos Internacionais</h3>
              <p>Explore o mundo conosco</p>
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
