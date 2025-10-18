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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Skeleton,
  Alert,
  Snackbar,
  Fade
} from '@mui/material';
import {
  Star,
  StarBorder,
  Add,
  Close,
  ThumbUp,
  Verified,
  FormatQuote,
  ChevronRight,
  RateReview
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { avaliacoesService } from '../../services/avaliacoesService';
import './AvaliacoesSection.css';

const AvaliacoesSection = () => {
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Mostrar apenas 3 avaliações inicialmente
  const AVALIACOES_VISIVEIS = 3;

  // Função para validar se o nome é um nome de pessoa real
  const validarNomePessoa = (nome) => {
    const nomeMinusculo = nome.toLowerCase().trim();
    
    // Lista de palavras/padrões inválidos
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

    // Verifica se contém palavras inválidas
    for (const palavra of palavrasInvalidas) {
      if (nomeMinusculo.includes(palavra)) {
        return false;
      }
    }

    // Verifica se tem pelo menos um nome e sobrenome
    const partes = nome.trim().split(' ').filter(parte => parte.length > 0);
    if (partes.length < 2) {
      return false;
    }

    // Verifica se cada parte tem pelo menos 2 caracteres
    for (const parte of partes) {
      if (parte.length < 2) {
        return false;
      }
    }

    // Verifica se contém apenas letras e espaços (permitindo acentos)
    const regexNome = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!regexNome.test(nome)) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    loadAvaliacoes();
    loadEstatisticas();

    // Subscribe to real-time updates for statistics
    let unsubStats = null;
    try {
      unsubStats = avaliacoesService.subscribeAvaliacoes({ limit: 10, orderBy: 'createdAt', direction: 'desc' }, ({ avaliacoes: items, total }) => {
        try {
          if (!items) return;
          const distribuicao = items.reduce((acc, a) => {
            const nota = Math.round(a.nota) || 0;
            acc[nota] = (acc[nota] || 0) + 1;
            return acc;
          }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

          const soma = items.reduce((s, a) => s + (a.nota || 0), 0);
          const media = items.length ? Math.round((soma / items.length) * 10) / 10 : 0;
          setEstatisticas({ media, total: total || items.length, distribuicao });
        } catch (e) {
          console.error('Erro ao atualizar estatisticas via subscribe:', e);
        }
      });
    } catch (err) {
      console.warn('Não foi possível iniciar subscribeAvaliacoes para estatísticas, mantendo fallback:', err);
    }

    return () => {
      if (typeof unsubStats === 'function') unsubStats();
    };
  }, []);

  const loadAvaliacoes = async () => {
    try {
      setLoading(true);
      // Buscar primeiro as avaliações de 5 estrelas para destaque
      console.debug('AvaliacoesSection: carregando avaliacoes...', { limit: AVALIACOES_VISIVEIS });
      const response = await avaliacoesService.getAvaliacoes({ 
        limit: AVALIACOES_VISIVEIS, 
        orderBy: 'nota',
        direction: 'desc' 
      });
      setAvaliacoes(response.avaliacoes);
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

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleVerMais = () => {
    navigate('/avaliacoes');
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

    // Validar se o nome é de uma pessoa real
    if (!validarNomePessoa(novaAvaliacao.nomeUsuario)) {
      setSnackbar({
        open: true,
        message: 'Por favor, digite um nome real (nome e sobrenome). Evite apelidos, palavrões ou nomes falsos.',
        severity: 'warning'
      });
      return;
    }

    // Abrir modal de confirmação
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true);
      await avaliacoesService.criarAvaliacao({
        nota: novaAvaliacao.nota,
        comentario: novaAvaliacao.comentario,
        nomeUsuario: novaAvaliacao.nomeUsuario,
        userId: null, // Sem autenticação
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
                {(() => {
                  const ts = avaliacao.createdAt;
                  try {
                    if (!ts) return '';
                    // Firestore Timestamp
                    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString('pt-BR');
                    // JS Date
                    if (ts instanceof Date) return ts.toLocaleDateString('pt-BR');
                    // ISO string
                    if (typeof ts === 'string') return new Date(ts).toLocaleDateString('pt-BR');
                    // Fallback: try Number
                    if (typeof ts === 'number') return new Date(ts).toLocaleDateString('pt-BR');
                    return '';
                  } catch (e) {
                    return '';
                  }
                })()}
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
    <section className="avaliacoes-section">
      <div className="container">
        {/* Header da Seção */}
        <div className="section-header">
          <Typography variant="h2" className="section-title">
            O que nossos clientes dizem
          </Typography>
          <Typography variant="subtitle1" className="section-subtitle">
            Experiências reais de quem já viveu essa aventura única
          </Typography>
        </div>

        {/* Estatísticas de Avaliação */}
        <div className="stats-container">
          <div className="stats-grid">
            <div className="rating-overview">
              <Typography variant="h3" className="rating-number">
                {estatisticas.media.toFixed(1)}
              </Typography>
              <div className="rating-stars">
                {renderEstrelas(estatisticas.media)}
              </div>
              <Typography variant="body2" className="rating-count">
                Baseado em {estatisticas.total} avaliações
              </Typography>
            </div>
            <div className="cta-section">
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={handleOpenModal}
                className="cta-button"
              >
                Deixar Avaliação
              </Button>
            </div>
          </div>
        </div>

        {/* Observação: os comentários/avaliacoes agora aparecem na seção de preview abaixo. */}

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
              <Typography variant="h5">Deixe sua Avaliação</Typography>
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
                placeholder="Digite seu nome"
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
          PaperProps={{
            style: {
              borderRadius: '12px',
              padding: '8px'
            }
          }}
        >
          <DialogTitle>
            <Box className="modal-header">
              <Typography variant="h6">
                Confirmar Avaliação
              </Typography>
              <IconButton
                onClick={() => setConfirmModalOpen(false)}
                size="small"
              >
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
      </div>
    </section>
  );
};

export default AvaliacoesSection;