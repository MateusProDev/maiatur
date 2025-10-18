import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiSave, FiLoader, FiImage, FiX } from "react-icons/fi";
import "./EditBanner.css";

const EditBanner = () => {
  const navigate = useNavigate();
  const [bannerData, setBannerData] = useState({
    text: "",
    description: "",
    imageUrl: "",
    bgUrl: "",
    ctaText: "Compre agora",
    ctaLink: "#"
  });
  const [loading, setLoading] = useState({
    uploadImage: false,
    uploadBg: false,
    saving: false
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const bannerRef = doc(db, "content", "banner");
        const bannerDoc = await getDoc(bannerRef);

        if (bannerDoc.exists()) {
          setBannerData(prev => ({
            ...prev,
            ...bannerDoc.data()
          }));
        }
      } catch (error) {
        showNotification("error", "Erro ao carregar dados do banner");
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchBannerData();
  }, []);

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, duration);
  };

  const handleImageUpload = async (file, field) => {
    if (!file) return;
    
    // Verifica se é imagem
    if (!file.type.match("image.*")) {
      showNotification("error", "Por favor, selecione um arquivo de imagem");
      return;
    }

    // Verifica tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "A imagem deve ter no máximo 5MB");
      return;
    }

    setLoading({ ...loading, [`upload${field}`]: true });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qc7tkpck");
    formData.append("cloud_name", "doeiv6m4h");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload",
        formData
      );
      setBannerData(prev => ({ ...prev, [field]: response.data.secure_url }));
      showNotification("success", "Imagem enviada com sucesso!");
    } catch (error) {
      showNotification("error", "Erro ao enviar imagem");
      console.error("Erro no upload:", error);
    } finally {
      setLoading({ ...loading, [`upload${field}`]: false });
    }
  };

  const removeImage = (field) => {
    setBannerData(prev => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bannerData.text.trim()) {
      showNotification("error", "O texto do banner é obrigatório");
      return;
    }

    setLoading({ ...loading, saving: true });

    try {
      await setDoc(doc(db, "content", "banner"), bannerData);
      showNotification("success", "Banner atualizado com sucesso!");
      setTimeout(() => navigate("/admin/dashboard"), 2000);
    } catch (error) {
      showNotification("error", "Erro ao salvar banner");
      console.error("Erro ao salvar:", error);
    } finally {
      setLoading({ ...loading, saving: false });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBannerData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="edit-banner-container">
      <div className="edit-banner-card">
        <h2 className="edit-banner-title">
          <FiImage className="title-icon" />
          Editar Banner Principal
        </h2>

        {notification.show && (
          <div className={`notification notification--${notification.type}`}>
            {notification.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-banner-form">
          <div className="form-group">
            <label htmlFor="text" className="form-label">
              Texto Principal
            </label>
            <input
              id="text"
              name="text"
              type="text"
              value={bannerData.text}
              onChange={handleChange}
              placeholder="Texto promocional principal"
              className="form-input"
              required
              maxLength={50}
            />
            <small className="form-hint">Máximo 50 caracteres</small>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={bannerData.description}
              onChange={handleChange}
              placeholder="Descrição detalhada da promoção"
              className="form-textarea"
              required
              maxLength={150}
              rows={3}
            />
            <small className="form-hint">Máximo 150 caracteres</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ctaText" className="form-label">
                Texto do Botão
              </label>
              <input
                id="ctaText"
                name="ctaText"
                type="text"
                value={bannerData.ctaText}
                onChange={handleChange}
                placeholder="Texto do botão de ação"
                className="form-input"
                maxLength={20}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ctaLink" className="form-label">
                Link do Botão
              </label>
              <input
                id="ctaLink"
                name="ctaLink"
                type="text"
                value={bannerData.ctaLink}
                onChange={handleChange}
                placeholder="URL de destino"
                className="form-input"
              />
            </div>
          </div>

          <div className="images-grid">
            <div className="image-upload-card">
              <label className="form-label">Imagem Principal</label>
              <div className="image-upload-container">
                {bannerData.imageUrl ? (
                  <div className="image-preview-wrapper">
                    <img
                      src={bannerData.imageUrl}
                      alt="Preview da imagem"
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => removeImage("imageUrl")}
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <label className="upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], "imageUrl")}
                      disabled={loading.uploadImage}
                      className="upload-input"
                    />
                    <FiUpload className="upload-icon" />
                    <span>{loading.uploadImage ? "Enviando..." : "Selecionar Imagem"}</span>
                  </label>
                )}
              </div>
              <small className="form-hint">Recomendado: 800x600px</small>
            </div>

            <div className="image-upload-card">
              <label className="form-label">Imagem de Fundo</label>
              <div className="image-upload-container">
                {bannerData.bgUrl ? (
                  <div className="image-preview-wrapper">
                    <img
                      src={bannerData.bgUrl}
                      alt="Preview do fundo"
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => removeImage("bgUrl")}
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <label className="upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], "bgUrl")}
                      disabled={loading.uploadBg}
                      className="upload-input"
                    />
                    <FiUpload className="upload-icon" />
                    <span>{loading.uploadBg ? "Enviando..." : "Selecionar Fundo"}</span>
                  </label>
                )}
              </div>
              <small className="form-hint">Recomendado: 1920x1080px</small>
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading.saving || loading.uploadImage || loading.uploadBg}
          >
            {loading.saving ? (
              <>
                <FiLoader className="button-loader" />
                Salvando...
              </>
            ) : (
              <>
                <FiSave className="button-icon" />
                Salvar Alterações
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBanner;