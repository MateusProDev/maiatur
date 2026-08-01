import React from 'react';
import { FiStar, FiShield, FiClock, FiDollarSign, FiUsers, FiCheckCircle } from 'react-icons/fi';
import './AdvantagesList.css';

/**
 * Componente AdvantagesList
 * Exibe vantagens do serviço em grid de cards
 * Com ícones grandes e destaque visual
 */
const AdvantagesList = ({ vantagens = [] }) => {
  if (!vantagens || vantagens.length === 0) {
    return null;
  }

  // Mapeamento de ícones baseado em palavras-chave
  const getIconForAdvantage = (advantage) => {
    const text = advantage.toLowerCase();
    if (text.includes('exclusiv') || text.includes('privativo')) return FiStar;
    if (text.includes('flexibil') || text.includes('horário')) return FiClock;
    if (text.includes('pagamento') || text.includes('preço')) return FiDollarSign;
    if (text.includes('segurança') || text.includes('credenciad')) return FiShield;
    if (text.includes('conforto') || text.includes('ar')) return FiUsers;
    return FiCheckCircle;
  };

  return (
    <div className="advantages-list">
      <h2 className="advantages-list-title">Por Que Escolher Nosso Transfer</h2>
      <div className="advantages-grid">
        {vantagens.map((vantagem, index) => {
          const Icon = getIconForAdvantage(vantagem);
          return (
            <div key={index} className="advantage-card">
              <Icon className="advantage-icon" />
              <p className="advantage-text">{vantagem}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvantagesList;
