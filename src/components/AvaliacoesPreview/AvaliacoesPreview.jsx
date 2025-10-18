import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Button, Rating, Fade } from '@mui/material';
import { ChevronRight, FormatQuote, Verified } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { avaliacoesService } from '../../services/avaliacoesService';
import './AvaliacoesPreview.css';

const AvaliacoesPreview = () => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsub = null;
    setLoading(true);
    try {
      unsub = avaliacoesService.subscribeAvaliacoes({ limit: 3, orderBy: 'nota', direction: 'desc' }, ({ avaliacoes: items, total, error }) => {
        if (error) {
          console.error('subscribeAvaliacoes error callback:', error);
          setError(error.message || 'Erro ao carregar avaliações');
          setLoading(false);
          return;
        }
        setAvaliacoes(items || []);
        setError(null);
        setLoading(false);
      });
    } catch (err) {
      console.error('Erro ao iniciar subscribeAvaliacoes, fallback para getAvaliacoes:', err);
      avaliacoesService.getAvaliacoes({ limit: 3, orderBy: 'nota', direction: 'desc' })
        .then((resp) => setAvaliacoes(resp.avaliacoes || []))
        .catch((e) => setError(e.message || 'Erro ao carregar avaliações'))
        .finally(() => setLoading(false));
    }

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const formatDate = (ts) => {
    try {
      if (!ts) return '';
      if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString('pt-BR');
      if (ts instanceof Date) return ts.toLocaleDateString('pt-BR');
      if (typeof ts === 'string') return new Date(ts).toLocaleDateString('pt-BR');
      if (typeof ts === 'number') return new Date(ts).toLocaleDateString('pt-BR');
      return '';
    } catch (e) {
      return '';
    }
  };

  return (
    <section className="avaliacoes-preview">
      <div className="container">
        {/* <div className="preview-header">
          <Typography variant="h4" className="preview-title">O que nossos clientes dizem</Typography>
          <Typography variant="body1" className="preview-subtitle">Experiências reais de quem já viveu essa aventura</Typography>
        </div> */}

        <div className="preview-cards">
          {loading ? (
            <Typography>Carregando avaliações...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : avaliacoes.length === 0 ? (
            <Typography>Nenhuma avaliação disponível ainda.</Typography>
          ) : (
            avaliacoes.map((a, idx) => (
              <Fade key={a.id} in timeout={400} style={{ transitionDelay: `${idx * 150}ms` }}>
                <Card className="preview-card">
                  <CardContent>
                    <div className="preview-card-header">
                      <Avatar src={a.avatarUsuario} className="preview-avatar">{a.nomeUsuario?.[0]?.toUpperCase()}</Avatar>
                      <div className="preview-meta">
                        <div className="preview-name">
                          <Typography variant="subtitle2">{a.nomeUsuario}</Typography>
                          {a.verificado && <Verified className="preview-verified" />}
                        </div>
                        <Typography variant="caption" className="preview-date">{formatDate(a.createdAt)}</Typography>
                      </div>
                      <Rating value={a.nota} readOnly precision={0.5} size="small" />
                    </div>

                    <div className="preview-comment">
                      <FormatQuote className="preview-quote" />
                      <Typography variant="body2">{a.comentario}</Typography>
                    </div>
                  </CardContent>
                </Card>
              </Fade>
            ))
          )}
        </div>

        <div className="preview-cta">
          <Button variant="contained" color="primary" endIcon={<ChevronRight />} onClick={() => navigate('/avaliacoes')}>Ver todas as avaliações</Button>
        </div>
      </div>
    </section>
  );
};

export default AvaliacoesPreview;
