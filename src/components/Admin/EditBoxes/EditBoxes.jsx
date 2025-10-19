import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { CLOUDINARY_CONFIG } from "../../../config/cloudinary";
import { useNavigate } from "react-router-dom";
import "./EditBoxes.css";

const EditBoxes = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingBoxSection, setAddingBoxSection] = useState(null); // index da seção para adicionar box
  const [newBox, setNewBox] = useState({ title: "", content: "", image: null });
  const [editingSection, setEditingSection] = useState(null); // {index, title}
  const [editingBox, setEditingBox] = useState(null); // {sectionIndex, boxIndex, title, content, image}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const boxesRef = doc(db, "content", "boxes");
        const boxesDoc = await getDoc(boxesRef);
        if (boxesDoc.exists()) {
          setSections(boxesDoc.data().sections || []);
        }
      } catch (error) {
        setError("Erro ao carregar dados.");
      }
    };
    fetchSections();
  }, []);

  const handleImageUpload = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("cloud_name", CLOUDINARY_CONFIG.cloudName);
    try {
      const response = await axios.post(
        CLOUDINARY_CONFIG.apiUrl,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      setError("Falha no upload da imagem.");
      return null;
    }
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) {
      setError("Digite um título para a seção!");
      return;
    }
    setSections((prev) => [...prev, { title: newSectionTitle.trim(), boxes: [] }]);
    setNewSectionTitle("");
    setSuccess("Seção adicionada!");
    setError("");
  };

  const handleAddBox = async (sectionIndex) => {
    if (!newBox.title.trim() || !newBox.content.trim() || !newBox.image) {
      setError("Preencha todos os campos do box!");
      return;
    }
    setLoading(true);
    const imageUrl = await handleImageUpload(newBox.image);
    if (imageUrl) {
      const updatedSections = [...sections];
      updatedSections[sectionIndex].boxes.push({
        title: newBox.title.trim(),
        content: newBox.content.trim(),
        imageUrl
      });
      try {
        await setDoc(doc(db, "content", "boxes"), { sections: updatedSections });
        setSections(updatedSections);
        setNewBox({ title: "", content: "", image: null });
        setAddingBoxSection(null);
        setSuccess("Box adicionado com sucesso!");
        setError("");
      } catch (error) {
        setError("Erro ao salvar o box.");
      }
    }
    setLoading(false);
  };

  const handleDeleteBox = async (sectionIndex, boxIndex) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].boxes.splice(boxIndex, 1);
    try {
      await setDoc(doc(db, "content", "boxes"), { sections: updatedSections });
      setSections(updatedSections);
      setSuccess("Box excluído!");
      setError("");
    } catch {
      setError("Erro ao excluir o box.");
    }
  };

  const handleDeleteSection = async (sectionIndex) => {
    const updatedSections = sections.filter((_, idx) => idx !== sectionIndex);
    try {
      await setDoc(doc(db, "content", "boxes"), { sections: updatedSections });
      setSections(updatedSections);
      setSuccess("Seção excluída!");
      setError("");
    } catch {
      setError("Erro ao excluir a seção.");
    }
  };

  const handleSaveSection = async (sectionIndex) => {
    if (!editingSection.title.trim()) {
      setError("Digite um título para a seção!");
      return;
    }
    const updatedSections = [...sections];
    updatedSections[sectionIndex].title = editingSection.title.trim();
    try {
      await setDoc(doc(db, "content", "boxes"), { sections: updatedSections });
      setSections(updatedSections);
      setEditingSection(null);
      setSuccess("Seção atualizada!");
      setError("");
    } catch {
      setError("Erro ao atualizar a seção.");
    }
  };

  const handleSaveBox = async () => {
    const { sectionIndex, boxIndex, title, content, image } = editingBox;
    if (!title.trim() || !content.trim()) {
      setError("Preencha todos os campos!");
      return;
    }
    setLoading(true);
    let imageUrl = sections[sectionIndex].boxes[boxIndex].imageUrl;
    if (image && typeof image !== "string") {
      const uploaded = await handleImageUpload(image);
      if (uploaded) imageUrl = uploaded;
    }
    const updatedSections = [...sections];
    updatedSections[sectionIndex].boxes[boxIndex] = {
      title: title.trim(),
      content: content.trim(),
      imageUrl
    };
    try {
      await setDoc(doc(db, "content", "boxes"), { sections: updatedSections });
      setSections(updatedSections);
      setEditingBox(null);
      setSuccess("Box atualizado!");
      setError("");
    } catch {
      setError("Erro ao atualizar o box.");
    }
    setLoading(false);
  };

  const handleEditSection = (sectionIndex) => {
    setEditingSection({ index: sectionIndex, title: sections[sectionIndex].title });
    setError("");
    setSuccess("");
  };

  const handleEditBox = (sectionIndex, boxIndex) => {
    const box = sections[sectionIndex].boxes[boxIndex];
    setEditingBox({
      sectionIndex,
      boxIndex,
      title: box.title,
      content: box.content,
      image: box.imageUrl
    });
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "content", "boxes"), { sections });
      setSuccess("Alterações salvas!");
      setError("");
      setTimeout(() => navigate("/admin/dashboard"), 1200);
    } catch (error) {
      setError("Erro ao salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-boxes">
      <h2>Editar Seções</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {/* Adicionar Nova Seção */}
      <div className="add-section-form">
        <input
          type="text"
          placeholder="Nome da Seção"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          aria-label="Nome da Seção"
        />
        <button onClick={handleAddSection} disabled={loading} className="add-section-btn">
          Nova Seção
        </button>
      </div>

      {/* Lista de Seções */}
      <div className="sections-list">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="section">
            {editingSection && editingSection.index === sectionIndex ? (
              <div className="edit-section-form">
                <input
                  type="text"
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  aria-label="Editar título da seção"
                />
                <button onClick={() => handleSaveSection(sectionIndex)} disabled={loading} className="save-btn">
                  Salvar
                </button>
                <button onClick={() => setEditingSection(null)} disabled={loading} className="cancel-btn">
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="section-header">
                <h3>{section.title}</h3>
                <div className="section-actions">
                  <button onClick={() => handleEditSection(sectionIndex)} disabled={loading} className="edit-btn">
                    Editar Seção
                  </button>
                  <button onClick={() => handleDeleteSection(sectionIndex)} disabled={loading} className="delete-section-btn">
                    Excluir Seção
                  </button>
                </div>
              </div>
            )}

            {/* Adicionar Box */}
            {addingBoxSection === sectionIndex && (
              <div className="add-box-form">
                <input
                  type="text"
                  placeholder="Título"
                  value={newBox.title}
                  onChange={(e) => setNewBox({ ...newBox, title: e.target.value })}
                  aria-label="Título do box"
                />
                <textarea
                  placeholder="Descrição"
                  value={newBox.content}
                  onChange={(e) => setNewBox({ ...newBox, content: e.target.value })}
                  aria-label="Descrição do box"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewBox({ ...newBox, image: e.target.files[0] })}
                  aria-label="Imagem do box"
                />
                <div className="add-box-actions">
                  <button onClick={() => handleAddBox(sectionIndex)} disabled={loading} className="save-btn">
                    {loading ? "Adicionando..." : "Adicionar Box"}
                  </button>
                  <button onClick={() => { setAddingBoxSection(null); setNewBox({ title: "", content: "", image: null }); }} disabled={loading} className="cancel-btn">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={() => { setAddingBoxSection(sectionIndex); setNewBox({ title: "", content: "", image: null }); }}
              disabled={loading || addingBoxSection === sectionIndex}
              className="add-box-btn"
            >
              Adicionar Box
            </button>

            {/* Boxes da Seção */}
            <div className="boxes">
              {section.boxes.map((box, boxIndex) => (
                <div key={boxIndex} className={`box${editingBox && editingBox.sectionIndex === sectionIndex && editingBox.boxIndex === boxIndex ? ' editing' : ''}`}>
                  {editingBox && editingBox.sectionIndex === sectionIndex && editingBox.boxIndex === boxIndex ? (
                    <div className="edit-box-form">
                      <input
                        type="text"
                        value={editingBox.title}
                        onChange={(e) => setEditingBox({ ...editingBox, title: e.target.value })}
                        aria-label="Título do box"
                      />
                      <textarea
                        value={editingBox.content}
                        onChange={(e) => setEditingBox({ ...editingBox, content: e.target.value })}
                        aria-label="Descrição do box"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditingBox({ ...editingBox, image: e.target.files[0] })}
                        aria-label="Imagem do box"
                      />
                      <div className="edit-box-actions">
                        <button className="save-btn" onClick={handleSaveBox} disabled={loading}>
                          Salvar Box
                        </button>
                        <button className="cancel-btn" onClick={() => setEditingBox(null)} disabled={loading}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="box-content">
                      <div className="box-actions-top">
                        <button
                          className="edit-btn edit-btn-icon"
                          onClick={() => handleEditBox(sectionIndex, boxIndex)}
                          disabled={loading}
                          title="Editar"
                          aria-label="Editar box"
                        >
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.7 2.29a1 1 0 0 1 1.42 0l1.59 1.59a1 1 0 0 1 0 1.42l-9.3 9.3-3.3.71a1 1 0 0 1-1.18-1.18l.71-3.3 9.3-9.3zM3 17a1 1 0 0 0 1 1h12a1 1 0 1 0 0-2H4a1 1 0 0 0-1 1z" fill="#232946"/>
                          </svg>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteBox(sectionIndex, boxIndex)}
                          disabled={loading}
                          title="Excluir"
                          aria-label="Excluir box"
                        >
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 7v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                            <rect x="3" y="4" width="14" height="2" rx="1" fill="#ff595e"/>
                            <rect x="8" y="9" width="1.5" height="5" rx="0.75" fill="#fff"/>
                            <rect x="10.5" y="9" width="1.5" height="5" rx="0.75" fill="#fff"/>
                          </svg>
                        </button>
                      </div>
                      <img src={box.imageUrl} alt={box.title} />
                      <h4>{box.title}</h4>
                      <p>{box.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={loading} className="save-all-btn">
        {loading ? "Salvando..." : "Salvar Tudo"}
      </button>
    </div>
  );
};

export default EditBoxes;
