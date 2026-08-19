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

  const insertColoredText = () => {
    const coloredText = `<span style="color: #21A657;">texto em destaque</span>`;
    onChange((value || '') + coloredText);
  };

  const insertHighlight = () => {
    const highlight = `<mark style="background-color: #fff3cd; padding: 2px 4px; border-radius: 4px;">texto destacado</mark>`;
    onChange((value || '') + highlight);
  };

  return (
    <Box className="rich-text-editor-v2">
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" component="h3">
          📝 Editor de Descrição
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={insertTemplate}
          >
            📝 Template
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={insertColoredText}
            sx={{ color: '#21A657', borderColor: '#21A657' }}
          >
            🎨 Cor Verde
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={insertHighlight}
            sx={{ color: '#f59e0b', borderColor: '#f59e0b' }}
          >
            🖍️ Destaque
          </Button>
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use Markdown ou HTML para formatar. Ex: **negrito**, *itálico*, ### títulos, - listas, {'>'}citações
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
            fontSize: 15,
            lineHeight: 1.8,
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            padding: '16px'
          }
        }}
        previewOptions={{
          style: {
            fontSize: 15,
            lineHeight: 1.8,
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            padding: '16px'
          }
        }}
      />
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        💡 Use os botões acima para adicionar cores e destaques. Clique em 👁️ para preview.
      </Typography>
    </Box>
  );
};

export default RichTextEditorV2;
