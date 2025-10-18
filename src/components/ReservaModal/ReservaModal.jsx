import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AuthUsuario from '../AuthUsuario/AuthUsuario';
import ReservaSuccessModal from '../ReservaSuccessModal/ReservaSuccessModal';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Typography, Divider, FormControl, InputLabel, Select, MenuItem, Box
} from '@mui/material';
import { criarReserva } from '../../utils/reservaApi';

const ReservaModal = ({ open, onClose, pacote }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    data: '',
    hora: '',
    enderecoOrigem: '',
    enderecoDestino: '',
    pagamento: '',
    observacoes: ''
  });
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      await criarReserva({
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        pacoteId: pacote?.id,
        pacoteTitulo: pacote?.titulo,
        pacotePreco: pacote?.preco,
        status: 'pendente',
        createdAt: new Date().toISOString()
      });
      
      // Limpar formulário e fechar modal principal
      setFormData({
        nome: '', email: '', telefone: '', cpf: '', data: '', hora: '', enderecoOrigem: '', enderecoDestino: '', pagamento: '', observacoes: ''
      });
      setMsg('');
      if (onClose) onClose();
      
      // Mostrar modal de sucesso
      setShowSuccessModal(true);
    } catch (error) {
      setMsg('Erro ao realizar reserva.');
      console.error(error);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleViewReservas = () => {
    setShowSuccessModal(false);
    if (user) {
      // Se já está logado, vai direto para o painel
      navigate('/usuario/painel');
    } else {
      // Se não está logado, vai para área de login/cadastro
      navigate('/usuario/auth');
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  if (showAuth && !user) {
    return <AuthUsuario onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        style: {
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Reserva: {pacote?.titulo}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Preencha os dados para finalizar sua reserva
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent 
          dividers
          sx={{
            maxHeight: '60vh',
            overflowY: 'auto',
            padding: '24px'
          }}
        >
          <Grid container spacing={3}>
            {/* Dados Pessoais */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Dados Pessoais
              </Typography>
              <Divider />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Data e Hora */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Data e Hora
              </Typography>
              <Divider />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data"
                name="data"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.data}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hora"
                name="hora"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={formData.hora}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Endereços */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Endereços
              </Typography>
              <Divider />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Endereço de Origem (Buscar)"
                name="enderecoOrigem"
                value={formData.enderecoOrigem}
                onChange={handleChange}
                placeholder="Ex: Hotel, Aeroporto, Residência..."
                helperText="Onde você será buscado"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Endereço de Destino (Deixar)"
                name="enderecoDestino"
                value={formData.enderecoDestino}
                onChange={handleChange}
                placeholder="Ex: Praia, Ponto Turístico, Hotel..."
                helperText="Para onde você quer ir"
              />
            </Grid>
            {/* Pagamento */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Forma de Pagamento
              </Typography>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Método de Pagamento</InputLabel>
                <Select
                  name="pagamento"
                  value={formData.pagamento}
                  onChange={handleChange}
                  label="Método de Pagamento"
                >
                  <MenuItem value="pix">PIX</MenuItem>
                  <MenuItem value="cartao_credito">Cartão de Crédito</MenuItem>
                  <MenuItem value="cartao_debito">Cartão de Débito</MenuItem>
                  <MenuItem value="dinheiro">Dinheiro</MenuItem>
                  <MenuItem value="transferencia">Transferência Bancária</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            {/* Resumo da Reserva */}
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h6" gutterBottom>
                  Resumo da Reserva
                </Typography>
                <Typography><strong>Pacote:</strong> {pacote?.titulo}</Typography>
                <Typography><strong>Valor:</strong> R$ {pacote?.preco?.toFixed(2).replace('.', ',')}</Typography>
                {pacote?.precoOriginal && (
                  <Typography color="text.secondary">
                    <s>De: R$ {pacote?.precoOriginal?.toFixed(2).replace('.', ',')}</s>
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Confirmar Reserva
          </Button>
        </DialogActions>
        {msg && <Box mt={2}><Typography color={msg.includes('sucesso') ? 'primary' : 'error'}>{msg}</Typography></Box>}
      </form>
    </Dialog>

    {/* Modal de Sucesso */}
    <ReservaSuccessModal 
      open={showSuccessModal}
      onClose={handleCloseSuccessModal}
      onViewReservas={handleViewReservas}
    />
  </>
  );
};

export default ReservaModal;