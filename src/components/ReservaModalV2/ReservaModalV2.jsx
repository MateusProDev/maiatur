import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  QrCode as QrCodeIcon,
  CreditCard
} from '@mui/icons-material';
import CheckoutTransparente from '../CheckoutTransparente';
import { useNavigate } from 'react-router-dom';

console.debug('[ReservaModalV2] Componente carregado');
const ReservaModalV2 = ({ open, onClose, pacote }) => {
  console.debug('[ReservaModalV2] Props:', { open, onClose, pacote });
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  console.debug('[ReservaModalV2] User context:', user);
  
  // Estados principais
  useEffect(() => {
    console.debug('[ReservaModalV2] Estado atualizado', {
      tipoViagem,
      metodoPagamento,
      showPagamentoModal,
      showCheckoutTransparente,
      dadosReserva,
      loading,
      error,
      formData
    });
  });
  const [tipoViagem, setTipoViagem] = useState('ida');
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [showCheckoutTransparente, setShowCheckoutTransparente] = useState(false);
  const [dadosReserva, setDadosReserva] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataIda: '',
    horaIda: '',
    dataVolta: '',
    horaVolta: '',
    pontoPartida: '',
    pontoDestino: '',
    totalPassageiros: 1,
    adultos: 1,
    criancas: 0,
    infantis: 0,
    observacoes: '',
  });
  
  // Valores calculados
  const [valores, setValores] = useState({
    valorTotal: 0,
    valorSinal: 0,
    valorPrimeiraViagem: 0,
    valorSegundaViagem: 0,
    valorRestante: 0,
    valorComDesconto: 0
  });

  // Função para calcular preços
  const calcularPrecos = useCallback(() => {
    if (!pacote) return;

    let valorTotal = 0;
    
    if (pacote.isIdaEVolta) {
      switch (tipoViagem) {
        case 'ida':
          valorTotal = pacote.precoIda || 0;
          break;
        case 'volta':
          valorTotal = pacote.precoVolta || 0;
          break;
        case 'ida_volta':
          valorTotal = pacote.precoIdaVolta || 0;
          break;
        default:
          valorTotal = pacote.preco || 0;
      }
    } else {
      valorTotal = pacote.preco || 0;
    }

    // Sistema de valores fixos divididos
    let valorSinal = 0;
    let valorPrimeiraViagem = 0;
    let valorSegundaViagem = 0;
    
    if (pacote.isIdaEVolta && tipoViagem === 'ida_volta') {
      // Para ida e volta: dividir em 3 partes iguais
      const valorPorParte = valorTotal / 3;
      valorSinal = pacote.valorSinal || valorPorParte;
      valorPrimeiraViagem = pacote.valorPrimeiraViagem || valorPorParte;
      valorSegundaViagem = pacote.valorSegundaViagem || valorPorParte;
    } else {
      // Para apenas ida ou apenas volta
      valorSinal = pacote.valorSinal || (valorTotal / 2);
      valorPrimeiraViagem = pacote.valorPrimeiraViagem || (valorTotal / 2);
      valorSegundaViagem = 0;
    }
    
    const valorRestante = valorPrimeiraViagem + valorSegundaViagem;
    
    // Calcula desconto de 5% para PIX
    const valorComDesconto = metodoPagamento === 'pix' 
      ? valorSinal * 0.95 
      : valorSinal;
    
    setValores({
      valorTotal,
      valorSinal,
      valorPrimeiraViagem,
      valorSegundaViagem,
      valorRestante,
      valorComDesconto
    });
  }, [pacote, tipoViagem, metodoPagamento]);

  // Effect para calcular preços
  useEffect(() => {
    if (pacote) {
      calcularPrecos();
    }
  }, [tipoViagem, metodoPagamento, pacote, calcularPrecos]);

  // Effect para preencher dados do usuário
  useEffect(() => {
    if (user && open) {
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);
      const depoisDeAmanha = new Date(amanha);
      depoisDeAmanha.setDate(amanha.getDate() + 1);
      
      const formatarData = (data) => data.toISOString().split('T')[0];

      // Determinar origem e destino
      let pontoPartida = '';
      let pontoDestino = '';
      
      if (pacote) {
        const titulo = pacote.titulo?.toLowerCase() || '';
        
        if (titulo.includes('salvador')) {
          pontoPartida = titulo.includes('para') || titulo.includes('x') ? 'Salvador - BA' : '';
          pontoDestino = titulo.includes('para') || titulo.includes('x') ? titulo.split(/para|x/)[1]?.trim() || '' : 'Salvador - BA';
        } else {
          pontoPartida = pacote.cidadeOrigem || pacote.origem || '';
          pontoDestino = pacote.cidadeDestino || pacote.destino || pacote.titulo || '';
        }
      }

      setFormData(prev => ({
        ...prev,
        nome: user.displayName || user.nome || '',
        email: user.email || '',
        telefone: user.phoneNumber || user.telefone || '',
        dataIda: formatarData(amanha),
        horaIda: '08:00',
        dataVolta: pacote?.isIdaEVolta ? formatarData(depoisDeAmanha) : '',
        horaVolta: pacote?.isIdaEVolta ? '18:00' : '',
        pontoPartida: pontoPartida,
        pontoDestino: pontoDestino,
        observacoes: `Reserva automática para ${pacote?.titulo || 'viagem'}. Entre em contato para mais detalhes.`,
      }));
    }
  }, [user, open, pacote]);

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.debug('[ReservaModalV2] handleChange', { name, value, type, checked });
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handlePassageirosChange = (tipo, valor) => {
    const novoValor = Math.max(0, parseInt(valor) || 0);
    console.debug('[ReservaModalV2] handlePassageirosChange', { tipo, valor, novoValor });
    setFormData(prev => {
      const novosPassageiros = { ...prev };
      novosPassageiros[tipo] = novoValor;
      const total = novosPassageiros.adultos + novosPassageiros.criancas + novosPassageiros.infantis;
      if (total > 6) {
        return prev;
      }
      novosPassageiros.totalPassageiros = total;
      return novosPassageiros;
    });
  };

  const formatarPassageiros = (adultos, criancas, infantis) => {
    const total = adultos + criancas + infantis;
    return `${total}(${adultos}-${criancas}-${infantis})`;
  };

  const limparCampos = () => {
    console.debug('[ReservaModalV2] limparCampos');
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      dataIda: '',
      horaIda: '',
      dataVolta: '',
      horaVolta: '',
      pontoPartida: '',
      pontoDestino: '',
      totalPassageiros: 1,
      adultos: 1,
      criancas: 0,
      infantis: 0,
      observacoes: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.debug('[ReservaModalV2] handleSubmit', { formData, pacote });
    // Validações
    if (pacote.isIdaEVolta && (!formData.dataVolta || !formData.horaVolta)) {
      alert('Para pacotes com ida e volta, é obrigatório informar a data e horário da volta.');
      return;
    }
    if (formData.totalPassageiros === 0) {
      alert('É obrigatório selecionar pelo menos 1 passageiro.');
      return;
    }
    if (formData.totalPassageiros > 6) {
      alert('Máximo de 6 passageiros permitidos.');
      return;
    }
    // Preparar dados da reserva
    const dadosParaPagamento = {
      pacoteId: pacote.id,
      pacoteTitulo: pacote.titulo,
      clienteNome: formData.nome,
      clienteEmail: formData.email,
      clienteTelefone: formData.telefone,
      clienteCpf: formData.cpf,
      isIdaEVolta: tipoViagem === 'ida_volta',
      tipoViagem,
      dataIda: formData.dataIda,
      dataVolta: pacote.isIdaEVolta ? formData.dataVolta : null,
      horaIda: formData.horaIda,
      horaVolta: pacote.isIdaEVolta ? formData.horaVolta : null,
      status: 'pendente',
      valorTotal: valores.valorTotal,
      valorComDesconto: valores.valorComDesconto,
      valorSinal: valores.valorSinal,
      valorPrimeiraViagem: valores.valorPrimeiraViagem,
      valorSegundaViagem: valores.valorSegundaViagem,
      valorRestante: valores.valorRestante,
      pontoPartida: formData.pontoPartida,
      pontoDestino: formData.pontoDestino,
      totalPassageiros: formData.totalPassageiros,
      adultos: formData.adultos,
      criancas: formData.criancas,
      infantis: formData.infantis,
      passageirosFormatado: formatarPassageiros(formData.adultos, formData.criancas, formData.infantis),
      observacoes: formData.observacoes,
    };
    console.debug('[ReservaModalV2] handleSubmit - dadosParaPagamento', dadosParaPagamento);
    setDadosReserva(dadosParaPagamento);
    setShowPagamentoModal(true);
  };

  const finalizarPagamento = () => {
    try {
      setError(null);
      if (!dadosReserva) {
        throw new Error('Dados da reserva não encontrados');
      }
      console.debug('[ReservaModalV2] finalizarPagamento', { dadosReserva });
      setShowPagamentoModal(false);
      setShowCheckoutTransparente(true);
    } catch (error) {
      console.error('[ReservaModalV2] Erro ao preparar pagamento:', error);
      setError('Erro ao preparar pagamento. Tente novamente.');
    }
  };

  const handlePagamentoSucesso = (dadosPagamento) => {
    console.log('✅ Pagamento aprovado:', dadosPagamento);
    setShowCheckoutTransparente(false);
    
    setTimeout(() => {
      // Apenas fecha o modal, não reseta o estado aqui
      onClose();
    }, 1000);
  };

  const handlePagamentoErro = (erro) => {
    console.error('❌ Erro no pagamento:', erro);
    setShowCheckoutTransparente(false);
    setError(erro || 'Erro no pagamento. Tente novamente.');
  };

  const resetAllStates = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      dataIda: '',
      horaIda: '',
      dataVolta: '',
      horaVolta: '',
      pontoPartida: '',
      pontoDestino: '',
      totalPassageiros: 1,
      adultos: 1,
      criancas: 0,
      infantis: 0,
      observacoes: '',
    });
    setTipoViagem('ida');
    setMetodoPagamento('pix');
    setError(null);
    setLoading(false);
    setShowPagamentoModal(false);
    setShowCheckoutTransparente(false);
    setDadosReserva(null);
  };


  // Se não estiver logado, mostrar mensagem e botão para criar conta
  if (!user) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h5" fontWeight="bold">Crie uma conta para reservar</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Para fazer uma reserva, você precisa criar uma conta.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => { onClose(); navigate('/usuario'); }}
            sx={{ mt: 2, fontWeight: 'bold', borderRadius: 2 }}
          >
            Criar Conta
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  if (!pacote) return null;

  console.log('[ReservaModalV2] Renderizando componente');
  return (
    <>
      {/* Modal Principal de Reserva */}
      <Dialog 
        open={open && !showPagamentoModal} 
        onClose={() => { resetAllStates(); onClose(); }} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          py: 2
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                p: 0.8,
                display: 'flex',
                alignItems: 'center',
                fontSize: '1.2rem'
              }}>
                🎫
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Reservar Viagem
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {pacote.titulo}
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="outlined"
              size="small" 
              onClick={limparCampos}
              sx={{ 
                fontSize: '0.7rem',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                py: 0.5,
                px: 1.5,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              🗑️ Limpar
            </Button>
          </Box>
          <Typography variant="caption" sx={{ mt: 1, opacity: 0.8, display: 'block' }}>
            ℹ️ Campos preenchidos automaticamente. Edite conforme necessário.
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 2, bgcolor: '#f8fafc', maxHeight: '70vh', overflowY: 'auto' }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              
              {/* Tipo de Viagem */}
              {pacote.isIdaEVolta && (
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🚍 Tipo de Viagem
                      </Typography>
                      <FormControl fullWidth size="small">
                        <InputLabel>Escolha o tipo de viagem</InputLabel>
                        <Select
                          value={tipoViagem}
                          label="Escolha o tipo de viagem"
                          onChange={(e) => setTipoViagem(e.target.value)}
                          sx={{ borderRadius: 1.5 }}
                        >
                          <MenuItem value="ida">
                            <Box display="flex" alignItems="center" gap={1}>
                              <FlightTakeoff color="primary" /> Apenas Ida
                            </Box>
                          </MenuItem>
                          <MenuItem value="volta">
                            <Box display="flex" alignItems="center" gap={1}>
                              <FlightLand color="primary" /> Apenas Volta
                            </Box>
                          </MenuItem>
                          <MenuItem value="ida_volta">
                            <Box display="flex" alignItems="center" gap={1}>
                              <FlightTakeoff color="primary" /><FlightLand color="primary" /> Ida e Volta
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Dados do Cliente */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      👤 Dados do Cliente
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Nome Completo"
                          name="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          required
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Dados da Viagem */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      📅 Dados da Viagem
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Data da Ida"
                          name="dataIda"
                          type="date"
                          value={formData.dataIda}
                          onChange={handleChange}
                          required
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Horário da Ida"
                          name="horaIda"
                          type="time"
                          value={formData.horaIda}
                          onChange={handleChange}
                          required
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      {tipoViagem === 'ida_volta' && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Data da Volta"
                              name="dataVolta"
                              type="date"
                              value={formData.dataVolta}
                              onChange={handleChange}
                              required
                              InputLabelProps={{ shrink: true }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Horário da Volta"
                              name="horaVolta"
                              type="time"
                              value={formData.horaVolta}
                              onChange={handleChange}
                              required
                              InputLabelProps={{ shrink: true }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </>
                      )}

                      {/* Campos de volta para ida apenas */}
                      {pacote.isIdaEVolta && tipoViagem === 'ida' && (
                        <>
                          <Grid item xs={12}>
                            <Box sx={{ 
                              bgcolor: 'info.light', 
                              p: 2, 
                              borderRadius: 2, 
                              mt: 2,
                              border: '1px solid',
                              borderColor: 'info.main'
                            }}>
                              <Typography variant="subtitle1" color="info.dark" gutterBottom fontWeight="bold">
                                📅 Informações da Volta (para futura reserva)
                              </Typography>
                              <Typography variant="body2" color="info.dark">
                                Preencha as informações da volta. Após finalizar a ida, o dono da agência será notificado para organizar sua volta.
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Data Pretendida para Volta"
                              name="dataVolta"
                              type="date"
                              value={formData.dataVolta}
                              onChange={handleChange}
                              required
                              InputLabelProps={{ shrink: true }}
                              helperText="Esta data será mostrada para o dono da agência"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Horário Pretendido para Volta"
                              name="horaVolta"
                              type="time"
                              value={formData.horaVolta}
                              onChange={handleChange}
                              required
                              InputLabelProps={{ shrink: true }}
                              helperText="Horário aproximado desejado"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Localização */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      📍 Localização
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Ponto de Partida"
                          name="pontoPartida"
                          value={formData.pontoPartida}
                          onChange={handleChange}
                          required
                          multiline
                          rows={2}
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Ponto de Destino"
                          name="pontoDestino"
                          value={formData.pontoDestino}
                          onChange={handleChange}
                          required
                          multiline
                          rows={2}
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Passageiros */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      👥 Passageiros (Máximo 6)
                    </Typography>
                    
                    {/* Display do total */}
                    <Box sx={{ 
                      bgcolor: 'primary.light', 
                      p: 1.5, 
                      borderRadius: 1.5, 
                      mb: 2,
                      textAlign: 'center'
                    }}>
                      <Typography variant="h6" color="primary.dark">
                        Total: {formatarPassageiros(formData.adultos, formData.criancas, formData.infantis)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Formato: Total(Adultos-Crianças-Infantis)
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Adultos"
                          type="number"
                          value={formData.adultos}
                          onChange={(e) => handlePassageirosChange('adultos', e.target.value)}
                          inputProps={{ min: 0, max: 6 }}
                          size="small"
                          required
                          helperText="Acima de 12 anos"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Crianças"
                          type="number"
                          value={formData.criancas}
                          onChange={(e) => handlePassageirosChange('criancas', e.target.value)}
                          inputProps={{ min: 0, max: 6 }}
                          size="small"
                          helperText="De 2 a 12 anos"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Infantis"
                          type="number"
                          value={formData.infantis}
                          onChange={(e) => handlePassageirosChange('infantis', e.target.value)}
                          inputProps={{ min: 0, max: 6 }}
                          size="small"
                          helperText="Até 2 anos (colo)"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />
                      </Grid>
                    </Grid>

                    {/* Validação de limite */}
                    {formData.totalPassageiros > 6 && (
                      <Box sx={{ 
                        bgcolor: 'error.light', 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        mt: 2,
                        border: '1px solid',
                        borderColor: 'error.main'
                      }}>
                        <Typography variant="body2" color="error.dark" fontWeight="bold">
                          ⚠️ Máximo de 6 passageiros permitidos
                        </Typography>
                      </Box>
                    )}

                    {formData.totalPassageiros === 0 && (
                      <Box sx={{ 
                        bgcolor: 'warning.light', 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        mt: 2,
                        border: '1px solid',
                        borderColor: 'warning.main'
                      }}>
                        <Typography variant="body2" color="warning.dark" fontWeight="bold">
                          ⚠️ Pelo menos 1 passageiro é obrigatório
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Observações */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      💬 Observações
                    </Typography>
                    <TextField
                      fullWidth
                      label="Observações"
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      size="small"
                      placeholder="Observações adicionais sobre a viagem..."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </CardContent>
                </Card>
              </Grid>

            </Grid>
          </form>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', gap: 1 }}>
          <Button 
            onClick={onClose}
            variant="outlined"
            size="medium"
            sx={{ 
              borderRadius: 1.5, 
              px: 3,
              borderColor: '#cbd5e1',
              color: '#64748b',
              '&:hover': {
                borderColor: '#94a3b8',
                bgcolor: '#f1f5f9'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            size="medium"
            sx={{ 
              borderRadius: 1.5, 
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              }
            }}
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Pagamento */}
      <Dialog 
        open={showPagamentoModal} 
        onClose={() => setShowPagamentoModal(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', 
          color: 'white',
          py: 2
        }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              p: 0.8,
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.2rem'
            }}>
              💳
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Finalizar Pagamento
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Escolha a forma de pagamento do sinal
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 2, bgcolor: '#f8fafc', maxHeight: '70vh', overflowY: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {dadosReserva && (
            <Grid container spacing={2}>
              {/* Valores */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      💰 Valores da Viagem
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f1f5f9', borderRadius: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            Valor Total
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            R$ {dadosReserva.valorTotal.toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#dbeafe', borderRadius: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            Sinal (Agência)
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            R$ {dadosReserva.valorSinal.toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#fef3c7', borderRadius: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            1ª Viagem
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="warning.dark">
                            R$ {dadosReserva.valorPrimeiraViagem?.toFixed(2) || '0.00'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#dcfce7', borderRadius: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            2ª Viagem
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            R$ {dadosReserva.valorSegundaViagem?.toFixed(2) || '0.00'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ 
                          bgcolor: 'info.light', 
                          p: 2, 
                          borderRadius: 1.5, 
                          textAlign: 'center',
                          border: '1px solid',
                          borderColor: 'info.main'
                        }}>
                          <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            ℹ️ Divisão de Pagamentos:
                          </Typography>
                          <Typography variant="body1" color="info.dark" sx={{ mb: 1 }}>
                            <strong>Sinal:</strong> Pago agora para a agência • 
                            <strong>1ª Viagem:</strong> Para motorista da ida • 
                            <strong>2ª Viagem:</strong> Para motorista da volta
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Motoristas recebem pagamento via PIX ou dinheiro ao final de cada trajeto
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Escolha do Método de Pagamento */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      💳 Forma de Pagamento
                    </Typography>
                    
                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup
                        value={metodoPagamento}
                        onChange={(e) => setMetodoPagamento(e.target.value)}
                      >
                        <Card 
                          sx={{ 
                            mb: 1.5, 
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: metodoPagamento === 'pix' ? 'success.main' : 'grey.200',
                            bgcolor: metodoPagamento === 'pix' ? 'success.light' : 'white',
                            transform: metodoPagamento === 'pix' ? 'scale(1.01)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.01)',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }
                          }}
                          onClick={() => setMetodoPagamento('pix')}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <FormControlLabel 
                              value="pix" 
                              control={<Radio />} 
                              label={
                                <Box>
                                  <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                                    <Box sx={{ 
                                      bgcolor: 'success.main', 
                                      borderRadius: '50%', 
                                      p: 0.8, 
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}>
                                      <QrCodeIcon fontSize="small" />
                                    </Box>
                                    <Typography variant="body1" fontWeight="bold">
                                      PIX (5% desconto)
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" color="success.dark" fontWeight="bold">
                                    R$ {(dadosReserva.valorSinal * 0.95).toFixed(2)}
                                  </Typography>
                                </Box>
                              }
                              sx={{ margin: 0, width: '100%' }}
                            />
                          </CardContent>
                        </Card>

                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: metodoPagamento === 'cartao' ? 'primary.main' : 'grey.200',
                            bgcolor: metodoPagamento === 'cartao' ? 'primary.light' : 'white',
                            transform: metodoPagamento === 'cartao' ? 'scale(1.01)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.01)',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }
                          }}
                          onClick={() => setMetodoPagamento('cartao')}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <FormControlLabel 
                              value="cartao" 
                              control={<Radio />} 
                              label={
                                <Box>
                                  <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                                    <Box sx={{ 
                                      bgcolor: 'primary.main', 
                                      borderRadius: '50%', 
                                      p: 0.8, 
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}>
                                      <CreditCard fontSize="small" />
                                    </Box>
                                    <Typography variant="body1" fontWeight="bold">
                                      Cartão de Crédito
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" color="primary.dark" fontWeight="bold">
                                    R$ {dadosReserva.valorSinal.toFixed(2)}
                                  </Typography>
                                </Box>
                              }
                              sx={{ margin: 0, width: '100%' }}
                            />
                          </CardContent>
                        </Card>
                      </RadioGroup>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', gap: 1 }}>
          <Button 
            onClick={() => setShowPagamentoModal(false)}
            variant="outlined"
            size="medium"
            sx={{ 
              borderRadius: 1.5, 
              px: 3,
              borderColor: '#cbd5e1',
              color: '#64748b',
              '&:hover': {
                borderColor: '#94a3b8',
                bgcolor: '#f1f5f9'
              }
            }}
          >
            ← Voltar
          </Button>
          <Button 
            onClick={finalizarPagamento} 
            variant="contained" 
            size="medium"
            disabled={loading}
            sx={{ 
              borderRadius: 1.5, 
              px: 3,
              py: 1,
              background: metodoPagamento === 'pix' 
                ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: metodoPagamento === 'pix'
                ? '0 2px 8px rgba(17, 153, 142, 0.3)'
                : '0 2px 8px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: metodoPagamento === 'pix'
                  ? 'linear-gradient(135deg, #0e8578 0%, #32d16a 100%)'
                  : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: metodoPagamento === 'pix'
                  ? '0 4px 12px rgba(17, 153, 142, 0.4)'
                  : '0 4px 12px rgba(102, 126, 234, 0.4)',
              }
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (metodoPagamento === 'pix' ? <QrCodeIcon /> : <CreditCard />)}
          >
            {loading 
              ? 'Processando...'
              : (metodoPagamento === 'pix' 
                ? 'Pagar com PIX' 
                : 'Pagar com Cartão'
              )
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal do Checkout Transparente */}
      <Dialog 
        open={showCheckoutTransparente} 
        onClose={() => setShowCheckoutTransparente(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            maxHeight: '95vh'
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
                {metodoPagamento === 'pix' 
                  ? `R$ ${(dadosReserva?.valorSinal * 0.95).toFixed(2)} (5% desconto)`
                  : `R$ ${dadosReserva?.valorSinal.toFixed(2)}`
                }
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {dadosReserva ? (
            <CheckoutTransparente
              valor={dadosReserva.valorSinal}
              metodoPagamento={metodoPagamento}
              onSuccess={handlePagamentoSucesso}
              onError={handlePagamentoErro}
              dadosReserva={dadosReserva}
            />
          ) : (
            <Box p={4} textAlign="center">
              <CircularProgress />
              <Typography variant="body1" mt={2}>
                Carregando informações de pagamento...
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => setShowCheckoutTransparente(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 4
            }}
          >
            ← Voltar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReservaModalV2;
