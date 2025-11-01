import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { FiSearch, FiX, FiFilter, FiMapPin, FiCalendar, FiTrendingUp, FiStar, FiPackage } from 'react-icons/fi';
import './CategoriaPage.css';

// Mapeamento de categorias
const CATEGORIAS = {
  'passeio': {
    nome: 'Passeios',
    descricao: 'Descubra experiências únicas e passeios inesquecíveis',
    icon: FiMapPin
  },
  'transfer_chegada': {
    nome: 'Transfer de Chegada',
    descricao: 'Conforto e segurança desde sua chegada',
    icon: FiPackage
  },
  'transfer_saida': {
    nome: 'Transfer de Saída',
    descricao: 'Transporte seguro até seu destino final',
    icon: FiPackage
  },
  'transfer_chegada_saida': {
    nome: 'Transfer Completo',
    descricao: 'Transfer de chegada e saída com economia',
    icon: FiPackage
  },
  'transfer_entre_hoteis': {
    nome: 'Transfer entre Hotéis',
    descricao: 'Transfira-se com conforto entre acomodações',
    icon: FiPackage
  }
};

const CategoriaPage = () => {
  const { categoria } = useParams();
  const [allPacotes, setAllPacotes] = useState([]);
  const [filteredPacotes, setFilteredPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDestaque, setFilterDestaque] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categoriaInfo = CATEGORIAS[categoria] || {
    nome: 'Categoria',
    descricao: 'Explore nossos pacotes',
    icon: FiPackage
  };

  const Icon = categoriaInfo.icon;

  // Busca pacotes da categoria específica
  useEffect(() => {
    const fetchPacotes = async () => {
      try {
        setLoading(true);
        console.log(`🔄 Buscando pacotes da categoria: ${categoria}`);
        
        const q = query(
          collection(db, 'pacotes'),
          where('categoria', '==', categoria)
        );
        
        const querySnapshot = await getDocs(q);
        
        console.log(`📊 Documentos retornados: ${querySnapshot.size}`);
        
        const pacotesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
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
  }, [categoria]);

  // Aplica filtros
  useEffect(() => {
    console.log('🔍 Aplicando filtros...', { 
      total: allPacotes.length, 
      destaque: filterDestaque, 
      busca: searchTerm, 
      preco: priceRange 
    });
    
    let results = [...allPacotes];
    
    if (filterDestaque) {
      results = results.filter(pacote => pacote.destaque === true);
    }
    
    if (searchTerm) {
      results = results.filter(pacote =>
        pacote.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pacote.descricaoCurta && pacote.descricaoCurta.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
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
    
    console.log(`📦 Pacotes após filtros: ${results.length}`);
    setFilteredPacotes(results);
  }, [allPacotes, searchTerm, filterDestaque, priceRange]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterDestaque(false);
    setPriceRange('all');
  };

  if (loading) {
    return (
      <>
        <Header />
        <LoadingSpinner />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="categoria-hero">
        <div className="categoria-hero-overlay"></div>
        <div className="categoria-hero-content">
          <div className="categoria-icon-wrapper">
            <Icon className="categoria-hero-icon" />
          </div>
          <h1 className="categoria-hero-title">{categoriaInfo.nome}</h1>
          <p className="categoria-hero-description">{categoriaInfo.descricao}</p>
          <div className="categoria-hero-badge">
            <FiPackage />
            <span>{allPacotes.length} {allPacotes.length === 1 ? 'Pacote' : 'Pacotes'}</span>
          </div>
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="pacotes-filters-section">
        <div className="container-pacotes">
          <div className="filters-header">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="clear-search">
                  <FiX />
                </button>
              )}
            </div>

            <button 
              className={`filters-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter />
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label className="filter-label">
                  <FiTrendingUp />
                  Tipo de Pacote
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filterDestaque}
                    onChange={(e) => setFilterDestaque(e.target.checked)}
                  />
                  <span>Apenas Destaques</span>
                </label>
              </div>

              {/* Filtro de preço comentado
              <div className="filter-group">
                <label className="filter-label">
                  <FiCalendar />
                  Faixa de Preço
                </label>
                <select 
                  value={priceRange} 
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="price-select"
                >
                  <option value="all">Todos os preços</option>
                  <option value="0-500">Até R$ 500</option>
                  <option value="500-1000">R$ 500 - R$ 1.000</option>
                  <option value="1000-2000">R$ 1.000 - R$ 2.000</option>
                  <option value="2000+">Acima de R$ 2.000</option>
                </select>
              </div>
              */}

              <button onClick={handleClearFilters} className="clear-filters-btn">
                <FiX />
                Limpar Filtros
              </button>
            </div>
          )}

          {(searchTerm || filterDestaque) && (
            <div className="active-filters">
              <span className="active-filters-label">Filtros ativos:</span>
              {searchTerm && (
                <span className="filter-tag">
                  Busca: "{searchTerm}"
                  <FiX onClick={() => setSearchTerm('')} />
                </span>
              )}
              {filterDestaque && (
                <span className="filter-tag">
                  Destaques
                  <FiX onClick={() => setFilterDestaque(false)} />
                </span>
              )}
              {/* Removido filtro de preço
              {priceRange !== 'all' && (
                <span className="filter-tag">
                  Preço: {priceRange === '0-500' ? 'Até R$ 500' : 
                          priceRange === '500-1000' ? 'R$ 500-1000' :
                          priceRange === '1000-2000' ? 'R$ 1000-2000' : 'R$ 2000+'}
                  <FiX onClick={() => setPriceRange('all')} />
                </span>
              )}
              */}
            </div>
          )}
        </div>
      </section>

      {/* Grid de Pacotes */}
      <section className="pacotes-grid-section">
        <div className="container-pacotes">
          {filteredPacotes.length === 0 ? (
            <div className="no-results">
              <FiSearch className="no-results-icon" />
              <h3>Nenhum pacote encontrado</h3>
              <p>Tente ajustar os filtros ou fazer uma nova busca</p>
              <button onClick={handleClearFilters} className="btn-clear-all">
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            <>
              <div className="results-info">
                <p>
                  Mostrando <strong>{filteredPacotes.length}</strong> {filteredPacotes.length === 1 ? 'pacote' : 'pacotes'}
                </p>
              </div>
              
              <div className="pacotes-grid">
                {filteredPacotes.map((pacote) => (
                  <Link 
                    key={pacote.id} 
                    to={`/pacote/${pacote.slug || pacote.id}`}
                    className="pacote-card"
                  >
                    <div className="pacote-card-image">
                      <img 
                        src={pacote.imagens?.[0] || 'https://via.placeholder.com/400x300'} 
                        alt={pacote.titulo}
                      />
                      {pacote.destaque && (
                        <div className="pacote-badge destaque-badge">
                          <FiStar /> Destaque
                        </div>
                      )}
                      {pacote.precoOriginal && pacote.mostrarPreco === true && (
                        <div className="pacote-badge desconto-badge">
                          {Math.round((1 - pacote.preco / pacote.precoOriginal) * 100)}% OFF
                        </div>
                      )}
                    </div>
                  
                    <div className="pacote-card-content">
                      <h3 className="pacote-card-title">{pacote.titulo}</h3>
                      <p className="pacote-card-description">{pacote.descricaoCurta}</p>
                      
                      <div className="pacote-card-footer">
                        {pacote.mostrarPreco === true && (
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
                        )}
                        
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
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default CategoriaPage;
