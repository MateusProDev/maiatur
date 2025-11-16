
import React from "react";
import SEOHelmet from "../../components/SEOHelmet/SEOHelmet";
import Footer from "../../components/Footer/Footer";
import { Link } from "react-router-dom";

const Falha = () => (
  <div className="falha-page" style={{textAlign: 'center', padding: '48px 16px'}}>
    <SEOHelmet 
      title="Página não encontrada - Transfer Fortaleza Tur"
      description="A página que você tentou acessar não existe ou foi removida. Volte para a Home ou navegue pelos nossos pacotes e destinos."
      canonical="/404"
    />
    <h1 style={{fontSize: '2.5rem', color: '#EE7C35'}}>404</h1>
    <h2>Página não encontrada</h2>
    <p>A URL acessada não existe ou foi removida.<br />
      Volte para a <Link to="/">Home</Link> ou navegue pelos nossos <Link to="/pacotes">Pacotes</Link> e <Link to="/destinos">Destinos</Link>.
    </p>
    <Footer />
  </div>
);

export default Falha;
