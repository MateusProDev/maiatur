import React from 'react';
import { Box, Typography, Container, Grid, Paper, Avatar } from '@mui/material';
import { Star } from '@mui/icons-material';

const depoimentos = [
  {
    nome: 'Maria Silva',
    avatar: 'https://i.pravatar.cc/150?img=1',
    texto: 'Viagem incrível! Tudo foi perfeitamente organizado, desde o roteiro até a hospedagem. Recomendo a todos!',
    estrelas: 5,
  },
  {
    nome: 'João Pereira',
    avatar: 'https://i.pravatar.cc/150?img=2',
    texto: 'Uma das melhores experiências da minha vida. A equipe foi super atenciosa e os guias eram excelentes. Com certeza viajarei com eles novamente.',
    estrelas: 5,
  },
  {
    nome: 'Ana Costa',
    avatar: 'https://i.pravatar.cc/150?img=3',
    texto: 'O pacote superou minhas expectativas. Lugares maravilhosos e um serviço impecável. Mal posso esperar pela próxima aventura!',
    estrelas: 5,
  },
];

const Depoimentos = () => {
  return (
    <Box sx={{ py: 8, backgroundColor: '#fff' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h2" gutterBottom textAlign="center" sx={{ mb: 6 }}>
          O que nossos clientes dizem
        </Typography>
        <Grid container spacing={4}>
          {depoimentos.map((depoimento, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <Avatar src={depoimento.avatar} alt={depoimento.nome} sx={{ width: 80, height: 80, mb: 2 }} />
                <Typography variant="h6" component="h3" gutterBottom>
                  {depoimento.nome}
                </Typography>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  {Array.from({ length: depoimento.estrelas }).map((_, i) => (
                    <Star key={i} sx={{ color: '#FFD700' }} />
                  ))}
                </Box>
                <Typography variant="body1" textAlign="center">
                  "{depoimento.texto}"
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Depoimentos;
