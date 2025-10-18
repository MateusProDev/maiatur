// ExpandableText.js
import React, { useState } from "react";
import "./ExpandableText.css"; // Você pode incluir as regras abaixo neste arquivo ou adicioná-las ao seu CSS geral

const ExpandableText = ({ text, maxLength = 100 }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null; // Se não houver texto, não renderiza nada

  // Se o texto for menor ou igual ao limite, exibe-o normalmente
  if (text.length <= maxLength) {
    return <p className="descricao">{text}</p>;
  }

  return (
    <div className="expandable-text">
      {expanded ? (
        <>
          <p className="descricao">{text}</p>
          <span className="ver-mais" onClick={() => setExpanded(false)}>
            Ver menos
          </span>
        </>
      ) : (
        <>
          <p className="descricao">
            {text.substring(0, maxLength)}...
          </p>
          <span className="ver-mais" onClick={() => setExpanded(true)}>
            Ver mais
          </span>
        </>
      )}
    </div>
  );
};

export default ExpandableText;
