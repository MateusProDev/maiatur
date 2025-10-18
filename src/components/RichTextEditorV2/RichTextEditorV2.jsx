// src/components/RichTextEditorV2/RichTextEditorV2.jsx
import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Box, Typography, Button } from '@mui/material';
import './RichTextEditorV2.css';

const RichTextEditorV2 = ({ value, onChange, placeholder, height = 400 }) => {
  const insertTemplate = () => {
    const template = `## 🌟 Sobre este Pacote

Descreva aqui as principais características do pacote turístico.

### 📍 O que está incluído:

- **Transporte:** Descrição do transporte
- **Hospedagem:** Informações sobre acomodação  
- **Alimentação:** Detalhes das refeições
- **Passeios:** Lista dos passeios inclusos

### ⏰ Itinerário:

**Dia 1:** Chegada e acomodação  
**Dia 2:** Principais atividades  
**Dia 3:** Retorno

> 💡 **Dica especial:** Adicione informações importantes ou dicas extras aqui.

### 📋 Observações importantes:

Liste aqui informações importantes sobre documentos, vacinas, clima, etc.`;
    
    onChange(template);
  };

  return (
    <Box className="rich-text-editor-v2">
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" component="h3">
          📝 Editor de Descrição (Markdown)
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={insertTemplate}
          sx={{ ml: 'auto' }}
        >
          📝 Inserir Template
        </Button>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use a sintaxe Markdown para formatar o texto. Ex: **negrito**, *itálico*, 
        ### títulos, - listas, {'>'}citações
      </Typography>

      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview="edit"
        hideToolbar={false}
        visibleDragBar={false}
        height={height}
        data-color-mode="light"
        style={{
          backgroundColor: '#fff'
        }}
        textareaProps={{
          placeholder: placeholder || 'Digite a descrição em Markdown...',
          style: {
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
          }
        }}
      />
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        💡 Dica: Use o botão de preview (👁️) na barra de ferramentas para visualizar como ficará formatado
      </Typography>
    </Box>
  );
};

export default RichTextEditorV2;
