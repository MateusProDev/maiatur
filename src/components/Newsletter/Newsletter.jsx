import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';
import { Email, Send } from '@mui/icons-material';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      setSnackbarMessage('Por favor, insira seu email');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    if (!emailRegex.test(email)) {
      setSnackbarMessage('Por favor, insira um email válido');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Aqui você pode adicionar a lógica para salvar no Firebase
    console.log('Email cadastrado:', email);
    
    setSnackbarMessage('Parabéns! Você está inscrito na nossa newsletter!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    setEmail('');
  };

  return (
    <section className="newsletter-section">
      <Container maxWidth="md">
        <Box className="newsletter-content">
          <Box className="newsletter-icon">
            <Email />
          </Box>
          <Typography variant="h3" className="newsletter-title">
            Receba Ofertas Exclusivas
          </Typography>
          <Typography variant="body1" className="newsletter-description">
            Inscreva-se na nossa newsletter e receba promoções especiais,<br />
            dicas de viagem e os melhores destinos direto no seu email
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} className="newsletter-form">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Digite seu melhor email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
              InputProps={{
                startAdornment: <Email className="input-icon" />,
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              className="newsletter-button"
              endIcon={<Send />}
            >
              Inscrever-se
            </Button>
          </Box>

          <Typography variant="caption" className="newsletter-note">
            🔒 Seus dados estão seguros. Não compartilhamos com terceiros.
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </section>
  );
};

export default Newsletter;
