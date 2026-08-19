// src/components/RichTextEditorV2/RichTextEditorV2.jsx
import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import './RichTextEditorV2.css';

const RichTextEditorV2 = ({ value, onChange, placeholder, height = 400 }) => {
  const [colorMenuAnchor, setColorMenuAnchor] = React.useState(null);

  const insertTemplate = () => {
    const template = `## 🌟 Sobre este Pacote

Descreva aqui as principais características do pacote turístico.

### 📍 O que está incluído:

- **Transporte:** {color:green}Veículo confortável com ar-condicionado{color}
- **Hospedagem:** Informações sobre acomodação  
- **Alimentação:** Detalhes das refeições
- **Passeios:** Lista dos passeios inclusos

### ⏰ Itinerário:

**Dia 1:** Chegada e acomodação  
**Dia 2:** {highlight}Principais atividades{highlight}  
**Dia 3:** Retorno

> 💡 **Dica especial:** Adicione informações importantes ou dicas extras aqui.

### 📋 Observações importantes:

Liste aqui informações importantes sobre documentos, vacinas, clima, etc.`;
    
    onChange(template);
  };

  const insertColorSyntax = (color) => {
    const syntax = `{color:${color}}`;
    onChange((value || '') + syntax);
    setColorMenuAnchor(null);
  };

  const insertHighlightSyntax = () => {
    const syntax = `{highlight}`;
    onChange((value || '') + syntax);
    setColorMenuAnchor(null);
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
            onClick={(e) => setColorMenuAnchor(e.currentTarget)}
            sx={{ color: '#21A657', borderColor: '#21A657' }}
          >
            🎨 Cores
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={insertHighlightSyntax}
            sx={{ color: '#f59e0b', borderColor: '#f59e0b' }}
          >
            🖍️ Destaque
          </Button>
        </Box>
      </Box>
      
      <Menu
        anchorEl={colorMenuAnchor}
        open={Boolean(colorMenuAnchor)}
        onClose={() => setColorMenuAnchor(null)}
      >
        <MenuItem onClick={() => insertColorSyntax('green')} sx={{ color: '#21A657' }}>
          Verde Corporativo
        </MenuItem>
        <MenuItem onClick={() => insertColorSyntax('orange')} sx={{ color: '#EE7C35' }}>
          Laranja
        </MenuItem>
        <MenuItem onClick={() => insertColorSyntax('blue')} sx={{ color: '#3b82f6' }}>
          Azul
        </MenuItem>
        <MenuItem onClick={() => insertColorSyntax('red')} sx={{ color: '#ef4444' }}>
          Vermelho
        </MenuItem>
        <MenuItem onClick={() => insertColorSyntax('purple')} sx={{ color: '#8b5cf6' }}>
          Roxo
        </MenuItem>
      </Menu>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use Markdown ou sintaxe customizada: {`{color:green}texto{}`}{`{color}`} para cores e {`{highlight}texto{highlight}`} para destaque
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
        💡 Sintaxe: {`{color:green}texto{color}`} - cores: green, orange, blue, red, purple. {`{highlight}texto{highlight}`} para destaque amarelo.
      </Typography>
    </Box>
  );
};

export default RichTextEditorV2;
