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

  // Parse custom color syntax: {color:green}texto{color}
  // Parse custom highlight syntax: {highlight}texto{highlight}
  const parseCustomSyntax = (text) => {
    let processed = text;
    
    // Parse color syntax
    processed = processed.replace(/\{color:([a-z]+)\}([^{]+)\{color\}/gi, (match, color, content) => {
      const colorMap = {
        green: '#21A657',
        orange: '#EE7C35',
        blue: '#3b82f6',
        red: '#ef4444',
        purple: '#8b5cf6'
      };
      const hexColor = colorMap[color.toLowerCase()] || color;
      return `<span style="color: ${hexColor}; font-weight: 600;">${content}</span>`;
    });
    
    // Parse highlight syntax
    processed = processed.replace(/\{highlight\}([^{]+)\{highlight\}/gi, (match, content) => {
      return `<mark style="background-color: #fff3cd; padding: 2px 4px; border-radius: 4px;">${content}</mark>`;
    });
    
    return processed;
  };

  const processedContent = parseCustomSyntax(content);

  return (
    <Box className={`markdown-content ${className || ''}`}>
      <div data-color-mode="light">
        <MDEditor.Markdown 
          source={processedContent} 
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
