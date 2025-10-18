// src/components/ViagemManager/ViagemManager.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  CheckCircle
} from '@mui/icons-material';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { ViagemStatus } from '../../models/viagemModel';

const ViagemManager = () => {
  const [viagens, setViagens] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedViagem, setSelectedViagem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar viagens
      const viagensSnapshot = await getDocs(collection(db, 'viagens'));
      const viagensData = viagensSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Buscar motoristas
      const motoristasSnapshot = await getDocs(collection(db, 'motoristas'));
      const motoristasData = motoristasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Buscar pacotes
      const pacotesSnapshot = await getDocs(collection(db, 'pacotes'));
      const pacotesData = pacotesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setViagens(viagensData);
      setMotoristas(motoristasData);
      setPacotes(pacotesData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      [ViagemStatus.RESERVADO]: 'info',
      [ViagemStatus.IDA_INICIADA]: 'warning',
      [ViagemStatus.IDA_FINALIZADA]: 'success',
      [ViagemStatus.VOLTA_INICIADA]: 'warning',
      [ViagemStatus.VOLTA_FINALIZADA]: 'success',
      [ViagemStatus.CANCELADO]: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      [ViagemStatus.RESERVADO]: 'Reservado',
      [ViagemStatus.IDA_INICIADA]: 'Ida em Andamento',
      [ViagemStatus.IDA_FINALIZADA]: 'Ida Finalizada',
      [ViagemStatus.VOLTA_INICIADA]: 'Volta em Andamento',
      [ViagemStatus.VOLTA_FINALIZADA]: 'Viagem Concluída',
      [ViagemStatus.CANCELADO]: 'Cancelado'
    };
    return texts[status] || status;
  };

  const updateViagemStatus = async (viagemId, newStatus, motoristaId = null) => {
    try {
      const updateData = { status: newStatus };
      
      if (newStatus === ViagemStatus.VOLTA_INICIADA && motoristaId) {
        updateData.motoristaVoltaId = motoristaId;
      }

      await updateDoc(doc(db, 'viagens', viagemId), updateData);
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const renderViagemCard = (viagem) => {
    const pacote = pacotes.find(p => p.id === viagem.pacoteId);
    const motoristaIda = motoristas.find(m => m.id === viagem.motoristaIdaId);
    const motoristaVolta = motoristas.find(m => m.id === viagem.motoristaVoltaId);

    return (
      <Card key={viagem.id} sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">{pacote?.titulo}</Typography>
              <Typography color="text.secondary">
                Cliente: {viagem.clienteNome}
              </Typography>
              <Typography variant="body2">
                📅 Ida: {viagem.dataIda} às {viagem.horaIda}
              </Typography>
              {viagem.isIdaEVolta && (
                <Typography variant="body2">
                  📅 Volta: {viagem.dataVolta} às {viagem.horaVolta}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Motoristas:</Typography>
              <Typography variant="body2">
                🚗 Ida: {motoristaIda?.nome || 'Não definido'}
              </Typography>
              {viagem.isIdaEVolta && (
                <Typography variant="body2">
                  🔄 Volta: {motoristaVolta?.nome || 'Não definido'}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Chip 
                label={getStatusText(viagem.status)}
                color={getStatusColor(viagem.status)}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2">
                💰 Total: R$ {viagem.valorTotal}
              </Typography>
              <Typography variant="body2">
                💳 Sinal: R$ {viagem.valorSinal} ({viagem.porcentagemSinal}%)
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {viagem.status === ViagemStatus.RESERVADO && (
              <Button
                size="small"
                variant="contained"
                startIcon={<FlightTakeoff />}
                onClick={() => updateViagemStatus(viagem.id, ViagemStatus.IDA_INICIADA)}
              >
                Iniciar Ida
              </Button>
            )}
            
            {viagem.status === ViagemStatus.IDA_INICIADA && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<CheckCircle />}
                onClick={() => updateViagemStatus(viagem.id, ViagemStatus.IDA_FINALIZADA)}
              >
                Finalizar Ida
              </Button>
            )}
            
            {viagem.status === ViagemStatus.IDA_FINALIZADA && viagem.isIdaEVolta && (
              <Button
                size="small"
                variant="contained"
                startIcon={<FlightLand />}
                onClick={() => {
                  setSelectedViagem(viagem);
                  setDialogOpen(true);
                }}
              >
                Definir Volta
              </Button>
            )}
            
            {viagem.status === ViagemStatus.VOLTA_INICIADA && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<CheckCircle />}
                onClick={() => updateViagemStatus(viagem.id, ViagemStatus.VOLTA_FINALIZADA)}
              >
                Finalizar Volta
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        🚍 Gerenciamento de Viagens
      </Typography>

      {loading ? (
        <Typography>Carregando...</Typography>
      ) : (
        <Box>
          {viagens.length === 0 ? (
            <Alert severity="info">
              Nenhuma viagem encontrada.
            </Alert>
          ) : (
            viagens.map(renderViagemCard)
          )}
        </Box>
      )}

      {/* Dialog para definir motorista da volta */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Definir Motorista para a Volta</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Motorista da Volta</InputLabel>
            <Select
              value=""
              label="Motorista da Volta"
              onChange={(e) => {
                updateViagemStatus(
                  selectedViagem?.id,
                  ViagemStatus.VOLTA_INICIADA,
                  e.target.value
                );
                setDialogOpen(false);
              }}
            >
              {motoristas.map(motorista => (
                <MenuItem key={motorista.id} value={motorista.id}>
                  {motorista.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Alert severity="info" sx={{ mt: 2 }}>
            Pode ser o mesmo motorista da ida ou um diferente.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViagemManager;
