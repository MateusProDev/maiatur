import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import axios from "axios";
import RichTextEditorV2 from '../RichTextEditorV2/RichTextEditorV2';

import { 
  Box,
  Container,
  Typography, 
  Button, 
  TextField, 
  Checkbox, 
  FormControlLabel, 
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  Paper,
  IconButton,
  Divider
} from "@mui/material";
import { 
  Upload as UploadIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  Image as ImageIcon,
  AttachMoney as MoneyIcon
} from "@mui/icons-material";
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import "./AdminPacotes.css";

const AdminPacotes = () => {
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState({
    list: true,
    upload: false,
    saving: false
  });
  const [currentPacote, setCurrentPacote] = useState({
    titulo: "",
    descricao: "",
    descricaoCurta: "",
    preco: 0,
    mostrarPreco: true, // Nova opção para ocultar preço
    imagens: [],
    destaque: false,
    slug: "",
    // Configurações de ida e volta
    isIdaEVolta: false,
    precoIda: 0,
    precoVolta: 0,
    precoIdaVolta: 0
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });

  useEffect(() => {
    const fetchPacotes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'pacotes'));
        const pacotesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPacotes(pacotesData);
      } catch (err) {
        showNotification("error", "Erro ao carregar pacotes");
        console.error("Erro ao buscar pacotes:", err);
      } finally {
        setLoading(prev => ({ ...prev, list: false }));
      }
    };
    fetchPacotes();
  }, []);

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, duration);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    if (!file.type.match("image.*")) {
      showNotification("error", "Por favor, selecione um arquivo de imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "A imagem deve ter no máximo 5MB");
      return;
    }

    setLoading({ ...loading, upload: true });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qc7tkpck");
    formData.append("cloud_name", "doeiv6m4h");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload",
        formData
      );
      
      setCurrentPacote(prev => ({ 
        ...prev, 
        imagens: [...prev.imagens, response.data.secure_url] 
      }));
      
      showNotification("success", "Imagem enviada com sucesso!");
    } catch (error) {
      showNotification("error", "Erro ao enviar imagem");
      console.error("Erro no upload:", error);
    } finally {
      setLoading({ ...loading, upload: false });
    }
  };

  const removeImage = (index) => {
    setCurrentPacote(prev => {
      const newImages = [...prev.imagens];
      newImages.splice(index, 1);
      return { ...prev, imagens: newImages };
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este pacote?')) {
      try {
        await deleteDoc(doc(db, 'pacotes', id));
        setPacotes(pacotes.filter(pacote => pacote.id !== id));
        showNotification("success", "Pacote excluído com sucesso!");
      } catch (err) {
        showNotification("error", "Erro ao excluir pacote");
        console.error("Erro ao excluir pacote:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPacote.titulo.trim()) {
      showNotification("error", "O título do pacote é obrigatório");
      return;
    }

    if (currentPacote.imagens.length === 0) {
      showNotification("error", "Adicione pelo menos uma imagem");
      return;
    }

    // Gerar slug automaticamente se estiver vazio
    let slug = currentPacote.slug;
    if (!slug.trim()) {
      slug = currentPacote.titulo
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
    }

    setLoading({ ...loading, saving: true });

    try {
      const pacoteData = {
        titulo: currentPacote.titulo,
        descricao: currentPacote.descricao || '',
        descricaoCurta: currentPacote.descricaoCurta || '',
        preco: Number(currentPacote.preco) || 0,
        mostrarPreco: currentPacote.mostrarPreco !== false,
        imagens: currentPacote.imagens || [],
        destaque: currentPacote.destaque || false,
        slug: slug,
        isIdaEVolta: currentPacote.isIdaEVolta || false,
        precoIda: currentPacote.isIdaEVolta ? Number(currentPacote.precoIda) || 0 : 0,
        precoVolta: currentPacote.isIdaEVolta ? Number(currentPacote.precoVolta) || 0 : 0,
        precoIdaVolta: currentPacote.isIdaEVolta ? Number(currentPacote.precoIdaVolta) || 0 : 0,
        createdAt: currentPacote.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (currentPacote.id) {
        // Atualizar existente
        await setDoc(doc(db, "pacotes", currentPacote.id), pacoteData);
        showNotification("success", "Pacote atualizado com sucesso!");
      } else {
        // Criar novo
        const newDocRef = doc(collection(db, "pacotes"));
        await setDoc(newDocRef, { ...pacoteData, id: newDocRef.id });
        showNotification("success", "Pacote criado com sucesso!");
      }

      // Recarregar lista
      const querySnapshot = await getDocs(collection(db, 'pacotes'));
      setPacotes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Resetar formulário
      setCurrentPacote({
        titulo: "",
        descricao: "",
        descricaoCurta: "",
        preco: 0,
        mostrarPreco: true,
        imagens: [],
        destaque: false,
        slug: "",
        isIdaEVolta: false,
        precoIda: 0,
        precoVolta: 0,
        precoIdaVolta: 0
      });
      
    } catch (error) {
      showNotification("error", "Erro ao salvar pacote");
      console.error("Erro ao salvar:", error);
    } finally {
      setLoading({ ...loading, saving: false });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentPacote(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleDescriptionChange = (content) => {
    setCurrentPacote(prev => ({ 
      ...prev, 
      descricao: content 
    }));
  };

  const editPacote = (pacote) => {
    setCurrentPacote({
      ...pacote,
      preco: Number(pacote.preco) || 0,
      mostrarPreco: pacote.mostrarPreco !== false,
      isIdaEVolta: pacote.isIdaEVolta || false,
      precoIda: Number(pacote.precoIda) || 0,
      precoVolta: Number(pacote.precoVolta) || 0,
      precoIdaVolta: Number(pacote.precoIdaVolta) || 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
            Gerenciamento de Pacotes
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Crie e gerencie pacotes turísticos com facilidade
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCurrentPacote({
              titulo: "",
              descricao: "",
              descricaoCurta: "",
              preco: 0,
              mostrarPreco: true,
              imagens: [],
              destaque: false,
              slug: "",
              isIdaEVolta: false,
              precoIda: 0,
              precoVolta: 0,
              precoIdaVolta: 0,
              // Valores fixos divididos
              valorSinal: 0,
              valorPrimeiraViagem: 0,
              valorSegundaViagem: 0,
              // Campos de compatibilidade
              valorSinalCalculado: 0,
              valorParaMotorista: 0,
              porcentagemSinalPadrao: 40
            })}
            sx={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              }
            }}
          >
            Criar Novo Pacote
          </Button>
        </Box>
      </Box>

      {notification.show && (
        <Alert 
          severity={notification.type} 
          sx={{ mb: 3 }}
          onClose={() => setNotification({ show: false, type: "", message: "" })}
        >
          {notification.message}
        </Alert>
      )}

      {/* Formulário de Edição/Criação */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <InventoryIcon sx={{ fontSize: 35, color: '#667eea' }} />
          <Box>
            <Typography variant="h6" sx={{ mb: 0 }}>
              {currentPacote.id ? "Editar Pacote" : "Criar Novo Pacote"}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.9rem' }}>
              {currentPacote.id ? "Atualize as informações do pacote" : "Preencha os dados do novo pacote turístico"}
            </Typography>
          </Box>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Título do Pacote"
                name="titulo"
                value={currentPacote.titulo}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Slug (URL amigável)"
                name="slug"
                value={currentPacote.slug}
                onChange={handleChange}
                margin="normal"
                helperText="Deixe em branco para gerar automaticamente"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição Curta"
                name="descricaoCurta"
                value={currentPacote.descricaoCurta}
                onChange={handleChange}
                required
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Descrição Completa *
              </Typography>
              <RichTextEditorV2
                value={currentPacote.descricao}
                onChange={handleDescriptionChange}
                placeholder="Digite a descrição completa do pacote usando Markdown. Seja detalhado sobre o que está incluído, itinerário, e observações importantes."
                height={350}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Preço do Pacote"
                name="preco"
                type="number"
                value={currentPacote.preco}
                onChange={handleChange}
                required
                margin="normal"
                inputProps={{ step: "0.01", min: "0" }}
                helperText="Digite 0 se quiser ocultar o preço"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="mostrarPreco"
                    checked={currentPacote.mostrarPreco !== false}
                    onChange={(e) => setCurrentPacote({...currentPacote, mostrarPreco: e.target.checked})}
                  />
                }
                label="Mostrar preço no site (desmarque para ocultar)"
                style={{ marginTop: '20px' }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="destaque"
                    checked={currentPacote.destaque}
                    onChange={handleChange}
                  />
                }
                label="Destacar este pacote"
              />
            </Grid>
            
            {/* Configurações de Ida e Volta */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                🚍 Configurações de Viagem
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isIdaEVolta"
                    checked={currentPacote.isIdaEVolta}
                    onChange={handleChange}
                  />
                }
                label="Este pacote oferece opção de ida e volta"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                mb: 2,
                p: 2,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
                borderRadius: 2,
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}>
                <ImageIcon sx={{ color: '#667eea', fontSize: 28 }} />
                <Typography variant="subtitle1" sx={{ mb: 0 }}>
                  Imagens do Pacote
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {currentPacote.imagens.map((img, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={img}
                        alt={`Imagem ${index + 1}`}
                      />
                      <CardActions>
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          color="error"
                        >
                          <CloseIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                
                <Grid item xs={6} sm={4} md={3}>
                  <label htmlFor="upload-image">
                    <input
                      id="upload-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <Button
                      component="span"
                      variant="outlined"
                      fullWidth
                      sx={{ height: '100%', minHeight: '180px' }}
                      disabled={loading.upload}
                    >
                      {loading.upload ? (
                        <CircularProgress size={24} />
                      ) : (
                        <>
                          <UploadIcon sx={{ mr: 1 }} />
                          Adicionar Imagem
                        </>
                      )}
                    </Button>
                  </label>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {currentPacote.id && (
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentPacote({
                      titulo: "",
                      descricao: "",
                      descricaoCurta: "",
                      preco: 0,
                      precoOriginal: 0,
                      imagens: [],
                      destaque: false,
                      slug: ""
                    })}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading.saving || loading.upload}
                  startIcon={loading.saving ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {currentPacote.id ? "Atualizar" : "Salvar"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Lista de Pacotes */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3,
        mt: 5
      }}>
        <InventoryIcon sx={{ fontSize: 32, color: '#667eea' }} />
        <Typography variant="h5" sx={{ mb: 0 }}>
          Pacotes Cadastrados
        </Typography>
        <Box sx={{ 
          ml: 'auto', 
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          px: 2,
          py: 0.5,
          borderRadius: 20,
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {pacotes.length} {pacotes.length === 1 ? 'pacote' : 'pacotes'}
        </Box>
      </Box>
      
      {loading.list ? (
        <LoadingSpinner size="large" text="Carregando pacotes..." />
      ) : pacotes.length === 0 ? (
        <Paper sx={{ 
          p: 6, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03), rgba(118, 75, 162, 0.03))',
          border: '2px dashed rgba(102, 126, 234, 0.2)',
          borderRadius: 3
        }}>
          <InventoryIcon sx={{ fontSize: 64, color: '#667eea', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Nenhum pacote cadastrado ainda
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comece criando seu primeiro pacote turístico
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Criar Primeiro Pacote
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3} sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 3
        }}>
          {pacotes.map(pacote => (
            <Grid item key={pacote.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                minHeight: '420px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {pacote.destaque && (
                  <Box sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                    zIndex: 1
                  }}>
                    ⭐ Destaque
                  </Box>
                )}
                {pacote.imagens && pacote.imagens.length > 0 && (
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={pacote.imagens[0]}
                      alt={pacote.titulo}
                      sx={{ 
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }}
                    />
                    {pacote.imagens.length > 1 && (
                      <Box sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <ImageIcon sx={{ fontSize: 14 }} />
                        {pacote.imagens.length} fotos
                      </Box>
                    )}
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Typography gutterBottom variant="h6" sx={{ 
                    fontSize: '1.15rem',
                    lineHeight: 1.3,
                    minHeight: '2.6rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontWeight: 700,
                    color: '#1f2937'
                  }}>
                    {pacote.titulo}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 2.5,
                    minHeight: '3rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.6
                  }}>
                    {pacote.descricaoCurta}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    mt: 'auto',
                    pt: 2,
                    borderTop: '1px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <MoneyIcon sx={{ color: '#667eea', fontSize: 24 }} />
                    <Box>
                      {pacote.precoOriginal && (
                        <Typography variant="body2" sx={{ 
                          textDecoration: 'line-through',
                          color: '#9ca3af',
                          fontSize: '0.85rem'
                        }}>
                          R$ {Number(pacote.precoOriginal).toFixed(2).replace('.', ',')}
                        </Typography>
                      )}
                      <Typography variant="h6" sx={{ 
                        fontWeight: 800, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '1.5rem',
                        lineHeight: 1
                      }}>
                        R$ {Number(pacote.preco).toFixed(2).replace('.', ',')}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ 
                  justifyContent: 'space-between', 
                  p: 2, 
                  pt: 0,
                  gap: 1
                }}>
                  <Button
                    size="medium"
                    startIcon={<EditIcon />}
                    onClick={() => editPacote(pacote)}
                    sx={{ 
                      flex: 1,
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="medium"
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => handleDelete(pacote.id)}
                    sx={{ 
                      flex: 1,
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Excluir
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminPacotes;