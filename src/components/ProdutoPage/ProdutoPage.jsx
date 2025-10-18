import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useLojaContext } from "../../../hooks/useLojaContext";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Chip,
  IconButton,
  Alert,
  Divider,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Badge,
  Tooltip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";
import "./ProdutoPage.css";

const ProdutoPage = (props) => {
  const { produtoSlug, slug } = useParams();
  const isPacoteRoute = window.location.pathname.includes('/pacote/') || window.location.pathname.includes('/pacote:');
  const navigate = useNavigate();
  const { lojaId, lojaData, loading: lojaLoading } = useLojaContext(props.lojaId, props.lojaData);
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [expandedAccordion, setExpandedAccordion] = useState('description');
  const placeholderLarge = "https://placehold.co/600x600/eef1f5/777?text=Imagem+Indisponível";
  const placeholderThumb = "https://placehold.co/100x100/eef1f5/777?text=Img";

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 'R$ 0,00';
    }
    return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
  };

  useEffect(() => {
    if (!lojaId || !produtoSlug) return;
    setLoading(true);
    setError(null);
    async function fetchProduto() {
      try {
        const produtosRef = collection(db, `lojas/${lojaId}/produtos`);
        const q = query(produtosRef, where("slug", "==", produtoSlug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setProduto({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setError("Pacote não encontrado.");
        }
      } catch (err) {
        setError("Erro ao buscar pacote.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduto();
  }, [lojaId, produtoSlug]);

  useEffect(() => {
    if (produto) {
      // Inicializa variantes selecionadas de forma robusta
      let variantsArray = [];
      // Caso 1: Variantes como array (estrutura correta)
      if (Array.isArray(produto.variants)) {
        variantsArray = produto.variants;
      }
      // Caso 2: Variantes como objeto (estrutura antiga - compatibilidade)
      else if (produto.variants && typeof produto.variants === 'object') {
        // Converte o objeto de variantes para array
        variantsArray = [{
          name: produto.variants.name || "Tamanho",
          options: Array.isArray(produto.variants.options) ? produto.variants.options : [],
          default: produto.variants.default,
          required: produto.variants.required !== false
        }];
      }
      const initialVariants = {};
      variantsArray.forEach(variant => {
        if (variant && variant.options && variant.options.length > 0) {
          // Seleciona a opção padrão ou a primeira opção disponível
          initialVariants[variant.name || "Tamanho"] = variant.default || variant.options[0];
        }
      });
      setSelectedVariants(initialVariants);
      // Reset imagem selecionada
      setSelectedImage(0);
    }
  }, [produto]);

  const handleVariantChange = (variantName, value) => {
    setSelectedVariants(prev => ({ ...prev, [variantName]: value }));
  };

  const handleReserveNow = () => {
    if (!produto || !lojaData) {
      showSnackbar("Erro ao processar reserva. Tente novamente.");
      return;
    }
    
    // Verifica se todas as variantes obrigatórias foram selecionadas
    let variantsToCheck = [];
    if (Array.isArray(produto.variants)) {
      variantsToCheck = produto.variants;
    } else if (produto.variants && typeof produto.variants === 'object') {
      variantsToCheck = [{
        name: produto.variants.name || "Tamanho",
        options: Array.isArray(produto.variants.options) ? produto.variants.options : [],
        required: produto.variants.required !== false
      }];
    }
    
    for (const variant of variantsToCheck) {
      if (typeof variant === 'object' && variant.required) {
        const variantName = variant.name || "Tamanho";
        if (!selectedVariants[variantName]) {
          showSnackbar(`Por favor, selecione uma opção para ${variantName}`);
          return;
        }
      }
    }
    
    // Redireciona para a página de reserva com os dados do produto
    navigate(`${slug ? `/${slug}` : ''}/reserva/${produto.id}`, {
      state: {
        produto: {
          ...produto,
          selectedVariants,
          mainImageUrl: imagesArray[selectedImage] || placeholderLarge,
          currentPrice: getCurrentPricePerUnit()
        },
        loja: lojaData
      }
    });
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: produto?.name || "Confira este produto!",
        text: `Olha este produto que encontrei na loja ${lojaData?.nome || ''}: ${produto?.name || ''}`,
        url: window.location.href,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showSnackbar('Link copiado para a área de transferência!');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      showSnackbar('Não foi possível compartilhar o produto.');
    }
  };

  const getDiscountPercent = () => {
    if (produto && produto.anchorPrice && produto.price) {
      const anchor = Number(produto.anchorPrice);
      const current = Number(produto.price);
      if (anchor > current && anchor > 0) {
        return Math.round(((anchor - current) / anchor) * 100);
      }
    }
    return 0;
  };

  const getCurrentPricePerUnit = () => {
    let pricePerUnit = Number(produto?.price) || 0;
    if (produto?.priceConditions && Array.isArray(produto.priceConditions)) {
      // Ordena as condições por quantidade (maior primeiro)
      const sortedConditions = [...produto.priceConditions].sort((a, b) => b.quantity - a.quantity);
      for (const condition of sortedConditions) {
        if (1 >= condition.quantity) { // Considera quantidade mínima para reserva
          pricePerUnit = Number(condition.pricePerUnit);
          break;
        }
      }
    }
    return pricePerUnit;
  };

  // Dados calculados
  const discountPercent = getDiscountPercent();
  const imagesArray = Array.isArray(produto?.images) ? produto.images : [];
  const safeSelectedImage = Math.max(0, Math.min(selectedImage, imagesArray.length - 1));
  const mainImageUrl = imagesArray[safeSelectedImage] || placeholderLarge;
  const currentPrice = getCurrentPricePerUnit();

  if (lojaLoading || loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'70vh'}}><div className="spinner" style={{width:60,height:60,border:'6px solid #eee',borderTop:'6px solid #1976d2',borderRadius:'50%',animation:'spin 1s linear infinite'}} /><style>{`@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style></div>;
  if (error) return <div style={{textAlign:'center',marginTop:80,color:'red'}}><h2>{error}</h2></div>;
  if (!produto || !lojaId || !lojaData) return <div style={{textAlign:'center',marginTop:80}}><h2>Pacote ou loja não encontrado.</h2></div>;

  // Mostra os dados crus do Firestore acima do layout detalhado
  // (mantém toda a lógica e estrutura atual)
  return (
    <>
      <Container maxWidth="lg" className="produto-page-container">
        {/* <Box sx={{ background: '#f8f9fa', borderRadius: 2, p: 2, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#888' }}>Conteúdo bruto do Firestore:</Typography>
          <pre style={{fontSize:12,overflowX:'auto',margin:0}}>{JSON.stringify(produto, null, 2)}</pre>
        </Box> */}
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')} // Volta para home
          sx={{ mb: 3, textTransform: 'none' }}
        >
          Voltar para {lojaData.nome}
        </Button>
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: '16px' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 5 } }}>
            {/* Galeria de Imagens */}
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Box className="image-gallery">
                <Box className="main-image-container" mb={1.5}>
                  <img
                    src={mainImageUrl}
                    alt={produto.name}
                    className="main-product-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholderLarge;
                    }}
                  />
                  {discountPercent > 0 && (
                    <Chip label={`${discountPercent}% OFF`} color="error" className="discount-badge" />
                  )}
                </Box>
                {imagesArray.length > 1 && (
                  <Box className="thumbnail-container">
                    {imagesArray.map((imgUrl, index) => (
                      <Box key={index} sx={{ width: 'calc(25% - 6px)' }}>
                        <img
                          src={imgUrl || placeholderThumb}
                          alt={`Miniatura ${index + 1}`}
                          className={`thumbnail-image ${safeSelectedImage === index ? "selected" : ""}`}
                          onClick={() => setSelectedImage(index)}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = placeholderThumb;
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
            {/* Detalhes do Pacote/Produto */}
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Box className="product-details">
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                  {isPacoteRoute ? 'Pacote: ' : ''}{produto.name}
                </Typography>
                {/* Preço e Desconto */}
                <Box mb={2.5}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(currentPrice)}
                  </Typography>
                  {produto.anchorPrice && (
                    <Typography variant="h6" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                      {formatCurrency(produto.anchorPrice)}
                    </Typography>
                  )}
                  {discountPercent > 0 && (
                    <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                      {discountPercent}% de desconto
                    </Typography>
                  )}
                </Box>
                {/* Condições de Preço */}
                {produto.priceConditions && produto.priceConditions.length > 0 && (
                  <Box mb={3} sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1 }}> 
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      <LocalOfferIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Descontos progressivos:
                    </Typography>
                    <List dense sx={{ py: 0 }}>
                      {produto.priceConditions
                        .sort((a, b) => b.quantity - a.quantity)
                        .map((condition, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5, px: 1 }}>
                            <ListItemText
                              primary={`Leve ${condition.quantity} un. por ${formatCurrency(condition.pricePerUnit)} cada`}
                              secondary={`Economize ${Math.round((produto.price - condition.pricePerUnit) / produto.price * 100)}%`}
                              secondaryTypographyProps={{ color: 'success.main' }}
                            />
                          </ListItem>
                        ))}
                    </List>
                  </Box>
                )}
                {/* Variantes do Pacote/Produto */}
                {(Array.isArray(produto.variants) || (produto.variants && typeof produto.variants === 'object')) && (
                  <Box mb={3}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Opções disponíveis:
                    </Typography>
                    {/* Converter para array se for objeto (estrutura antiga) */}
                    {(() => {
                      let variantsToRender = [];
                      if (Array.isArray(produto.variants)) {
                        variantsToRender = produto.variants;
                      } else if (produto.variants && typeof produto.variants === 'object') {
                        variantsToRender = [{
                          name: produto.variants.name || "Tamanho",
                          options: Array.isArray(produto.variants.options) ? produto.variants.options : [],
                          default: produto.variants.default,
                          required: produto.variants.required !== false
                        }];
                      }
                      return variantsToRender.map((variant, index) => {
                        // Variante simples (apenas texto)
                        if (typeof variant === 'string') {
                          return <Chip label={variant} key={index} sx={{ mr: 1, mb: 1 }} />;
                        }
                        // Variante com opções selecionáveis
                        if (!variant.options || !Array.isArray(variant.options) || variant.options.length === 0) {
                          return null; // Ignora variantes inválidas
                        }
                        return (
                          <Box key={variant.name || `variant-${index}`} sx={{ mb: 2 }}>
                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                              {variant.name || "Tamanho"}:
                              {variant.required && (
                                <Typography component="span" color="error.main" sx={{ ml: 1 }}>
                                  *
                                </Typography>
                              )}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {variant.options.map((option) => {
                                const variantName = variant.name || "Tamanho";
                                const isSelected = selectedVariants[variantName] === option;
                                return (
                                  <Button
                                    key={option}
                                    variant={isSelected ? 'contained' : 'outlined'}
                                    onClick={() => handleVariantChange(variantName, option)}
                                    sx={{
                                      textTransform: 'none',
                                      minWidth: 'auto',
                                      borderRadius: '8px',
                                      border: isSelected ? '2px solid' : '1px solid',
                                      borderColor: isSelected ? 'primary.main' : 'divider',
                                      backgroundColor: isSelected ? 'primary.light' : 'background.paper',
                                      color: isSelected ? 'primary.contrastText' : 'text.primary',
                                      '&:hover': {
                                        backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                                      }
                                    }}
                                  >
                                    {option}
                                  </Button>
                                );
                              })}
                            </Box>
                          </Box>
                        );
                      });
                    })()}
                  </Box>
                )}
                {/* Botões de Ação */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleReserveNow}
                    fullWidth
                    sx={{ py: 1.5, borderRadius: '8px' }}
                  >
                    Reservar Agora
                  </Button>
                  <Tooltip title="Compartilhar">
                    <IconButton
                      onClick={handleShare}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '8px'
                      }}
                    >
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Box>
          {/* Seções de Informações */}
          <Box mt={5}>
            <Divider sx={{ mb: 3 }} />
            {/* Descrição */}
            <Accordion
              expanded={expandedAccordion === 'description'}
              onChange={handleAccordionChange('description')}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important',
                mb: 2
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{isPacoteRoute ? 'Descrição do Pacote' : 'Descrição do Produto'}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {produto.description ? (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {produto.description}
                  </Typography>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    Nenhuma descrição disponível para este {isPacoteRoute ? 'pacote' : 'produto'}.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
            {/* Especificações */}
            {produto.specifications && Object.keys(produto.specifications).length > 0 && (
              <Accordion
                expanded={expandedAccordion === 'specs'}
                onChange={handleAccordionChange('specs')}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px !important',
                  mb: 2
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{isPacoteRoute ? 'Especificações do Pacote' : 'Especificações'}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {Object.entries(produto.specifications).map(([key, value]) => (
                      <ListItem key={key} sx={{ py: 0.5 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={4} sm={3}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {key}:
                            </Typography>
                          </Grid>
                          <Grid item xs={8} sm={9}>
                            <Typography variant="body2">
                              {Array.isArray(value) ? value.join(', ') : value}
                            </Typography>
                          </Grid>
                        </Grid>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </Paper>
      </Container>
      <Footer nomeLoja={lojaData.nome} footerData={lojaData.footer || {}} />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default ProdutoPage;