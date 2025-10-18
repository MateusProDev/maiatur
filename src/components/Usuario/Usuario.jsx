import React from 'react';
import { FiUser } from 'react-icons/fi';
import './Usuario.css';

const Usuario = () => {
  return (
    <div className="usuario-bg">
      <div className="usuario-container">
        <FiUser className="usuario-icon" />
        <h2>Minhas Reservas</h2>
        <p>Aqui você poderá acompanhar suas reservas e atualizações em breve.</p>
      </div>
    </div>
  );
};

export default Usuario;
