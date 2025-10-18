// src/components/ViagemConverter/ViagemConverter.jsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  TextField,
  Grid
} from '@mui/material';
import { converterReservaParaViagem } from '../../utils/firestoreUtils';

/**
 * Componente para converter reservas em viagens
 */
const ViagemConverter = ({ reserva, open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({
    isIdaEVolta: false,
    porcentagemSinal: 40,
    dataVolta: '',
    horaVolta: ''
  });

  const handleConverter = async () => {
    setLoading(true);
    setError('');

    try {
      // Prepara dados da reserva com configurações extras
      const dadosCompletos = {
        ...reserva,
        isIdaEVolta: config.isIdaEVolta,
        porcentagemSinal: config.porcentagemSinal,
        dataVolta: config.isIdaEVolta ? config.dataVolta : null,
        horaVolta: config.isIdaEVolta ? config.horaVolta : null
      };

      const resultado = await converterReservaParaViagem(reserva.id, dadosCompletos);

      if (resultado.success) {
        onSuccess && onSuccess(resultado);
        onClose();
      } else {
        setError(resultado.error || 'Erro ao converter reserva');
      }
    } catch (err) {
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!reserva) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        🚗 Converter Reserva em Viagem
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Dados da Reserva
          </Typography>
          <Box sx={{ pl: 2, borderLeft: '3px solid #primary.main' }}>
            <Typography><strong>Cliente:</strong> {reserva.clienteNome || reserva.nome}</Typography>
            <Typography><strong>Data:</strong> {reserva.data || reserva.dataReserva}</Typography>
            <Typography><strong>Destino:</strong> {reserva.enderecoDestino || reserva.destino}</Typography>
            <Typography><strong>Valor:</strong> R$ {reserva.valor || reserva.preco}</Typography>
          </Box>
        </Box>

        <Typography variant="h6" color="primary" gutterBottom>
          Configurações da Viagem
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.isIdaEVolta}
                  onChange={(e) => handleConfigChange('isIdaEVolta', e.target.checked)}
                />
              }
              label="Viagem de ida e volta"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Porcentagem do Sinal (%)"
              type="number"
              value={config.porcentagemSinal}
              onChange={(e) => handleConfigChange('porcentagemSinal', Number(e.target.value))}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>

          {config.isIdaEVolta && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data da Volta"
                  type="date"
                  value={config.dataVolta}
                  onChange={(e) => handleConfigChange('dataVolta', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Hora da Volta"
                  type="time"
                  value={config.horaVolta}
                  onChange={(e) => handleConfigChange('horaVolta', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            💡 <strong>Resultado da Conversão:</strong>
            <br />
            • Uma nova viagem será criada no sistema
            <br />
            • Sinal calculado: R$ {((reserva.valor || reserva.preco || 0) * config.porcentagemSinal / 100).toFixed(2)}
            <br />
            • Restante: R$ {((reserva.valor || reserva.preco || 0) * (100 - config.porcentagemSinal) / 100).toFixed(2)}
            <br />
            • A reserva original será mantida como referência
          </Alert>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleConverter}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Convertendo...' : 'Converter em Viagem'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViagemConverter;
