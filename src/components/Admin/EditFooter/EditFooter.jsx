import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./EditFooter.css";
import { FiSave, FiChevronDown, FiHome, FiPhone, FiMail, FiMapPin, FiGlobe, FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiMenu } from "react-icons/fi";

// Importação dos ícones disponíveis da pasta assets
import fbIcon1 from "../../../assets/Facebook.png";
import igIcon1 from "../../../assets/Instagram.png";
import twIcon1 from "../../../assets/GitHub.png";
import liIcon1 from "../../../assets/X.png";

// Define as opções disponíveis para cada rede social
const availableIcons = {
  facebook: [{ label: "Facebook Icon 1", value: fbIcon1 }],
  instagram: [{ label: "Instagram Icon 1", value: igIcon1 }],
  twitter: [{ label: "Twitter Icon 1", value: twIcon1 }],
  linkedin: [{ label: "LinkedIn Icon 1", value: liIcon1 }],
};

// Estado inicial completo (sem services e contact no menu)
const initialFooterData = {
  text: "",
  companyName: "",
  year: new Date().getFullYear(),
  contact: { phone: "", email: "", address: "" },
  social: {
    facebook: { link: "", logo: "", title: "Facebook" },
    instagram: { link: "", logo: "", title: "Instagram" },
    twitter: { link: "", logo: "", title: "Twitter" },
    linkedin: { link: "", logo: "", title: "LinkedIn" },
  },
  menu: { about: "", blog: "" }, // Apenas about e blog no menu
};

