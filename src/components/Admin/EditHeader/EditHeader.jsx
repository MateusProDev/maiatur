import React, { useState, useEffect, useCallback } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { CLOUDINARY_CONFIG } from "../../../config/cloudinary";
import { useNavigate } from "react-router-dom";
import { 
  FiUpload, 
  FiSave, 
  FiX, 
  FiImage,
  FiCheckCircle,
  FiArrowLeft
} from "react-icons/fi";
import "./EditHeader.css";

const AdminEditHeader = () => {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const fetchHeaderData = useCallback(async () => {
    try {
      const headerRef = doc(db, "content", "header");
      const headerDoc = await getDoc(headerRef);

      if (headerDoc.exists()) {
        const url = headerDoc.data().logoUrl;
        setLogoUrl(url);
        setNewLogoUrl(url);
      }
    } catch (error) {
      console.error("Erro ao buscar logo:", error);
      showNotification("error", "Erro ao carregar logo atual");
    }
  }, []);

  useEffect(() => { fetchHeaderData(); }, [fetchHeaderData]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 4000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification("error", "Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "A imagem deve ter no máximo 5MB");
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
      formData.append("folder", "logos");

      console.log('Upload config:', {
        apiUrl: CLOUDINARY_CONFIG.apiUrl,
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
        fileType: file.type,
        fileSize: file.size
      });

      const response = await axios.post(
        CLOUDINARY_CONFIG.apiUrl,
        formData
      );
      
      setNewLogoUrl(response.data.secure_url);
      showNotification("success", "Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      console.error("Erro detalhado:", error.response?.data);
      showNotification("error", "Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newLogoUrl) {
      showNotification("error", "Por favor, faça upload de uma imagem primeiro");
      return;
    }

    try {
      setSaving(true);
      const headerRef = doc(db, "content", "header");
      await setDoc(headerRef, { logoUrl: newLogoUrl }, { merge: true });

      setLogoUrl(newLogoUrl);
      showNotification("success", "Logo atualizada com sucesso!");
      
      setTimeout(() => navigate("/admin"), 2000);
    } catch (error) {
      console.error("Erro ao salvar logo:", error);
      showNotification("error", "Erro ao salvar a logo");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNewLogoUrl(logoUrl);
    navigate("/admin");
  };

  return (
    <div className="admin-edit-header-container">
      {/* Notification */}
      {notification.show && (
        <div className={`notification notification-${notification.type}`}>
          {notification.type === "success" ? <FiCheckCircle /> : <FiX />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <button className="back-button" onClick={handleCancel}>
          <FiArrowLeft /> Voltar
        </button>
        <h1>
          <FiImage /> Gerenciar Logo
        </h1>
      </div>

      {/* Main Content Card */}
      <div className="edit-header-card">
        <form onSubmit={handleSubmit}>
          {/* Current Logo Preview */}
          <div className="logo-preview-section">
            <h3>Logo Atual</h3>
            {logoUrl ? (
              <div className="logo-preview-wrapper">
                <img src={logoUrl} alt="Logo atual" className="logo-preview" />
              </div>
            ) : (
              <div className="no-logo">
                <FiImage />
                <p>Nenhuma logo configurada</p>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="upload-section">
            <h3>Nova Logo</h3>
            
            {newLogoUrl && newLogoUrl !== logoUrl ? (
              <div className="new-logo-preview">
                <img src={newLogoUrl} alt="Nova logo" />
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => setNewLogoUrl(logoUrl)}
                  disabled={uploading || saving}
                >
                  <FiX /> Remover
                </button>
              </div>
            ) : (
              <label className="upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading || saving}
                  style={{ display: 'none' }}
                />
                <div className="upload-content">
                  {uploading ? (
                    <>
                      <div className="spinner"></div>
                      <p>Enviando imagem...</p>
                    </>
                  ) : (
                    <>
                      <FiUpload />
                      <p>Clique para fazer upload</p>
                      <span>PNG, JPG ou GIF (máx. 5MB)</span>
                    </>
                  )}
                </div>
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={uploading || saving}
            >
              <FiX /> Cancelar
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={uploading || saving || !newLogoUrl || newLogoUrl === logoUrl}
            >
              {saving ? (
                <>
                  <div className="spinner-small"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <FiSave /> Salvar Logo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditHeader;


