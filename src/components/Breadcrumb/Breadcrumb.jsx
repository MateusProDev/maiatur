import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ items, currentPage }) => {
  return (
    <div className="breadcrumb-container">
      <nav className="breadcrumb-nav" aria-label="breadcrumb">
        {/* Home Icon */}
        <Link to="/" className="breadcrumb-home" aria-label="Ir para home">
          <span className="home-icon">🏠</span>
        </Link>
        
        {/* Separator after home */}
        <span className="breadcrumb-separator">›</span>
        
        {/* Dynamic Items */}
        {items && items.map((item, index) => (
          <React.Fragment key={index}>
            <Link to={item.path} className="breadcrumb-link">
              {item.label}
            </Link>
            <span className="breadcrumb-separator">›</span>
          </React.Fragment>
        ))}
        
        {/* Current Page */}
        {currentPage && (
          <span className="breadcrumb-current">
            {currentPage}
          </span>
        )}
      </nav>
    </div>
  );
};

export default Breadcrumb;
