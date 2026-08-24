import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./EditCategories.css";
import { FiSave, FiChevronDown, FiPackage, FiMapPin, FiSettings, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Estado inicial das categorias
const initialCategoriesData = {
  passeio: {
    nome: "Passeios e Experiências",
    descricao: "Descubra experiências únicas e passeios inesquecíveis"
  },
  transfer_chegada: {
    nome: "Transfers e Traslados",
    descricao: "Transporte confortável e seguro para todos os destinos"
  },
  transfer_saida: {
    nome: "Transfers e Traslados",
    descricao: "Transporte confortável e seguro para todos os destinos"
  },
  transfer_chegada_saida: {
    nome: "Transfers e Traslados",
    descricao: "Transporte confortável e seguro para todos os destinos"
  },
  transfer_entre_hoteis: {
    nome: "Transfers e Traslados",
    descricao: "Transporte confortável e seguro para todos os destinos"
  },
  beach_park: {
    nome: "Beach Park",
    descricao: "O maior parque aquático da América Latina"
  }
};

const EditCategories = () => {
  const navigate = useNavigate();
  const [categoriesData, setCategoriesData] = useState(initialCategoriesData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    passeio: true,
    transfer: true,
    beach_park: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Busca os dados do Firestore e mescla com o estado inicial
  useEffect(() => {
    let isMounted = true;
    const fetchCategoriesData = async () => {
      setLoading(true);
      try {
        const categoriesRef = doc(db, "content", "categories");
        const categoriesDoc = await getDoc(categoriesRef);
        if (categoriesDoc.exists() && isMounted) {
          const data = categoriesDoc.data();
          setCategoriesData({
            ...initialCategoriesData,
            ...(data || {})
          });
        } else {
          console.log("Categorias não encontradas! Utilizando valores iniciais.");
          setCategoriesData(initialCategoriesData);
        }
      } catch (err) {
        console.error("Erro ao buscar dados das categorias:", err);
        setError("Erro ao carregar os dados das categorias.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Atualiza um campo de uma categoria específica
  const updateCategoryField = (category, field, value) => {
    setCategoriesData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Salva os dados no Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaveMessage("");
    
    try {
      const categoriesRef = doc(db, "content", "categories");
      await setDoc(categoriesRef, categoriesData);
      setSaveMessage("✅ Categorias atualizadas com sucesso!");
      
      // Remove mensagem após 3 segundos
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
      
    } catch (err) {
      console.error("Erro ao salvar categorias:", err);
      setError("Erro ao salvar as alterações.");
      setSaveMessage("❌ Erro ao salvar!");
      
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p className="loading-text">Carregando dados das categorias...</p>
      </div>
    );
  }

  return (
    <div className="edit-categories">
      <div className="edit-categories-header">
        <button className="back-button" onClick={() => navigate("/admin")}>
          <FiArrowLeft />
          Voltar ao Dashboard
        </button>
        <h2>Editar Categorias</h2>
      </div>
      
      {saveMessage && (
        <div className={`save-indicator ${error ? 'error' : ''}`}>
          {saveMessage}
        </div>
      )}

      {error && <p className="error">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        {/* Seção Passeios */}
        <div className="form-section">
          <div 
            className="section-with-icon" 
            onClick={() => toggleSection('passeio')}
            style={{ cursor: 'pointer' }}
          >
            <div className="section-icon"><FiMapPin /></div>
            <h3>Passeios e Experiências</h3>
            <FiChevronDown 
              style={{ 
                marginLeft: 'auto', 
                transition: 'transform 0.3s',
                transform: expandedSections.passeio ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </div>
          
          {expandedSections.passeio && (
            <div className="form-group">
              <div className="form-field">
                <label>Título da Categoria</label>
                <input
                  type="text"
                  value={categoriesData.passeio?.nome || ""}
                  onChange={(e) => updateCategoryField("passeio", "nome", e.target.value)}
                  placeholder="Passeios e Experiências"
                  required
                />
              </div>
              <div className="form-field">
                <label>Descrição da Categoria</label>
                <textarea
                  value={categoriesData.passeio?.descricao || ""}
                  onChange={(e) => updateCategoryField("passeio", "descricao", e.target.value)}
                  rows="3"
                  placeholder="Descubra experiências únicas e passeios inesquecíveis"
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Seção Transfers */}
        <div className="form-section">
          <div 
            className="section-with-icon" 
            onClick={() => toggleSection('transfer')}
            style={{ cursor: 'pointer' }}
          >
            <div className="section-icon"><FiSettings /></div>
            <h3>Transfers e Traslados</h3>
            <FiChevronDown 
              style={{ 
                marginLeft: 'auto', 
                transition: 'transform 0.3s',
                transform: expandedSections.transfer ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </div>
          
          {expandedSections.transfer && (
            <div className="form-group">
              <div className="form-field">
                <label>Título da Categoria Transfer</label>
                <input
                  type="text"
                  value={categoriesData.transfer_chegada?.nome || ""}
                  onChange={(e) => updateCategoryField("transfer_chegada", "nome", e.target.value)}
                  placeholder="Transfers e Traslados"
                  required
                />
                <small className="form-hint">Este título será aplicado a todos os tipos de transfer (chegada, saída, chegada+saida, entre hotéis)</small>
              </div>
              <div className="form-field">
                <label>Descrição da Categoria Transfer</label>
                <textarea
                  value={categoriesData.transfer_chegada?.descricao || ""}
                  onChange={(e) => updateCategoryField("transfer_chegada", "descricao", e.target.value)}
                  rows="3"
                  placeholder="Transporte confortável e seguro para todos os destinos"
                  required
                />
                <small className="form-hint">Esta descrição será aplicada a todos os tipos de transfer</small>
              </div>
            </div>
          )}
        </div>

        {/* Seção Beach Park */}
        <div className="form-section">
          <div 
            className="section-with-icon" 
            onClick={() => toggleSection('beach_park')}
            style={{ cursor: 'pointer' }}
          >
            <div className="section-icon"><FiPackage /></div>
            <h3>Beach Park</h3>
            <FiChevronDown 
              style={{ 
                marginLeft: 'auto', 
                transition: 'transform 0.3s',
                transform: expandedSections.beach_park ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </div>
          
          {expandedSections.beach_park && (
            <div className="form-group">
              <div className="form-field">
                <label>Título da Categoria Beach Park</label>
                <input
                  type="text"
                  value={categoriesData.beach_park?.nome || ""}
                  onChange={(e) => updateCategoryField("beach_park", "nome", e.target.value)}
                  placeholder="Beach Park"
                  required
                />
              </div>
              <div className="form-field">
                <label>Descrição da Categoria Beach Park</label>
                <textarea
                  value={categoriesData.beach_park?.descricao || ""}
                  onChange={(e) => updateCategoryField("beach_park", "descricao", e.target.value)}
                  rows="3"
                  placeholder="O maior parque aquático da América Latina"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving} className="save-button">
          {saving ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
              Salvando...
            </>
          ) : (
            <>
              <FiSave />
              Salvar Alterações
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EditCategories;