import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import "./Boxes.css";

const Boxes = () => {
  const [sections, setSections] = useState([]);
  const [activeBox, setActiveBox] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const boxesRef = doc(db, "content", "boxes");
    const unsubscribe = onSnapshot(boxesRef, (docSnap) => {
      if (docSnap.exists()) {
        setSections(docSnap.data().sections || []);
      } else {
        console.log("Seções não encontradas!");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLearnMore = () => {
    // Corrigido para usar a rota definida no App.js
    navigate("/pacotes");
  };

  return (
    <div className="boxes-wrapper">
      {sections.map((section, sectionIndex) => (
        <section key={sectionIndex} className="boxes-section">
          <h2 className="boxes-section-title">
            <span className="title-decoration">{section.title}</span>
          </h2>
          <div className="boxes-grid">
            {section.boxes.map((box, boxIndex) => (
              <article 
                key={boxIndex} 
                className={`box-item ${activeBox === boxIndex ? 'active' : ''}`}
                onMouseEnter={() => setActiveBox(boxIndex)}
                onMouseLeave={() => setActiveBox(null)}
                onClick={() => setActiveBox(activeBox === boxIndex ? null : boxIndex)}
              >
                <div className="box-image-container">
                  <img 
                    src={box.imageUrl} 
                    alt={box.title} 
                    className="box-image" 
                    loading="lazy"
                  />
                  <div className="image-overlay"></div>
                </div>
                <div className="box-content-wrapper">
                  <h3 className="box-title">{box.title}</h3>
                  <p className="box-content">{box.content}</p>
                  <button 
                    className="box-action-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLearnMore();
                    }}
                    type="button"
                  >
                    Saiba mais
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="box-corner-decoration"></div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Boxes;