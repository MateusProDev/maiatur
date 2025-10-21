// src/components/PacoteCard/PacoteCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './PacoteCard.css';

const PacoteCard = ({ pacote }) => {
  return (
    <Link to={`/pacote/${pacote.slug || pacote.id}`} className="pacote-card-link">
      <div className="pacote-card">
        <div className="image-container">
          <img 
            src={pacote.imagens?.[0] || 'https://via.placeholder.com/300x200'} 
            alt={pacote.titulo} 
          />
          {/* Só mostra badge de desconto se mostrarPreco não for false */}
          {pacote.mostrarPreco !== false && pacote.precoOriginal && (
            <span className="discount-badge">
              {Math.round((1 - pacote.preco / pacote.precoOriginal) * 100)}% OFF
            </span>
          )}
        </div>
        <div className="pacote-info">
          <h3>{pacote.titulo}</h3>
          <p className="description">{pacote.descricaoCurta}</p>
          {/* Só mostra preço se mostrarPreco não for false */}
          {pacote.mostrarPreco !== false && (
            <div className="price-container">
              {pacote.precoOriginal && (
                <span className="original-price">
                  R$ {pacote.precoOriginal.toFixed(2).replace('.', ',')}
                </span>
              )}
              <span className="current-price">
                R$ {pacote.preco.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
          <button className="details-button">Ver Detalhes</button>
        </div>
      </div>
    </Link>
  );
};

export default PacoteCard;