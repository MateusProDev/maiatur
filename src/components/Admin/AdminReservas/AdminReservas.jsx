import React, { useState, useEffect, useCallback } from "react";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import "./AdminReservas.css";

const AdminReservas = () => {
    const excluirReserva = async (reservaId) => {
      if (reservaId === "_modelo") {
        showNotification("error", "Não é permitido excluir o documento modelo.");
        return;
      }
      // Não permitir se só restar uma reserva (além do modelo)
      const reservasValidas = reservas.filter(r => r.id !== "_modelo" && !r._isModelo);
      if (reservasValidas.length <= 1) {
        showNotification("error", "Não é permitido excluir todas as reservas. Deve haver ao menos uma reserva cadastrada.");
        return;
      }
      try {
        setAtualizando(true);
        await import("firebase/firestore").then(({ deleteDoc, doc }) => deleteDoc(doc(db, "reservas", reservaId)));
        setReservas(reservas.filter(r => r.id !== reservaId));
        setModalAberto(false);
        showNotification("success", "Reserva excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir reserva:", error);
        showNotification("error", "Erro ao excluir reserva");
      } finally {
        setAtualizando(false);
      }
    };
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [reservaSelecionada, setReservaSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const tiposReserva = {
    passeio: "Passeio",
    transfer_chegada: "Transfer de Chegada",
    transfer_saida: "Transfer de Saída",
    transfer_chegada_saida: "Transfer Chegada + Saída",
    transfer_entre_hoteis: "Transfer entre Hotéis"
  };

  const statusColors = {
    pendente: "warning",
    confirmada: "success",
    cancelada: "error",
    concluida: "info"
  };

  const carregarReservas = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "reservas"),
        orderBy("criadaEm", "desc")
      );
      
      const snapshot = await getDocs(q);
      const reservasData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          criadaEm: doc.data().criadaEm?.toDate()
        }))
        .filter(r => r.id !== "_modelo" && !r._isModelo);
      
      setReservas(reservasData);
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
      showNotification("error", "Erro ao carregar reservas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarReservas(); }, [carregarReservas]);

  // Normaliza campos de reserva para suportar formatos antigos e novos
  const normalizeReserva = (r) => {
    if (!r) return {};
    const d = r.detalhes || {};
    const passeioNome = r.passeio?.nome || r.nomePasseio || d.nomePasseio || '';
    const dataPasseio = r.passeio?.data || r.dataPasseio || d.dataPasseio || '';
    const horaPasseio = r.passeio?.horario || r.horaPasseio || d.horaPasseio || '';
    const horaSaida = d.horaSaida || r.horaSaida || r.horaSaida || '';
    const horaRetorno = d.horaRetorno || r.horaRetorno || '';
    const localSaida = r.passeio?.localEmbarque || r.localSaida || d.localSaida || '';
    const tipoVeiculo = r.veiculo?.tipo || r.tipoVeiculo || d.tipoVeiculo || d.tipoTransferVeiculo || '';
    const passageirosLista = d.passageirosLista || r.passageirosLista || [];
    const passageirosTexto = d.passageirosTexto || r.passageirosTexto || r.passageiros || '';
    const observacoes = r.observacoes || d.observacoes || '';
    const pagamento = r.pagamento || {};
    const quantidades = r.quantidades || {};
    const voo = r.voo || r.vooChegada || d.voo || d.vooChegada || null;
    return {
      passeioNome,
      dataPasseio,
      horaPasseio,
      horaSaida,
      horaRetorno,
      localSaida,
      tipoVeiculo,
      passageirosLista,
      passageirosTexto,
      observacoes,
      pagamento,
      quantidades,
      voo,
      detalhes: d,
    };
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 5000);
  };

  const atualizarStatus = async (reservaId, novoStatus) => {
    try {
      setAtualizando(true);
      await updateDoc(doc(db, "reservas", reservaId), {
        status: novoStatus,
        atualizadaEm: new Date()
      });
      
      setReservas(reservas.map(r =>
        r.id === reservaId ? { ...r, status: novoStatus } : r
      ));
      
      if (reservaSelecionada?.id === reservaId) {
        setReservaSelecionada({ ...reservaSelecionada, status: novoStatus });
      }
      
      showNotification("success", "Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      showNotification("error", "Erro ao atualizar status");
    } finally {
      setAtualizando(false);
    }
  };

  const reservasFiltradas = reservas.filter(reserva => {
    const matchTipo = filtroTipo === "todos" || reserva.tipo === filtroTipo;
    const matchStatus = filtroStatus === "todos" || reserva.status === filtroStatus;
    const matchBusca = busca === "" ||
      reserva.responsavel?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      reserva.responsavel?.email?.toLowerCase().includes(busca.toLowerCase()) ||
      reserva.id.toLowerCase().includes(busca.toLowerCase());
    
    return matchTipo && matchStatus && matchBusca;
  });

  const abrirDetalhes = (reserva) => {
    // Log raw reserva for debugging
    try {
      console.log('[AdminReservas] abrirDetalhes - raw reserva:', reserva);
      // If normalizeReserva exists, log normalized version too
      if (typeof normalizeReserva === 'function') {
        const norm = normalizeReserva(reserva);
        console.log('[AdminReservas] abrirDetalhes - normalized reserva:', norm);
      }
    } catch (e) {
      console.warn('[AdminReservas] abrirDetalhes - erro ao logar reserva:', e);
    }

    setReservaSelecionada(reserva);
    setModalAberto(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a4d7a", mb: 1 }}>
              📋 Gerenciar Reservas
            </Typography>
            <Typography variant="body1" sx={{ color: "#6b7280" }}>
              Total: {reservasFiltradas.length} reserva{reservasFiltradas.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={carregarReservas}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": { background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)" }
            }}
          >
            Atualizar
          </Button>
        </Box>

        {notification.show && (
          <Alert severity={notification.type} sx={{ mb: 3 }}>
            {notification.message}
          </Alert>
        )}

        {/* Filtros */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar"
              placeholder="Nome, email ou ID"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Reserva</InputLabel>
              <Select
                value={filtroTipo}
                label="Tipo de Reserva"
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <MenuItem value="todos">Todos os Tipos</MenuItem>
                {Object.entries(tiposReserva).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filtroStatus}
                label="Status"
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <MenuItem value="todos">Todos os Status</MenuItem>
                <MenuItem value="pendente">Pendente</MenuItem>
                <MenuItem value="confirmada">Confirmada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
                <MenuItem value="concluida">Concluída</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : reservasFiltradas.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="textSecondary">
            Nenhuma reserva encontrada
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {reservasFiltradas.map((reserva) => (
            <Grid item xs={12} key={reserva.id}>
              <Card sx={{ "&:hover": { boxShadow: 6 }, transition: "all 0.3s" }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Typography variant="caption" color="textSecondary">
                        #{reserva.id.substring(0, 8).toUpperCase()}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {reserva.responsavel?.nome}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          {reserva.responsavel?.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          {reserva.responsavel?.ddi} {reserva.responsavel?.telefone}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Chip
                        label={tiposReserva[reserva.tipo]}
                        color="primary"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {reserva.criadaEm?.toLocaleDateString("pt-BR")} às{" "}
                          {reserva.criadaEm?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        👥 {reserva.quantidades?.adultos} adulto(s)
                        {reserva.quantidades?.criancas > 0 && ` + ${reserva.quantidades.criancas} criança(s)`}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <MoneyIcon fontSize="small" color="action" />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#10b981" }}>
                          R$ {reserva.pagamento?.valorTotal?.toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {reserva.pagamento?.forma}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                      <Chip
                        label={reserva.status.toUpperCase()}
                        color={statusColors[reserva.status]}
                        sx={{ fontWeight: 600 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => abrirDetalhes(reserva)}
                      >
                        Detalhes
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={modalAberto} onClose={() => setModalAberto(false)} maxWidth="md" fullWidth>
        {reservaSelecionada && (() => {
          const norm = normalizeReserva(reservaSelecionada);
          return (
          <>
            <DialogTitle>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Detalhes da Reserva
              </Typography>
              <Typography variant="caption" color="textSecondary">
                #{reservaSelecionada.id.substring(0, 12).toUpperCase()}
              </Typography>
            </DialogTitle>
            
            <DialogContent dividers sx={{ maxHeight: '65vh', overflowY: 'auto' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    RESPONSÁVEL
                  </Typography>
                  <Typography><strong>Nome:</strong> {reservaSelecionada.responsavel?.nome}</Typography>
                  <Typography><strong>Email:</strong> {reservaSelecionada.responsavel?.email}</Typography>
                  <Typography><strong>Telefone:</strong> {reservaSelecionada.responsavel?.ddi} {reservaSelecionada.responsavel?.telefone}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    INFORMAÇÕES
                  </Typography>
                  <Typography><strong>ID:</strong> {reservaSelecionada.id}</Typography>
                  <Typography><strong>Tipo:</strong> {reservaSelecionada.tipo || '-'}</Typography>
                  <Typography><strong>Status:</strong> {reservaSelecionada.status || '-'}</Typography>
                  {reservaSelecionada.criadaEm && (
                    <Typography><strong>Criada em:</strong> {new Date(reservaSelecionada.criadaEm).toLocaleString('pt-BR')}</Typography>
                  )}
                  {reservaSelecionada.atualizadaEm && (
                    <Typography><strong>Atualizada em:</strong> {new Date(reservaSelecionada.atualizadaEm).toLocaleString('pt-BR')}</Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    PASSAGEIROS
                  </Typography>
                  {/* Lista estruturada, texto ou campo simples, sem duplicação */}
                  {Array.isArray(norm.passageirosLista) && norm.passageirosLista.length > 0 ? (
                    <Box sx={{ mb: 1 }}>
                      {norm.passageirosLista.map((p, idx) => (
                        <Typography key={idx} style={{ whiteSpace: "pre-line" }}>
                          {idx + 1}. {p.nome}{p.idade ? `, Idade: ${p.idade}` : ""}
                        </Typography>
                      ))}
                    </Box>
                  ) : norm.passageirosTexto ? (
                    <Typography style={{ whiteSpace: "pre-line" }}>
                      {norm.passageirosTexto}
                    </Typography>
                  ) : null}
                  {typeof norm.quantidades?.adultos === 'number' && (
                    <Typography><strong>Adultos:</strong> {norm.quantidades.adultos}</Typography>
                  )}
                  {typeof norm.quantidades?.criancas === 'number' && (
                    <Typography><strong>Crianças:</strong> {norm.quantidades.criancas}</Typography>
                  )}
                </Grid>

                {/* PASSEIO - Suporta campos alternativos, sem duplicação */}
                {(reservaSelecionada.passeio || reservaSelecionada.nomePasseio || reservaSelecionada.dataPasseio || reservaSelecionada.horaPasseio || reservaSelecionada.localSaida) && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      PASSEIO
                    </Typography>
                    {norm.passeioNome ? (
                      <Typography><strong>Nome:</strong> {norm.passeioNome}</Typography>
                    ) : null}
                    {norm.dataPasseio ? (
                      <Typography><strong>Data:</strong> {norm.dataPasseio}</Typography>
                    ) : null}
                    {norm.horaPasseio ? (
                      <Typography><strong>Horário:</strong> {norm.horaPasseio}</Typography>
                    ) : null}
                    {norm.localSaida ? (
                      <Typography><strong>Local Embarque:</strong> {norm.localSaida}</Typography>
                    ) : null}
                  </Grid>
                )}

                {(reservaSelecionada.voo || reservaSelecionada.vooChegada) && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      VOO
                    </Typography>
                    <Typography><strong>Número:</strong> {(reservaSelecionada.voo || reservaSelecionada.vooChegada)?.numeroVoo}</Typography>
                    <Typography><strong>Data:</strong> {new Date((reservaSelecionada.voo || reservaSelecionada.vooChegada)?.dataChegada || (reservaSelecionada.voo || reservaSelecionada.vooChegada)?.dataSaida).toLocaleDateString("pt-BR")}</Typography>
                  </Grid>
                )}

                {/* VEÍCULO - Suporta campos alternativos, sem duplicação */}
                {(reservaSelecionada.veiculo || reservaSelecionada.tipoVeiculo) && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      VEÍCULO
                    </Typography>
                    {norm.tipoVeiculo ? (
                      <Typography><strong>Tipo:</strong> {norm.tipoVeiculo}</Typography>
                    ) : null}
                    {reservaSelecionada.veiculo?.modelo ? (
                      <Typography><strong>Modelo:</strong> {reservaSelecionada.veiculo.modelo}</Typography>
                    ) : null}
                    {reservaSelecionada.veiculo?.placa ? (
                      <Typography><strong>Placa:</strong> {reservaSelecionada.veiculo.placa}</Typography>
                    ) : null}
                  </Grid>
                )}

                {/* HORÁRIOS - Suporta campos alternativos, sem duplicação */}
                {(reservaSelecionada.horarios || reservaSelecionada.horaSaida || reservaSelecionada.horaRetorno) && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      HORÁRIOS
                    </Typography>
                    {norm.horaSaida ? (
                      <Typography><strong>Saída:</strong> {norm.horaSaida}</Typography>
                    ) : null}
                    {norm.horaRetorno ? (
                      <Typography><strong>Retorno:</strong> {norm.horaRetorno}</Typography>
                    ) : null}
                  </Grid>
                )}

                {/* LOCAL - Suporta campos alternativos, sem duplicação */}
                {(reservaSelecionada.local || reservaSelecionada.localSaida) && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      LOCAL
                    </Typography>
                    {norm.localSaida ? (
                      <Typography><strong>Origem:</strong> {norm.localSaida}</Typography>
                    ) : null}
                    {reservaSelecionada.local?.destino ? (
                      <Typography><strong>Destino:</strong> {reservaSelecionada.local.destino}</Typography>
                    ) : null}
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    PAGAMENTO
                  </Typography>
                  <Typography><strong>Forma:</strong> {reservaSelecionada.pagamento?.forma}</Typography>
                  <Typography><strong>Valor Total:</strong> R$ {reservaSelecionada.pagamento?.valorTotal?.toFixed(2)}</Typography>
                </Grid>
                
                {/* OBSERVAÇÕES - Mostra se existir, sem duplicação */}
                {(reservaSelecionada.observacoes || reservaSelecionada.detalhes?.observacoes) && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      OBSERVAÇÕES
                    </Typography>
                    <Typography>{norm.observacoes}</Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    ALTERAR STATUS
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant={reservaSelecionada.status === "pendente" ? "contained" : "outlined"}
                      color="warning"
                      startIcon={<PendingIcon />}
                      onClick={() => atualizarStatus(reservaSelecionada.id, "pendente")}
                      disabled={atualizando}
                    >
                      Pendente
                    </Button>
                    <Button
                      variant={reservaSelecionada.status === "confirmada" ? "contained" : "outlined"}
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={() => atualizarStatus(reservaSelecionada.id, "confirmada")}
                      disabled={atualizando}
                    >
                      Confirmada
                    </Button>
                    <Button
                      variant={reservaSelecionada.status === "concluida" ? "contained" : "outlined"}
                      color="info"
                      startIcon={<CheckIcon />}
                      onClick={() => atualizarStatus(reservaSelecionada.id, "concluida")}
                      disabled={atualizando}
                    >
                      Concluída
                    </Button>
                    <Button
                      variant={reservaSelecionada.status === "cancelada" ? "contained" : "outlined"}
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => atualizarStatus(reservaSelecionada.id, "cancelada")}
                      disabled={atualizando}
                    >
                      Cancelada
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setModalAberto(false)}>Fechar</Button>
              <Button
                color="error"
                variant="contained"
                disabled={atualizando || reservaSelecionada?.id === "_modelo"}
                onClick={() => excluirReserva(reservaSelecionada.id)}
              >
                Excluir Reserva
              </Button>
            </DialogActions>
          </>
          );
        })()}
      </Dialog>
    </Container>
  );
};

export default AdminReservas;


