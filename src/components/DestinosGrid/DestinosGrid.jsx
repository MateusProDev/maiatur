import React from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';

const destinos = [
  {
    nome: 'Praias Paradisíacas',
    imagem: 'https://source.unsplash.com/random/800x600?beach',
    slug: 'praias',
  },
  {
    nome: 'Cidades Históricas',
    imagem: 'https://source.unsplash.com/random/800x600?history',
    slug: 'cidades-historicas',
  },
  {
    nome: 'Aventura na Montanha',
    imagem: 'https://source.unsplash.com/random/800x600?mountain',
    slug: 'aventura-montanha',
  },
];

const DestinosGrid = () => {
  return (
    <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h2" gutterBottom textAlign="center" sx={{ mb: 6 }}>
          Explore Nossos Destinos
        </Typography>
        <Grid container spacing={4}>
          {destinos.map((destino, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Link to={`/destinos/${destino.slug}`} style={{ textDecoration: 'none' }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={destino.imagem}
                    alt={destino.nome}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {destino.nome}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default DestinosGrid;