const EditFooter = () => {
  const navigate = useNavigate();
  const [footerData, setFooterData] = useState(initialFooterData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    company: true,
    contact: true,
    social: true,
    menu: true
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
    const fetchFooterData = async () => {
      setLoading(true);
      try {
        const footerRef = doc(db, "content", "footer");
        const footerDoc = await getDoc(footerRef);
        if (footerDoc.exists() && isMounted) {
          const data = footerDoc.data();
          setFooterData({
            text: data.text || "",
            companyName: data.companyName || "",
            year: data.year || new Date().getFullYear(),
            contact: { ...initialFooterData.contact, ...(data.contact || {}) },
            social: { ...initialFooterData.social, ...(data.social || {}) },
            menu: {
              about: data.menu?.about || "",
              blog: data.menu?.blog || "",
            }, // Apenas about e blog
          });
        } else {
          console.log("Rodapé não encontrado! Utilizando valores iniciais.");
          setFooterData(initialFooterData);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do rodapé:", err);
        setError("Erro ao carregar os dados do rodapé.");
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Atualiza um campo simples do footerData
  const updateFooterField = (field, value) => {
    setFooterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manipula a seleção do ícone da rede social a partir dos disponíveis localmente
  const handleIconSelect = (e, network) => {
    const selectedIcon = e.target.value;
    setFooterData((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        [network]: { ...prev.social[network], logo: selectedIcon },
      },
    }));
  };

  // Salva os dados no Firestore e redireciona para o painel admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaveMessage("");
    
    try {
      const footerRef = doc(db, "content", "footer");
      await setDoc(footerRef, footerData); // Salva tudo no Firestore
      setSaveMessage("✅ Rodapé atualizado com sucesso!");
      
      // Remove mensagem após 3 segundos
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
      
    } catch (err) {
      console.error("Erro ao salvar rodapé:", err);
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
        <p className="loading-text">Carregando dados do rodapé...</p>
      </div>
    );
  }

  return (
    <div className="edit-footer">
      <h2>Editar Rodapé</h2>
      
      {saveMessage && (
        <div className={`save-indicator ${error ? 'error' : ''}`}>
          {saveMessage}
        </div>
      )}

      {error && <p className="error">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        {/* Texto Principal */}
        <div className="form-section">
          <div 
            className="section-with-icon" 
            onClick={() => toggleSection('basic')}
            style={{ cursor: 'pointer' }}
          >
            <div className="section-icon">📝</div>
            <h3>Texto Principal</h3>
            <FiChevronDown 
              style={{ 
                marginLeft: 'auto', 
                transition: 'transform 0.3s',
                transform: expandedSections.basic ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </div>
          
          {expandedSections.basic && (
            <>
              <label>Texto do Rodapé</label>
              <textarea
                value={footerData.text}
                onChange={(e) => updateFooterField("text", e.target.value)}
                required
                rows="3"
                placeholder="Digite o texto que aparecerá no rodapé..."
              />
            </>
          )}
        </div>

        {/* Informações da Empresa */}
        <div className="form-section">
          <div 
            className="section-with-icon" 
            onClick={() => toggleSection('company')}
            style={{ cursor: 'pointer' }}
          >
            <div className="section-icon"><FiHome /></div>
            <h3>Informações da Empresa</h3>
            <FiChevronDown 
              style={{ 
                marginLeft: 'auto', 
                transition: 'transform 0.3s',
                transform: expandedSections.company ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </div>
          
          {expandedSections.company && (
            <div className="form-group">
              <div className="form-field">
                <label>Nome da Empresa</label>
                <input
                  type="text"
                  value={footerData.companyName}
                  onChange={(e) => updateFooterField("companyName", e.target.value)}
                  placeholder="Maiatur"
                  required
                />
              </div>
              <div className="form-field">
                <label>Ano</label>
                <input
                  type="number"
                  value={footerData.year}
                  onChange={(e) => updateFooterField("year", parseInt(e.target.value))}
                  placeholder="2024"
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Informações de Contato */}
        <div className="form-section">
          <div 
            className="section-with-icon" 
            onClick={() => toggleSection('contact')}
            style={{ cursor: 'pointer' }}
          >
            <div className="section-icon"><FiPhone /></div>
            <h3>Informações de Contato</h3>
            <FiChevronDown 
              style={{ 
                marginLeft: 'auto', 
                transition: 'transform 0.3s',
                transform: expandedSections.contact ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </div>
          
          {expandedSections.contact && (
            <>
              <div className="form-group">
                <div className="form-field">
                  <label><FiPhone size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />Telefone</label>
                  <input
                    type="text"
                    value={footerData.contact.phone}
                    onChange={(e) =>
                      setFooterData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value },
                      }))
                    }
                    placeholder="(85) 99999-9999"
                  />
                </div>
                <div className="form-field">
                  <label><FiMail size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />E-mail</label>
                  <input
                    type="email"
                    value={footerData.contact.email}
                    onChange={(e) =>
                      setFooterData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value },
                      }))
                    }
                    placeholder="contato@maiatur.com.br"
                  />
                </div>
              </div>
              <div className="form-field">
                <label><FiMapPin size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />Endereço</label>
                <input
                  type="text"
                  value={footerData.contact.address}
                  onChange={(e) =>
                    setFooterData((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, address: e.target.value },
                    }))
                  }
                  placeholder="Rua Exemplo, 123 - Fortaleza, CE"
                />
              </div>
            </>
          )}
        </div>

        {/* Redes Sociais */}
        <div className="form-section">
          <div 
            className="section-with-icon" 
            onClick={() => toggleSection('social')}
            style={{ cursor: 'pointer' }}
          >
            <div className="section-icon"><FiGlobe /></div>
            <h3>Redes Sociais</h3>
            <FiChevronDown 
              style={{ 
                marginLeft: 'auto', 
                transition: 'transform 0.3s',
                transform: expandedSections.social ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </div>
          
          {expandedSections.social && (
            <>
              {Object.keys(footerData.social).map((network) => {
                const icons = {
                  facebook: <FiFacebook />,
                  instagram: <FiInstagram />,
                  twitter: <FiTwitter />,
                  linkedin: <FiLinkedin />
                };
                
                return (
                  <div key={network} className="social-edit">
                    {footerData.social[network]?.logo && (
                      <img
                        src={footerData.social[network].logo}
                        alt={`${network} icon`}
                        className="social-icon-preview"
                      />
                    )}
                    <div className="social-info">
                      <label>
                        {icons[network]} {footerData.social[network]?.title || network}
                      </label>
                      <input
                        type="text"
                        placeholder={`Link do ${network}`}
                        value={footerData.social[network]?.link || ""}
                        onChange={(e) =>
                          setFooterData((prev) => ({
                            ...prev,
                            social: {
                              ...prev.social,
                              [network]: {
                                ...prev.social[network],
                                link: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                      <select
                        value={footerData.social[network]?.logo || ""}
                        onChange={(e) => handleIconSelect(e, network)}
                      >
                        <option value="">Selecione um ícone</option>
                        {availableIcons[network]?.map((option, idx) => (
                          <option key={idx} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Menu Links */}
        <div className="form-section">
          <div 
            className="section-with-icon" 
            onClick={() => toggleSection('menu')}
            style={{ cursor: 'pointer' }}
          >
            <div className="section-icon"><FiMenu /></div>
            <h3>Menu de Links</h3>
            <FiChevronDown 
              style={{ 
                marginLeft: 'auto', 
                transition: 'transform 0.3s',
                transform: expandedSections.menu ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </div>
          
          {expandedSections.menu && (
            <div className="form-group">
              <div className="form-field">
                <label>Link "Sobre"</label>
                <input
                  type="text"
                  value={footerData.menu?.about || ""}
                  onChange={(e) =>
                    setFooterData((prev) => ({
                      ...prev,
                      menu: { ...prev.menu, about: e.target.value },
                    }))
                  }
                  placeholder="/sobre"
                />
              </div>
              <div className="form-field">
                <label>Link "Blog"</label>
                <input
                  type="text"
                  value={footerData.menu?.blog || ""}
                  onChange={(e) =>
                    setFooterData((prev) => ({
                      ...prev,
                      menu: { ...prev.menu, blog: e.target.value },
                    }))
                  }
                  placeholder="/blog"
                />
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving}>
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

export default EditFooter;
