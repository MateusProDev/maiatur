import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { FiSearch, FiX, FiFilter, FiMapPin, FiCalendar, FiTrendingUp, FiStar } from 'react-icons/fi';
import './PacotesListPage.css';

const PacotesListPage = () => {
  const [allPacotes, setAllPacotes] = useState([]); // Todos os pacotes do Firebase
  const [filteredPacotes, setFilteredPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDestaque, setFilterDestaque] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Busca inicial dos pacotes do Firebase (executa apenas uma vez)
  useEffect(() => {
    const fetchPacotes = async () => {
      try {
        console.log('🔄 Iniciando busca de pacotes...');
        
        const querySnapshot = await getDocs(collection(db, 'pacotes'));
        
        console.log(`📊 Documentos retornados do Firestore: ${querySnapshot.size}`);
        
        const pacotesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log(`📦 Pacote: ${data.titulo} | Destaque: ${data.destaque}`);
          
          return {
            id: doc.id,
            ...data,
            preco: Number(data.preco || 0),
            precoOriginal: data.precoOriginal ? Number(data.precoOriginal) : null
          };
        });

        // Ordena por createdAt
        pacotesData.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            const aTime = a.createdAt.seconds || a.createdAt;
            const bTime = b.createdAt.seconds || b.createdAt;
            return bTime - aTime;
          }
          return 0;
        });

        console.log(`✅ Total de pacotes carregados: ${pacotesData.length}`);
        setAllPacotes(pacotesData);
      } catch (err) {
        console.error("❌ Erro ao buscar pacotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPacotes();
  }, []); // Executa apenas uma vez

  // Aplica todos os filtros sempre que algo mudar
  useEffect(() => {
    console.log('🔍 Aplicando filtros...', { 
      total: allPacotes.length, 
      destaque: filterDestaque, 
      busca: searchTerm, 
      preco: priceRange 
    });
    
    let results = [...allPacotes];
    
    // Filtro de destaque
    if (filterDestaque) {
      results = results.filter(pacote => pacote.destaque === true);
      console.log(`⭐ Após filtro destaque: ${results.length} pacotes`);
    }
    
    // Filtro de busca
    if (searchTerm) {
      results = results.filter(pacote =>
        pacote.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pacote.descricaoCurta && pacote.descricaoCurta.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      console.log(`🔎 Após busca: ${results.length} pacotes`);
    }
    
    // Filtro de preço
    switch (priceRange) {
      case '0-500':
        results = results.filter(pacote => pacote.preco <= 500);
        break;
      case '500-1000':
        results = results.filter(pacote => pacote.preco > 500 && pacote.preco <= 1000);
        break;
      case '1000-2000':
        results = results.filter(pacote => pacote.preco > 1000 && pacote.preco <= 2000);
        break;
      case '2000+':
        results = results.filter(pacote => pacote.preco > 2000);
        break;
      default:
        break;
    }
    
    if (priceRange !== 'all') {
      console.log(`💰 Após filtro de preço: ${results.length} pacotes`);
    }
    
    console.log(`✅ Total final: ${results.length} pacotes`);
    setFilteredPacotes(results);
  }, [allPacotes, searchTerm, priceRange, filterDestaque]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setPriceRange('all');
    setFilterDestaque(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container-pacotes">
          <LoadingSpinner size="large" text="Carregando pacotes incríveis..." />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="pacotes-page-modern">
      <Header />
      
      {/* Hero Section */}
      <section className="pacotes-hero">
        <div className="pacotes-hero-bg"></div>
        <div className="pacotes-hero-content">
          <h1 className="pacotes-hero-title">
            Descubra seu Próximo Destino
          </h1>
          <p className="pacotes-hero-subtitle">
            Pacotes exclusivos com os melhores preços e experiências inesquecíveis
          </p>
          
          {/* Search Bar */}
          <div className="pacotes-search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar destino, cidade, país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Limpar busca"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="currentColor"/>
          </svg>
        </div>
      </section>

      {/* Filters Section */}
      <section className="pacotes-filters-section">
        <div className="pacotes-container">
          <div className="filters-header">
            <div className="filters-tabs">
              <button 
                className={`filter-tab ${!filterDestaque ? 'active' : ''}`}
                onClick={() => setFilterDestaque(false)}
              >
                <FiMapPin />
                Todos os Pacotes
              </button>
              <button 
                className={`filter-tab ${filterDestaque ? 'active' : ''}`}
                onClick={() => setFilterDestaque(true)}
              >
                <FiStar />
                Destaques
              </button>
            </div>
            
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter />
              Filtros Avançados
            </button>
          </div>

          {showFilters && (
            <div className="advanced-filters-modern">
              <div className="filter-group">
                <label className="filter-label">
                  <FiTrendingUp />
                  Faixa de Preço
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Todas as faixas</option>
                  <option value="0-500">Até R$ 500</option>
                  <option value="500-1000">R$ 500 - R$ 1.000</option>
                  <option value="1000-2000">R$ 1.000 - R$ 2.000</option>
                  <option value="2000+">Acima de R$ 2.000</option>
                </select>
              </div>

              <div className="filter-results">
                <span className="results-count">
                  {filteredPacotes.length} {filteredPacotes.length === 1 ? 'pacote encontrado' : 'pacotes encontrados'}
                </span>
                
                {(searchTerm || priceRange !== 'all' || filterDestaque) && (
                  <button 
                    className="clear-filters-btn"
                    onClick={handleClearFilters}
                  >
                    <FiX />
                    Limpar Filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Packages Grid */}
      <section className="pacotes-grid-section">
        <div className="pacotes-container">
          {filteredPacotes.length > 0 ? (
            <div className="pacotes-grid-modern">
              {filteredPacotes.map((pacote, index) => (
                <Link 
                  to={`/pacote/${pacote.slug || pacote.id}`} 
                  key={pacote.id}
                  className="pacote-card-modern"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="pacote-card-image">
                    <img 
                      src={pacote.imagens?.[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'} 
                      alt={pacote.titulo}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';
                      }}
                    />
                    {pacote.destaque && (
                      <div className="pacote-badge-destaque">
                        <FiStar />
                        Destaque
                      </div>
                    )}
                    <div className="pacote-card-overlay"></div>
                  </div>
                  
                  <div className="pacote-card-content">
                    <h3 className="pacote-card-title">{pacote.titulo}</h3>
                    <p className="pacote-card-description">{pacote.descricaoCurta}</p>
                    
                    <div className="pacote-card-footer">
                      <div className="pacote-price-box">
                        {pacote.precoOriginal && (
                          <span className="price-original">
                            R$ {pacote.precoOriginal.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                        <span className="price-current">
                          R$ {pacote.preco.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      
                      <button className="pacote-card-btn">
                        Ver Detalhes
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-results-modern">
              <div className="no-results-icon">
                <FiMapPin />
              </div>
              <h3>Nenhum pacote encontrado</h3>
              <p>Tente ajustar seus filtros ou buscar por outros destinos</p>
              <button 
                className="btn-primary-modern"
                onClick={handleClearFilters}
              >
                <FiX />
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PacotesListPage;