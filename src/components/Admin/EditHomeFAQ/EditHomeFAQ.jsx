import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown } from "react-icons/fi";
import "./EditHomeFAQ.css";

const EditHomeFAQ = () => {
  const navigate = useNavigate();
  const [faqData, setFaqData] = useState({
    title: 'Perguntas Frequentes',
    subtitle: 'Encontre respostas para as dúvidas mais comuns',
    faq: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchFAQData = async () => {
      try {
        const faqRef = doc(db, "content", "homeFAQ");
        const faqDoc = await getDoc(faqRef);
        if (faqDoc.exists()) {
          const data = faqDoc.data();
          setFaqData({
            title: data.title || 'Perguntas Frequentes',
            subtitle: data.subtitle || 'Encontre respostas para as dúvidas mais comuns',
            faq: Array.isArray(data.faq) ? data.faq : []
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    fetchFAQData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      await setDoc(doc(db, "content", "homeFAQ"), faqData);
      setSuccess("Dados salvos com sucesso!");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setError("Erro ao salvar dados");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFAQ = () => {
    setFaqData(prev => ({
      ...prev,
      faq: [...prev.faq, { pergunta: '', resposta: '' }]
    }));
  };

  const handleRemoveFAQ = (index) => {
    setFaqData(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }));
  };

  const handleFAQChange = (index, field, value) => {
    setFaqData(prev => {
      const newFAQ = [...prev.faq];
      newFAQ[index][field] = value;
      return { ...prev, faq: newFAQ };
    });
  };

  const moveFAQ = (index, direction) => {
    setFaqData(prev => {
      const newFAQ = [...prev.faq];
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < newFAQ.length) {
        [newFAQ[index], newFAQ[newIndex]] = [newFAQ[newIndex], newFAQ[index]];
      }
      return { ...prev, faq: newFAQ };
    });
  };

  if (loading) {
    return (
      <div className="edit-home-faq">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="edit-home-faq">
      <h2>Editar FAQ da Página Inicial</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Cabeçalho</h3>
          <div className="form-group">
            <label>Título da Seção</label>
            <input
              type="text"
              value={faqData.title}
              onChange={(e) => setFaqData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Subtítulo</label>
            <textarea
              value={faqData.subtitle}
              onChange={(e) => setFaqData(prev => ({ ...prev, subtitle: e.target.value }))}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Perguntas e Respostas</h3>
          <div className="faq-list">
            {faqData.faq.map((item, index) => (
              <div key={index} className="faq-item-edit">
                <div className="faq-item-header">
                  <span className="faq-item-number">#{index + 1}</span>
                  <div className="faq-item-actions">
                    <button
                      type="button"
                      onClick={() => moveFAQ(index, -1)}
                      disabled={index === 0}
                      className="move-btn"
                      title="Mover para cima"
                    >
                      <FiChevronUp />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFAQ(index, 1)}
                      disabled={index === faqData.faq.length - 1}
                      className="move-btn"
                      title="Mover para baixo"
                    >
                      <FiChevronDown />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFAQ(index)}
                      className="delete-btn"
                      title="Remover"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Pergunta</label>
                  <input
                    type="text"
                    value={item.pergunta}
                    onChange={(e) => handleFAQChange(index, 'pergunta', e.target.value)}
                    placeholder="Digite a pergunta..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Resposta</label>
                  <textarea
                    value={item.resposta}
                    onChange={(e) => handleFAQChange(index, 'resposta', e.target.value)}
                    placeholder="Digite a resposta..."
                    required
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddFAQ}
            className="add-faq-btn"
          >
            <FiPlus />
            Adicionar Pergunta
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="save-button">
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/admin/dashboard")} 
            className="cancel-button"
            disabled={saving}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditHomeFAQ;
