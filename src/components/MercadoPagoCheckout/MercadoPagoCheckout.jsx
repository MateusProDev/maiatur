// src/components/MercadoPagoCheckout/MercadoPagoCheckout.jsx
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

const MercadoPagoCheckout = ({ 
  preferenceId, 
  onSuccess, 
  onError, 
  onPending,
  metodoPagamento,
  valor,
  open,
  onClose 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Inicializar Mercado Pago
    if (process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY) {
      initMercadoPago(process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY, {
        locale: 'pt-BR'
      });
      setLoading(false);
    } else {
      setError('Chave pública do Mercado Pago não configurada');
      setLoading(false);
    }
  }, []);

  const customization = {
    texts: {
      valueProp: 'smart_option',
    },
    visual: {
      buttonBackground: metodoPagamento === 'pix' ? 'black' : 'blue',
      borderRadius: '8px',
    },
    paymentMethods: {
      creditCard: metodoPagamento === 'cartao' ? 'all' : 'off',
      debitCard: metodoPagamento === 'cartao' ? 'all' : 'off', 
      pix: metodoPagamento === 'pix' ? 'all' : 'off',
      ticket: 'off',
      bankTransfer: 'off',
      wallet_purchase: 'off'
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Carregando checkout...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Erro no Pagamento</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            {error}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: metodoPagamento === 'pix' 
          ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white',
        textAlign: 'center'
      }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            borderRadius: '50%', 
            p: 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.5rem'
          }}>
            {metodoPagamento === 'pix' ? '📱' : '💳'}
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {metodoPagamento === 'pix' ? 'Pagamento PIX' : 'Pagamento Cartão'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              R$ {valor?.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, minHeight: '400px' }}>
        {preferenceId ? (
          <Box sx={{ width: '100%' }}>
            <Wallet
              initialization={{
                preferenceId: preferenceId,
                redirectMode: 'modal'
              }}
              customization={customization}
              onSubmit={async (param) => {
                console.log('💳 Pagamento enviado:', param);
                // Aqui podemos capturar dados do pagamento se necessário
              }}
              onReady={() => {
                console.log('✅ Checkout Mercado Pago pronto');
              }}
              onError={(error) => {
                console.error('❌ Erro no checkout:', error);
                if (onError) onError(error);
              }}
            />
          </Box>
        ) : (
          <Alert severity="warning">
            ID da preferência não fornecido
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            px: 4
          }}
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MercadoPagoCheckout;
