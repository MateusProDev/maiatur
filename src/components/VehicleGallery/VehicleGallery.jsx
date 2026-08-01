import React from 'react';
import { FiUsers, FiBriefcase } from 'react-icons/fi';
import { autoOptimize } from '../../utils/cloudinaryOptimizer';
import './VehicleGallery.css';

/**
 * Componente VehicleGallery
 * Exibe galeria de veículos disponíveis para transfer
 * Responsivo: 1 coluna mobile, 2 colunas tablet, 3 colunas desktop
 */
const VehicleGallery = ({ veiculos = [] }) => {
  if (!veiculos || veiculos.length === 0) {
    return null;
  }

  return (
    <div className="vehicle-gallery">
      <h2 className="vehicle-gallery-title">Nossa Frota</h2>
      <div className="vehicle-gallery-grid">
        {veiculos.map((veiculo, index) => (
          <div key={index} className="vehicle-card">
            <div className="vehicle-card-image">
              <img
                src={autoOptimize(veiculo.imagem, 'serviceCard')}
                alt={veiculo.tipo}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.src = autoOptimize('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80', 'serviceCard');
                }}
              />
            </div>
            <div className="vehicle-card-content">
              <h3 className="vehicle-card-title">{veiculo.tipo}</h3>
              {veiculo.legenda && (
                <p className="vehicle-card-caption">{veiculo.legenda}</p>
              )}
              <div className="vehicle-card-specs">
                {veiculo.capacidade && (
                  <div className="vehicle-spec">
                    <FiUsers className="vehicle-spec-icon" />
                    <span>{veiculo.capacidade}</span>
                  </div>
                )}
                {veiculo.bagagem && (
                  <div className="vehicle-spec">
                    <FiBriefcase className="vehicle-spec-icon" />
                    <span>{veiculo.bagagem}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleGallery;
