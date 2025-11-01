import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { 
  Typography, 
  Container, 
  Box, 
  Button, 
  Alert,
  Grid,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Footer from '../../components/Footer/Footer';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useWhatsAppNumber } from '../../hooks/useWhatsAppNumber';
import MarkdownRenderer from '../../components/MarkdownRenderer/MarkdownRenderer';
import './PacoteDetailPage.css';

const PacoteDetailPage = () => {
  const { pacoteSlug } = useParams();
  const [pacote, setPacote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const { phoneNumber: whatsappNumber, loading: whatsappLoading } = useWhatsAppNumber();
  const navigate = useNavigate();

  const formatPacoteData = useCallback((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      titulo: data.titulo || '',
      descricao: data.descricao || '',
      descricaoCurta: data.descricaoCurta || '',
      preco: parseFloat(data.preco) || 0,
      precoOriginal: data.precoOriginal ? parseFloat(data.precoOriginal) : null,
      imagens: Array.isArray(data.imagens) ? data.imagens : [],
      slug: data.slug || pacoteSlug,
      destaque: data.destaque || false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }, [pacoteSlug]);

  useEffect(() => {
    const fetchPacote = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const pacotesRef = collection(db, 'pacotes');
        const q = query(pacotesRef, where("slug", "==", pacoteSlug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setPacote(formatPacoteData(doc));
          return;
        }
        
        try {
          const docRef = doc(db, 'pacotes', pacoteSlug);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setPacote(formatPacoteData(docSnap));
          } else {
            setError("Pacote não encontrado");
          }
        } catch (err) {
          console.error("Erro ao buscar pacote por ID:", err);
          setError("Pacote não encontrado");
        }
      } catch (err) {
        console.error("Erro ao buscar pacote:", err);
        setError("Erro ao carregar pacote. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPacote();
  }, [pacoteSlug, formatPacoteData]);

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === pacote.imagens.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? pacote.imagens.length - 1 : prev - 1
    );
  };

  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

  const handleReserveWhatsApp = () => {
    if (whatsappLoading) return;
    const message = `Olá! Tenho interesse no pacote de viagem "${pacote.titulo}". Poderia me passar mais informações?`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading || whatsappLoading) {
    return (
      <LoadingSpinner size="large" text="Carregando detalhes do pacote..." fullScreen={true} />
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/pacotes')}
        >
          Voltar para lista de pacotes
        </Button>
      </Container>
    );
  }

  if (!pacote) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Pacote não encontrado
        </Typography>
        <Typography sx={{ mb: 2 }}>
          O pacote que você está procurando não existe ou foi removido.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/pacotes')}
        >
          Voltar para lista de pacotes
        </Button>
      </Container>
    );
  }

  return (
    <div className="pdp-container">
      <Container maxWidth="lg">
        <Breadcrumb 
          items={[
            { path: '/pacotes', label: 'Pacotes' }
          ]}
          currentPage={pacote.titulo}
        />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              {pacote.imagens.length > 0 ? (
                <div className="image-gallery">
                  <div className="main-image-container">
                    <img 
                      src={pacote.imagens[currentImageIndex]} 
                      alt={pacote.titulo} 
                      className="main-image"
                    />
                    {pacote.imagens.length > 1 && (
                      <>
                        <button className="nav-button prev" onClick={prevImage}>
                          &lt;
                        </button>
                        <button className="nav-button next" onClick={nextImage}>
                          &gt;
                        </button>
                      </>
                    )}
                  </div>
                  {pacote.imagens.length > 1 && (
                    <div className="thumbnail-container">
                      {pacote.imagens.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center" 
                  height="300px"
                  bgcolor="#f5f5f5"
                >
                  <Typography variant="body1">Nenhuma imagem disponível</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                {pacote.titulo}
              </Typography>
              
              {pacote.destaque && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="secondary" sx={{ fontWeight: 'bold' }}>
                    ★ PACOTE EM DESTAQUE ★
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" paragraph>
                  {pacote.descricaoCurta}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {pacote.mostrarPreco === true && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {pacote.precoOriginal && (
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        textDecoration: 'line-through',
                        color: 'text.secondary',
                        mr: 2
                      }}
                    >
                      R$ {pacote.precoOriginal.toFixed(2).replace('.', ',')}
                    </Typography>
                  )}
                  <Typography 
                    variant="h4" 
                    sx={{
                      background: 'linear-gradient(135deg, #21A657 0%, #78C8E5 100%) !important',
                      WebkitBackgroundClip: 'text !important',
                      WebkitTextFillColor: 'transparent !important',
                      backgroundClip: 'text !important',
                      fontWeight: '800 !important'
                    }}
                  >
                    R$ {pacote.preco.toFixed(2).replace('.', ',')}
                  </Typography>
                </Box>
              )}

              <Button 
                variant="contained" 
                size="large" 
                fullWidth
                sx={{ 
                  mt: 2,
                  background: 'linear-gradient(135deg, #21A657 0%, #2bc46a 100%) !important',
                  color: '#ffffff !important',
                  boxShadow: '0 4px 15px rgba(33, 166, 87, 0.3) !important',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1a8546 0%, #21A657 100%) !important',
                    boxShadow: '0 6px 20px rgba(33, 166, 87, 0.4) !important',
                  }
                }}
                onClick={handleReserveWhatsApp}
                disabled={whatsappLoading}
              >
                Solicitar Cotação
              </Button>

              <Accordion 
                expanded={expanded}
                onChange={handleAccordionChange}
                sx={{ 
                  mt: 3,
                  boxShadow: 'none',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px !important',
                  '&:before': {
                    display: 'none'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: expanded ? 'action.selected' : 'background.paper',
                    borderTopLeftRadius: '8px !important',
                    borderTopRightRadius: '8px !important',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>Descrição Completa</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <MarkdownRenderer 
                    content={pacote.descricao} 
                    className="pacote-description" 
                  />
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default PacoteDetailPage;