// src/components/MarkdownRenderer/MarkdownRenderer.jsx
import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Box } from '@mui/material';
import './MarkdownRenderer.css';

const MarkdownRenderer = ({ content, className }) => {
  if (!content) {
    return <Box sx={{ p: 2, fontStyle: 'italic', color: 'text.secondary' }}>
      Nenhuma descrição disponível
    </Box>;
  }

  return (
    <Box className={`markdown-content ${className || ''}`}>
      <div data-color-mode="light">
        <MDEditor.Markdown 
          source={content} 
          style={{ 
            whiteSpace: 'pre-wrap',
            backgroundColor: 'transparent',
            color: 'inherit'
          }}
        />
      </div>
    </Box>
  );
};

export default MarkdownRenderer;
