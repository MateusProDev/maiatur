import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { 
  Button, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Search, Clear, FilterAlt } from '@mui/icons-material';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import './PacotesListPage.css';

const PacotesListPage = () => {
  const [pacotes, setPacotes] = useState([]);
  const [filteredPacotes, setFilteredPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDestaque, setFilterDestaque] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPacotes = async () => {
      try {
        let q;
        if (filterDestaque) {
          q = query(collection(db, 'pacotes'), 
            where('destaque', '==', true),
            orderBy('createdAt', 'desc')
          );
        } else {
          q = query(collection(db, 'pacotes'), orderBy('createdAt', 'desc'));
        }
        
        const querySnapshot = await getDocs(q);
        
        const pacotesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          preco: Number(doc.data().preco),
          precoOriginal: doc.data().precoOriginal ? Number(doc.data().precoOriginal) : null
        }));

        setPacotes(pacotesData);
        setFilteredPacotes(pacotesData);
      } catch (err) {
        console.error("Erro ao buscar pacotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPacotes();
  }, [filterDestaque]);

  useEffect(() => {
    let results = pacotes;
    
    if (searchTerm) {
      results = results.filter(pacote =>
        pacote.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pacote.descricaoCurta.toLowerCase().includes(searchTerm.toLowerCase())
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
    
    setFilteredPacotes(results);
  }, [searchTerm, priceRange, pacotes]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setPriceRange('all');
    setFilterDestaque(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" className="plp-loading-container">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  return (
    <div className="pacotes-list-page">
      <Header />
      <Container maxWidth="xl" className="plp-container" sx={{ py: 2 }}>
        <Breadcrumb 
          currentPage="Pacotes"
        />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom className="plp-title">
            Nossos Pacotes
          </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 300 }}
          />
          
          <Button 
            size="small"
            variant={!filterDestaque ? 'contained' : 'outlined'}
            onClick={() => setFilterDestaque(false)}
          >
            Todos
          </Button>
          
          <Button 
            size="small"
            variant={filterDestaque ? 'contained' : 'outlined'}
            onClick={() => setFilterDestaque(true)}
          >
            Destaques
          </Button>
          
          <Button 
            size="small"
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterAlt fontSize="small" />}
          >
            Filtros
          </Button>
        </Box>
        
        {showFilters && (
          <Box className="advanced-filters" sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: 1,
            backgroundColor: 'background.paper',
            boxShadow: 1
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Faixa de Preço</InputLabel>
                  <Select
                    value={priceRange}
                    label="Faixa de Preço"
                    onChange={(e) => setPriceRange(e.target.value)}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="0-500">Até R$ 500</MenuItem>
                    <MenuItem value="500-1000">R$ 500-1.000</MenuItem>
                    <MenuItem value="1000-2000">R$ 1.000-2.000</MenuItem>
                    <MenuItem value="2000+">Acima de R$ 2.000</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`${filteredPacotes.length} itens`}
                size="small"
                color="info"
                variant="outlined"
              />
              
              {(searchTerm || priceRange !== 'all' || filterDestaque) && (
                <Chip
                  label="Limpar"
                  size="small"
                  onClick={handleClearFilters}
                  onDelete={handleClearFilters}
                  deleteIcon={<Clear fontSize="small" />}
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}
      </Box>
      
      <Box className="plp-grid-container">
        {filteredPacotes.map(pacote => (
          <Link 
            to={`/pacote/${pacote.slug || pacote.id}`} 
            key={pacote.id}
            className="plp-card-link"
          >
            <Card className="plp-pacote-card">
              {pacote.imagens && pacote.imagens[0] && (
                <Box className="plp-card-image-container">
                  <CardMedia
                    component="img"
                    image={pacote.imagens[0]}
                    alt={pacote.titulo}
                    className="plp-card-image"
                  />
                </Box>
              )}
              
              <CardContent className="plp-card-content">
                <Typography gutterBottom variant="subtitle2" component="h3" className="plp-pacote-title">
                  {pacote.titulo}
                  {pacote.destaque && (
                    <Box component="span" className="plp-destaque-badge">
                      ★
                    </Box>
                  )}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" className="plp-pacote-desc">
                  {pacote.descricaoCurta}
                </Typography>
                
                <Box className="plp-price-container">
                  {pacote.precoOriginal && (
                    <Typography variant="caption" className="plp-original-price">
                      R$ {pacote.precoOriginal.toFixed(2).replace('.', ',')}
                    </Typography>
                  )}
                  <Typography variant="subtitle2" className="plp-current-price">
                    R$ {pacote.preco.toFixed(2).replace('.', ',')}
                  </Typography>
                </Box>
              </CardContent>
              
              <Box sx={{ p: 1 }}>
                <Button
                  component="div"
                  variant="contained"
                  fullWidth
                  size="small"
                  className="plp-details-button"
                >
                  Detalhes
                </Button>
              </Box>
            </Card>
          </Link>
        ))}
      </Box>
      
      {filteredPacotes.length === 0 && (
        <Box className="plp-no-results" sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1">
            Nenhum pacote encontrado
          </Typography>
          <Button 
            variant="outlined" 
            size="small"
            onClick={handleClearFilters}
            sx={{ mt: 1 }}
            startIcon={<Clear />}
          >
            Limpar filtros
          </Button>
        </Box>
      )}
      </Container>
      <Footer />
    </div>
  );
};

export default PacotesListPage;