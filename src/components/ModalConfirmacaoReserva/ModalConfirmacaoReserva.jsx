import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Receipt,
  Person,
  Email,
  Phone
} from '@mui/icons-material';

const ModalConfirmacaoReserva = ({ 
  open, 
  onClose, 
  reservaData, 
  paymentData, 
  onVerMinhasReservas, 
  mensagemSucesso
}) => {
  // Log de entrada e dados recebidos
  console.debug('[ModalConfirmacaoReserva] Render', { open, reservaData, paymentData, mensagemSucesso });
  // Fallback seguro: se algum campo vier como objeto, converte para string
  if (!reservaData || !paymentData) {
    console.error('[ModalConfirmacaoReserva] Dados insuficientes para renderizar', { reservaData, paymentData });
    return null;
  }
  // Log detalhado para debug
  if (typeof paymentData.id === 'object' || typeof paymentData.transaction_amount === 'object') {
    console.error('[ModalConfirmacaoReserva] paymentData contém objeto inesperado', paymentData);
  }
  // Fallback para campos que podem ser objeto
  const safePaymentId = typeof paymentData.id === 'object' ? JSON.stringify(paymentData.id) : paymentData.id;
  const safeTransactionAmount = typeof paymentData.transaction_amount === 'object' ? JSON.stringify(paymentData.transaction_amount) : paymentData.transaction_amount;
  const safePaymentType = typeof paymentData.payment_type_id === 'object' ? JSON.stringify(paymentData.payment_type_id) : paymentData.payment_type_id;

  const formatarData = (data) => {
    if (!data) return '';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      console.error('[ModalConfirmacaoReserva] Erro ao formatar data', data);
      return data;
    }
  };

  const formatarValor = (valor) => {
    if (!valor) return 'R$ 0,00';
    try {
      return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
    } catch {
      console.error('[ModalConfirmacaoReserva] Erro ao formatar valor', valor);
      return valor;
    }
  };

  // Log de clique nos botões principais
  const handleClose = () => {
    console.debug('[ModalConfirmacaoReserva] Fechar modal');
    if (onClose) onClose();
  };
  const handleVerMinhasReservas = () => {
    console.debug('[ModalConfirmacaoReserva] Ver Minhas Reservas');
    if (onVerMinhasReservas) onVerMinhasReservas();
  };

  return (
      <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      {mensagemSucesso && (
        <Box sx={{
          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
          color: 'white',
          textAlign: 'center',
          py: 2,
          px: 2
        }}>
          <Typography variant="h6" fontWeight="bold">
            {mensagemSucesso}
          </Typography>
        </Box>
      )}
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)', 
        color: 'white',
        textAlign: 'center',
        py: 3
      }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
          <CheckCircle sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Pagamento Aprovado!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Sua reserva foi confirmada com sucesso
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {/* Informações do Pagamento */}
        <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Receipt color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Detalhes do Pagamento
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  ID do Pagamento
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {safePaymentId || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip 
                  label="Aprovado" 
                  color="success" 
                  size="small" 
                  sx={{ fontWeight: 'bold' }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Valor Pago
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="success.main">
                  {formatarValor(safeTransactionAmount)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Método de Pagamento
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {safePaymentType === 'pix' ? 'PIX' : 'Cartão de Crédito'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Informações da Reserva */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              📋 Detalhes da Reserva
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Pacote
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {reservaData.pacoteTitulo || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Data da Ida
                </Typography>
                <Typography variant="body1">
                  {formatarData(reservaData.dataIda)} às {reservaData.horaIda}
                </Typography>
              </Grid>
              
              {reservaData.dataVolta && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Data da Volta
                  </Typography>
                  <Typography variant="body1">
                    {formatarData(reservaData.dataVolta)} às {reservaData.horaVolta}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Passageiros
                </Typography>
                <Typography variant="body1">
                  {reservaData.passageirosFormatado || `${reservaData.totalPassageiros} passageiro(s)`}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Valor Total da Viagem
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatarValor(reservaData.valorTotal)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Informações do Cliente */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Person color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Dados do Cliente
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Person fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nome
                    </Typography>
                    <Typography variant="body1">
                      {reservaData.clienteNome || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Email fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {reservaData.clienteEmail || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Telefone
                    </Typography>
                    <Typography variant="body1">
                      {reservaData.clienteTelefone || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Aviso importante */}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          bgcolor: 'info.light', 
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'info.main'
        }}>
          <Typography variant="body2" color="info.dark" textAlign="center">
            <strong>📱 Importante:</strong> Você receberá um comprovante por email e pode acompanhar sua reserva na área do cliente.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          size="large"
          sx={{ px: 4 }}
        >
          Fechar
        </Button>
        {onVerMinhasReservas && (
          <Button 
            onClick={handleVerMinhasReservas}
            variant="contained"
            size="large"
            sx={{ 
              px: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Ver Minhas Reservas
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ModalConfirmacaoReserva;
