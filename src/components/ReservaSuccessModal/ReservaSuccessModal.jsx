import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  Button, 
  Typography, 
  Box,
  Fade
} from '@mui/material';
import { FiCheckCircle, FiClock, FiArrowRight } from 'react-icons/fi';
import './ReservaSuccessModal.css';

const ReservaSuccessModal = ({ open, onClose, onViewReservas }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'reserva-success-dialog'
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box className="reserva-success-container">
          {/* Header com ícone de sucesso */}
          <Box className="reserva-success-header">
            <Fade in={open} timeout={800}>
              <Box className="success-icon-container">
                <FiCheckCircle className="success-icon" />
              </Box>
            </Fade>
            <Typography variant="h4" className="success-title">
              Reserva Confirmada!
            </Typography>
            <Typography variant="body1" className="success-subtitle">
              Sua solicitação foi recebida com sucesso
            </Typography>
          </Box>

          {/* Content com orientações */}
          <Box className="reserva-success-content">
            <Box className="orientation-card">
              <Box className="orientation-item">
                <FiClock className="orientation-icon" />
                <Box>
                  <Typography variant="h6" className="orientation-title">
                    Próximos Passos
                  </Typography>
                  <Typography variant="body2" className="orientation-text">
                    Em breve nossa equipe irá processar sua reserva e delegar para um dos nossos motoristas profissionais.
                  </Typography>
                </Box>
              </Box>

              <Box className="orientation-item">
                <FiArrowRight className="orientation-icon" />
                <Box>
                  <Typography variant="h6" className="orientation-title">
                    Acompanhamento
                  </Typography>
                  <Typography variant="body2" className="orientation-text">
                    Você receberá atualizações por email e pode acompanhar o status da sua reserva na área do usuário.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box className="info-note">
              <Typography variant="body2">
                💡 <strong>Dica:</strong> Mantenha seu WhatsApp ativo para receber notificações importantes sobre sua viagem.
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Box className="reserva-success-actions">
            <Button 
              variant="outlined" 
              onClick={onClose}
              className="btn-secondary"
            >
              Fechar
            </Button>
            <Button 
              variant="contained" 
              onClick={onViewReservas}
              className="btn-primary"
              startIcon={<FiArrowRight />}
            >
              Ver Minhas Reservas
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ReservaSuccessModal;
