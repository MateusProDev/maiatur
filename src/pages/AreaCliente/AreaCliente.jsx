import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Box, Typography, Card, CardContent, CircularProgress, Grid } from '@mui/material';

const AreaCliente = () => {
  const { user, loading: loadingAuth } = useContext(AuthContext);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservas = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Busca reservas vinculadas ao usuário logado (user.uid) por clienteId ou userId
        const reservasRef = collection(db, 'reservas');
        const q1 = query(reservasRef, where('clienteId', '==', user.uid));
        const q2 = query(reservasRef, where('userId', '==', user.uid));
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        // Junta e remove duplicadas
        const reservasData = [...snap1.docs, ...snap2.docs]
          .reduce((acc, doc) => {
            if (!acc.some(r => r.id === doc.id)) acc.push({ id: doc.id, ...doc.data() });
            return acc;
          }, []);
        setReservas(reservasData);
      } catch (err) {
        setReservas([]);
      }
      setLoading(false);
    };
    if (user) fetchReservas();
  }, [user]);

  if (loadingAuth || loading) {
    return <Box p={4} textAlign="center"><CircularProgress /></Box>;
  }

  if (!user) {
    return <Box p={4} textAlign="center"><Typography>Faça login para ver suas reservas.</Typography></Box>;
  }

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Minhas Reservas</Typography>
      {reservas.length === 0 ? (
        <Typography>Nenhuma reserva encontrada.</Typography>
      ) : (
        <Grid container spacing={2}>
          {reservas.map(reserva => (
            <Grid item xs={12} md={6} key={reserva.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {reserva.pacoteTitulo || 'Pacote'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">ID da Reserva: {reserva.id}</Typography>
                  <Typography>Data Ida: {reserva.dataIda} {reserva.horaIda}</Typography>
                  {reserva.dataVolta && <Typography>Data Volta: {reserva.dataVolta} {reserva.horaVolta}</Typography>}
                  <Typography>Status: {reserva.status || 'Pendente'}</Typography>
                  <Typography>Valor Total: R$ {reserva.valorTotal || reserva.valorPago || '0,00'}</Typography>
                  <Typography>Cliente: {reserva.clienteNome} ({reserva.clienteEmail})</Typography>
                  <Typography>Telefone: {reserva.clienteTelefone}</Typography>
                  <Typography>CPF: {reserva.clienteCpf}</Typography>
                  <Typography>userId: {reserva.userId}</Typography>
                  <Typography>clienteId: {reserva.clienteId}</Typography>
                  <Typography>Pagamento:</Typography>
                  {reserva.pagamento && (
                    <Box ml={2} mb={1}>
                      <Typography variant="body2">Status: {reserva.pagamento.status}</Typography>
                      <Typography variant="body2">ID: {reserva.pagamento.paymentId}</Typography>
                      <Typography variant="body2">Tipo: {reserva.pagamento.paymentType}</Typography>
                      <Typography variant="body2">Valor: R$ {reserva.pagamento.transactionAmount}</Typography>
                      <Typography variant="body2">Criado em: {String(reserva.pagamento.dateCreated)}</Typography>
                      <Typography variant="body2">Aprovado em: {String(reserva.pagamento.dateApproved)}</Typography>
                      <Typography variant="body2">Descrição: {reserva.pagamento.description}</Typography>
                    </Box>
                  )}
                  <Typography variant="body2" color="text.secondary">Criado em: {String(reserva.criadoEm?.toDate ? reserva.criadoEm.toDate().toLocaleString() : reserva.criadoEm)}</Typography>
                  <Typography variant="body2" color="text.secondary">Atualizado em: {String(reserva.atualizadoEm?.toDate ? reserva.atualizadoEm.toDate().toLocaleString() : reserva.atualizadoEm)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AreaCliente;
