import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./EditFooter.css";

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

  // Busca os dados do Firestore e mescla com o estado inicial
  useEffect(() => {
    let isMounted = true;
    const fetchFooterData = async () => {
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
    setLoading(true);
    setError("");
    try {
      const footerRef = doc(db, "content", "footer");
      await setDoc(footerRef, footerData); // Salva tudo no Firestore
      alert("Rodapé atualizado com sucesso!");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Erro ao salvar rodapé:", err);
      setError("Erro ao salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  if (!footerData) return <p>Carregando...</p>;

  return (
    <div className="edit-footer">
      <h2>Editar Rodapé</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Texto Principal */}
        <div className="form-section">
          <label>Texto do Rodapé</label>
          <textarea
            value={footerData.text}
            onChange={(e) => updateFooterField("text", e.target.value)}
            required
            rows="3"
          />
        </div>

        {/* Informações da Empresa */}
        <div className="form-section">
          <h3>Informações da Empresa</h3>
          <label>Nome da Empresa</label>
          <input
            type="text"
            value={footerData.companyName}
            onChange={(e) => updateFooterField("companyName", e.target.value)}
            placeholder="20 Buscar"
            required
          />
          <label>Ano</label>
          <input
            type="number"
            value={footerData.year}
            onChange={(e) => updateFooterField("year", e.target.value)}
            required
          />
        </div>

        {/* Contato */}
        <div className="form-section">
          <h3>Contato</h3>
          <label>Telefone</label>
          <input
            type="text"
            value={footerData.contact?.phone || ""}
            onChange={(e) =>
              updateFooterField("contact", {
                ...footerData.contact,
                phone: e.target.value,
              })
            }
            required
          />
          <label>Email</label>
          <input
            type="email"
            value={footerData.contact?.email || ""}
            onChange={(e) =>
              updateFooterField("contact", {
                ...footerData.contact,
                email: e.target.value,
              })
            }
            required
          />
          <label>Endereço</label>
          <input
            type="text"
            value={footerData.contact?.address || ""}
            onChange={(e) =>
              updateFooterField("contact", {
                ...footerData.contact,
                address: e.target.value,
              })
            }
          />
        </div>

        {/* Redes Sociais */}
        <div className="form-section">
          <h3>Redes Sociais</h3>
          {Object.keys(footerData.social).map((network) => (
            <div key={network} className="social-edit">
              <label>{footerData.social[network]?.title || network}</label>
              <input
                type="text"
                placeholder="Link da rede social"
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
              <label>Escolha um ícone:</label>
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
              {footerData.social[network]?.logo && (
                <img
                  src={footerData.social[network].logo}
                  alt={`${network} icon`}
                  className="social-icon-preview"
                />
              )}
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="form-section">
          <h3>Links do Menu</h3>
          {Object.keys(footerData.menu).map((item) => (
            <div key={item}>
              <label>{item.charAt(0).toUpperCase() + item.slice(1)}</label>
              <input
                type="text"
                placeholder={`URL do ${item}`}
                value={footerData.menu[item] || ""}
                onChange={(e) =>
                  updateFooterField("menu", {
                    ...footerData.menu,
                    [item]: e.target.value,
                  })
                }
              />
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
};

export default EditFooter;