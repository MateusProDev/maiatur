import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiInfo, 
  FiUser, 
  FiMapPin,
  FiPackage,
  FiPhone
} from 'react-icons/fi';

const Header = () => {
  const [logoUrl, setLogoUrl] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchHeaderData = async () => {
      const headerRef = doc(db, 'content', 'header');
      const headerDoc = await getDoc(headerRef);

      if (headerDoc.exists()) {
        const url = headerDoc.data().logoUrl;
        console.log("URL da Logo: ", url);
        setLogoUrl(url);
      } else {
        console.log('Nenhuma logo encontrada!');
      }
    };

    fetchHeaderData();
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          {logoUrl ? (
            <img src={logoUrl} alt="20 Buscar Logo" />
          ) : (
            <div className="logo-placeholder">20 BUSCAR</div>
          )}
        </div>

        <button className="header-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <nav className={`header-nav ${menuOpen ? 'nav-open' : ''}`}>
          <ul className="header-nav-list">
            <li>
              <Link to="/" onClick={() => setMenuOpen(false)} className="nav-link">
                <FiHome className="nav-icon" /> 
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link to="/pacotes" onClick={() => setMenuOpen(false)} className="nav-link">
                <FiPackage className="nav-icon" /> 
                <span>Pacotes</span>
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="nav-link">
                <FiInfo className="nav-icon" /> 
                <span>Sobre Nós</span>
              </Link>
            </li>
            <li>
              <Link to="/destinos" onClick={() => setMenuOpen(false)} className="nav-link">
                <FiMapPin className="nav-icon" /> 
                <span>Destinos</span>
              </Link>
            </li>
            <li>
              <Link to="/contato" onClick={() => setMenuOpen(false)} className="nav-link">
                <FiPhone className="nav-icon" /> 
                <span>Contato</span>
              </Link>
            </li>
            <li>
              <Link to="/usuario" onClick={() => setMenuOpen(false)} className="nav-link user-area">
                <FiUser className="nav-icon" /> 
                <span>Área do Usuário</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;