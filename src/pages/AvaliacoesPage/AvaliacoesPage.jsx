import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Rating,
  Avatar,
  Grid,
  Container,
  IconButton,
  Skeleton,
  Fade,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Star,
  StarBorder,
  Search,
  FilterList,
  Sort,
  ThumbUp,
  Verified,
  FormatQuote,
  ArrowBack,
  RateReview,
  TrendingUp,
  People,
  EmojiEvents,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { avaliacoesService } from '../../services/avaliacoesService';
import './AvaliacoesPage.css';

const AvaliacoesPage = () => {
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({
    busca: '',
    nota: '',
    ordenacao: 'recente'
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [novaAvaliacao, setNovaAvaliacao] = useState({
    nota: 5,
    comentario: '',
    nomeUsuario: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [estatisticas, setEstatisticas] = useState({
    media: 0,
    total: 0,
    distribuicao: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  const ITEMS_PER_PAGE = 9;

  // Função para validar se o nome é um nome de pessoa real
  const validarNomePessoa = (nome) => {
    const nomeMinusculo = nome.toLowerCase().trim();
    
    const palavrasInvalidas = [
      'usuario', 'user', 'admin', 'test', 'teste', 'exemplo',
      'pauzudo', 'pinto', 'pica', 'buceta', 'cu', 'merda', 'bosta',
      'fdp', 'porra', 'caralho', 'puta', 'viado', 'gay', 'penis',
      'vagina', 'sexo', 'fodase', 'foda-se', 'vai se fuder',
      'objeto', 'coisa', 'negocio', 'trem', 'bagulho',
      'anonimo', 'anonymous', 'desconhecido', 'fulano', 'ciclano',
      'beltrano', 'ninguem', 'alguem', 'qualquer', 'random',
      'bot', 'robot', 'fake', 'falso', 'inventado'
    ];

    for (const palavra of palavrasInvalidas) {
      if (nomeMinusculo.includes(palavra)) {
        return false;
      }
    }

    const partes = nome.trim().split(' ').filter(parte => parte.length > 0);
    if (partes.length < 2) {
      return false;
    }

    for (const parte of partes) {
      if (parte.length < 2) {
        return false;
      }
    }

    const regexNome = /^[a-zA-ZÀ-ÿ\\s]+$/;
    if (!regexNome.test(nome)) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    loadAvaliacoes();
    loadEstatisticas();
  }, [page, filtros]);

  const loadAvaliacoes = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const response = await avaliacoesService.getAvaliacoes({ 
        limit: ITEMS_PER_PAGE,
        offset,
        filtros 
      });
      setAvaliacoes(response.avaliacoes);
      setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async () => {
    try {
      const stats = await avaliacoesService.getEstatisticas();
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSubmitAvaliacao = async () => {
    if (!novaAvaliacao.comentario.trim() || !novaAvaliacao.nomeUsuario.trim()) {
      setSnackbar({
        open: true,
        message: 'Preencha todos os campos obrigatórios',
        severity: 'warning'
      });
      return;
    }

    if (!validarNomePessoa(novaAvaliacao.nomeUsuario)) {
      setSnackbar({
        open: true,
        message: 'Por favor, digite um nome real (nome e sobrenome). Evite apelidos, palavrões ou nomes falsos.',
        severity: 'warning'
      });
      return;
    }

    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true);
      await avaliacoesService.criarAvaliacao({
        nota: novaAvaliacao.nota,
        comentario: novaAvaliacao.comentario,
        nomeUsuario: novaAvaliacao.nomeUsuario,
        userId: null,
        emailUsuario: null,
        avatarUsuario: null
      });

      setSnackbar({
        open: true,
        message: 'Avaliação enviada com sucesso!',
        severity: 'success'
      });

      setModalOpen(false);
      setConfirmModalOpen(false);
      setNovaAvaliacao({
        nota: 5,
        comentario: '',
        nomeUsuario: ''
      });

      loadAvaliacoes();
      loadEstatisticas();
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao enviar avaliação',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPage(1);
  };

  const renderEstrelas = (nota) => {
    return (
      <Rating
        value={nota}
        readOnly
        precision={0.5}
        icon={<Star sx={{ color: '#FFD700' }} />}
        emptyIcon={<StarBorder sx={{ color: '#E0E0E0' }} />}
      />
    );
  };

  const renderAvaliacaoCard = (avaliacao) => (
    <Card key={avaliacao.id} className="avaliacao-card" elevation={2}>
      <CardContent>
        <Box className="avaliacao-header">
          <Box className="usuario-info">
            <Avatar
              src={avaliacao.avatarUsuario}
              alt={avaliacao.nomeUsuario}
              className="usuario-avatar"
            >
              {avaliacao.nomeUsuario?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" className="usuario-nome">
                {avaliacao.nomeUsuario}
                {avaliacao.verificado && (
                  <Verified className="icone-verificado" />
                )}
              </Typography>
              <Typography variant="caption" className="data-avaliacao">
                {new Date(avaliacao.createdAt?.seconds * 1000).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Box>
          {renderEstrelas(avaliacao.nota)}
        </Box>

        <Box className="avaliacao-comentario">
          <FormatQuote className="aspas-icone" />
          <Typography variant="body1">
            {avaliacao.comentario}
          </Typography>
        </Box>

        <Box className="avaliacao-actions">
          <Button
            size="small"
            startIcon={<ThumbUp />}
            className="btn-util"
          >
            Útil ({avaliacao.likes || 0})
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box className="avaliacoes-page">
      {/* Hero Section */}
      <Box className="hero-section">
        <Container maxWidth="lg">
          <Box className="hero-content">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              className="btn-voltar"
            >
              Voltar ao Início
            </Button>
            
            <Typography variant="h1" className="page-title">
              Todas as Avaliações
            </Typography>
            
            <Typography variant="h6" className="page-subtitle">
              Descubra as experiências reais dos nossos visitantes
            </Typography>

            {/* Estatísticas */}
            <Box className="stats-grid">
              <Box className="stat-card">
                <EmojiEvents className="stat-icon" />
                <Typography variant="h3">{estatisticas.media.toFixed(1)}</Typography>
                <Typography variant="body2">Nota Média</Typography>
              </Box>
              <Box className="stat-card">
                <People className="stat-icon" />
                <Typography variant="h3">{estatisticas.total}</Typography>
                <Typography variant="body2">Avaliações</Typography>
              </Box>
              <Box className="stat-card">
                <TrendingUp className="stat-icon" />
                <Typography variant="h3">98%</Typography>
                <Typography variant="body2">Satisfação</Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Filtros e Controles */}
      <Container maxWidth="lg" className="main-content">
        <Box className="filtros-section">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar avaliações..."
                value={filtros.busca}
                onChange={(e) => handleFiltroChange('busca', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                className="campo-busca"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Nota</InputLabel>
                <Select
                  value={filtros.nota}
                  onChange={(e) => handleFiltroChange('nota', e.target.value)}
                  startAdornment={<FilterList />}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="5">5 estrelas</MenuItem>
                  <MenuItem value="4">4 estrelas</MenuItem>
                  <MenuItem value="3">3 estrelas</MenuItem>
                  <MenuItem value="2">2 estrelas</MenuItem>
                  <MenuItem value="1">1 estrela</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={filtros.ordenacao}
                  onChange={(e) => handleFiltroChange('ordenacao', e.target.value)}
                  startAdornment={<Sort />}
                >
                  <MenuItem value="recente">Mais recentes</MenuItem>
                  <MenuItem value="antiga">Mais antigas</MenuItem>
                  <MenuItem value="nota_alta">Maior nota</MenuItem>
                  <MenuItem value="nota_baixa">Menor nota</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<RateReview />}
                onClick={() => setModalOpen(true)}
                className="btn-avaliar"
              >
                Avaliar
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Grade de Avaliações */}
        <Box className="avaliacoes-container">
          {loading ? (
            <Grid container spacing={4}>
              {[...Array(9)].map((_, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card className="skeleton-card">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Skeleton variant="circular" width={56} height={56} />
                        <Box flex={1}>
                          <Skeleton variant="text" height={24} width="60%" />
                          <Skeleton variant="text" height={16} width="40%" />
                        </Box>
                        <Skeleton variant="rectangular" width={120} height={24} />
                      </Box>
                      <Skeleton variant="rectangular" height={100} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={4}>
              {avaliacoes.map((avaliacao, index) => (
                <Grid item xs={12} md={6} lg={4} key={avaliacao.id}>
                  <Fade in={true} timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
                    <div>
                      {renderAvaliacaoCard(avaliacao)}
                    </div>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Paginação */}
          {!loading && totalPages > 1 && (
            <Box className="paginacao-container">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      </Container>

      {/* Modal de Nova Avaliação */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        className="modal-avaliacao"
      >
        <DialogTitle>
          <Box className="modal-header">
            <Typography variant="h5">Compartilhar Experiência</Typography>
            <IconButton onClick={() => setModalOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box className="form-avaliacao">
            <Box className="campo-nota">
              <Typography variant="subtitle1" gutterBottom>
                Sua avaliação geral *
              </Typography>
              <Rating
                value={novaAvaliacao.nota}
                onChange={(e, newValue) =>
                  setNovaAvaliacao(prev => ({ ...prev, nota: newValue }))
                }
                size="large"
                icon={<Star sx={{ color: '#FFD700' }} />}
                emptyIcon={<StarBorder sx={{ color: '#E0E0E0' }} />}
              />
            </Box>

            <TextField
              label="Seu nome *"
              value={novaAvaliacao.nomeUsuario}
              onChange={(e) =>
                setNovaAvaliacao(prev => ({ ...prev, nomeUsuario: e.target.value }))
              }
              fullWidth
              margin="normal"
              placeholder="Digite seu nome completo"
            />

            <TextField
              label="Seu comentário *"
              value={novaAvaliacao.comentario}
              onChange={(e) =>
                setNovaAvaliacao(prev => ({ ...prev, comentario: e.target.value }))
              }
              fullWidth
              multiline
              rows={4}
              margin="normal"
              placeholder="Conte sobre sua experiência..."
            />
          </Box>
        </DialogContent>
        <DialogActions className="modal-actions">
          <Button
            onClick={() => setModalOpen(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitAvaliacao}
            disabled={submitting}
            className="btn-enviar"
          >
            {submitting ? 'Processando...' : 'Avaliar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmação */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box className="modal-header">
            <Typography variant="h6">
              Confirmar Avaliação
            </Typography>
            <IconButton onClick={() => setConfirmModalOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Sua avaliação:
            </Typography>
            {renderEstrelas(novaAvaliacao.nota)}
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Nome:
            </Typography>
            <Typography variant="body1">
              {novaAvaliacao.nomeUsuario}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Comentário:
            </Typography>
            <Typography variant="body1" sx={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '8px',
              fontStyle: 'italic'
            }}>
              "{novaAvaliacao.comentario}"
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Deseja enviar esta avaliação ou fazer alterações?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmModalOpen(false)}
            disabled={submitting}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSubmit}
            disabled={submitting}
            sx={{ 
              backgroundColor: '#4CAF50',
              '&:hover': {
                backgroundColor: '#45a049'
              }
            }}
          >
            {submitting ? 'Enviando...' : 'Confirmar e Enviar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AvaliacoesPage;