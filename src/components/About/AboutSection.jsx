import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const AboutSection = () => {
  return (
    <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom textAlign="center">
            Sobre Nós
          </Typography>
          <Typography variant="body1" paragraph>
            Somos uma agência de turismo apaixonada por criar experiências inesquecíveis. Nossa missão é conectar pessoas a novos destinos, culturas e aventuras, sempre com segurança e conforto.
          </Typography>
          <Typography variant="body1">
            Com anos de experiência no mercado, nossa equipe de especialistas está pronta para planejar a viagem dos seus sonhos, cuidando de todos os detalhes para que você possa relaxar e aproveitar ao máximo.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutSection;
