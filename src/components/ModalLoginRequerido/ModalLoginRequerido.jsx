// src/components/ModalLoginRequerido/ModalLoginRequerido.jsx
import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Login,
  AccountCircle,
  Close
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const ModalLoginRequerido = ({ 
  open, 
  onClose, 
  onLoginSuccess,
  title = "Login Necessário",
  subtitle = "Para fazer uma reserva, precisamos dos seus dados",
  showCloseButton = false,
  isAreaCliente = false 
}) => {
  const { loginOrCreateUser, loading: authLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substr(0, 14);
  };

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2')
      .substr(0, 15);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: ''
    });
    setError('');
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      // Validações
      if (!formData.nome.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!formData.email.trim()) {
        throw new Error('Email é obrigatório');
      }
      if (!formData.telefone.trim()) {
        throw new Error('Telefone é obrigatório');
      }
      if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, '').length !== 11) {
        throw new Error('CPF deve ter 11 dígitos');
      }

      // Fazer login/cadastro
      const usuario = await loginOrCreateUser({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone.replace(/\D/g, ''),
        cpf: formData.cpf.replace(/\D/g, '')
      });

      console.log('✅ Login/cadastro realizado com sucesso:', usuario.uid);
      
      // Resetar formulário
      resetForm();
      
      // Chamar callback de sucesso
      if (onLoginSuccess) {
        onLoginSuccess(usuario, formData);
      }

      // Fechar modal apenas se não for área do cliente ou se tiver callback
      if (!isAreaCliente || onLoginSuccess) {
        onClose();
      }

    } catch (error) {
      console.error('❌ Erro no login/cadastro:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={showCloseButton ? handleClose : undefined}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          {showCloseButton && (
            <Box sx={{ alignSelf: 'flex-end' }}>
              <Button
                onClick={handleClose}
                sx={{ 
                  minWidth: 'auto', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <Close />
              </Button>
            </Box>
          )}
          
          <AccountCircle sx={{ fontSize: 60, color: 'white' }} />
          <Typography variant="h5" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, textAlign: 'center' }}>
            {subtitle}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Nome Completo"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            required
            disabled={loading || authLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&:hover fieldset': { borderColor: 'white' },
                '&.Mui-focused fieldset': { borderColor: 'white' }
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: 'white' }
            }}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            disabled={loading || authLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&:hover fieldset': { borderColor: 'white' },
                '&.Mui-focused fieldset': { borderColor: 'white' }
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: 'white' }
            }}
          />

          <TextField
            fullWidth
            label="Telefone"
            value={formData.telefone}
            onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            required
            disabled={loading || authLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&:hover fieldset': { borderColor: 'white' },
                '&.Mui-focused fieldset': { borderColor: 'white' }
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: 'white' }
            }}
          />

          <TextField
            fullWidth
            label="CPF"
            value={formData.cpf}
            onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
            placeholder="000.000.000-00"
            required
            disabled={loading || authLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&:hover fieldset': { borderColor: 'white' },
                '&.Mui-focused fieldset': { borderColor: 'white' }
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: 'white' }
            }}
          />
        </Box>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)' }}>
            🔒 <strong>Seus dados estão seguros!</strong><br />
            {isAreaCliente 
              ? "Acesse sua área pessoal e gerencie suas reservas"
              : "Fazemos login automático para facilitar futuras reservas"
            }
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleLogin}
          disabled={loading || authLoading}
          startIcon={loading || authLoading ? <CircularProgress size={20} /> : <Login />}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          {loading || authLoading ? 'Processando...' : (
            isAreaCliente ? 'Entrar na Área do Cliente' : 'Entrar e Continuar Reserva'
          )}
        </Button>

        {showCloseButton && (
          <Button
            onClick={handleClose}
            sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}
          >
            Cancelar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ModalLoginRequerido;
