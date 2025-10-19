import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { db } from "../../../firebase/firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { CLOUDINARY_CONFIG } from "../../../config/cloudinary";
import { FiUpload, FiTrash2, FiImage, FiLoader } from "react-icons/fi";
import "./BannerAdmin.css";

const BannerAdmin = () => {
  const [file, setFile] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState({
    upload: false,
    deleting: null
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });
  const [previewUrl, setPreviewUrl] = useState("");

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, duration);
  };

  const fetchBanners = useCallback(async () => {
    try {
      const bannersCollection = collection(db, "bannersTurismo");
      const snapshot = await getDocs(bannersCollection);
      const bannersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        imageUrl: doc.data().imageUrl,
      }));
      setBanners(bannersData);
    } catch (error) {
      showNotification("error", "Erro ao carregar banners");
      console.error("Erro ao carregar banners:", error);
    }
  }, []); // useCallback sem dependências

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]); // Incluindo fetchBanners nas dependências

  const validateImage = async (file) => {
    // Verifica o formato (apenas WebP ou JPG)
    const validFormats = ["image/webp", "image/jpeg"];
    if (!validFormats.includes(file.type)) {
      throw new Error("A imagem deve estar no formato WebP ou JPG.");
    }

    // Verifica o tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("A imagem deve ter no máximo 5MB.");
    }

    // Verifica as dimensões
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== 1920 || img.height !== 1080) {
          reject("A imagem deve ter exatamente 1920 x 1080 pixels.");
        } else {
          resolve();
        }
      };
      img.onerror = () => reject("Erro ao carregar a imagem para validação.");
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) {
      showNotification("error", "Selecione uma imagem antes de enviar.");
      return;
    }

    setLoading({ ...loading, upload: true });
    setNotification({ show: false, type: "", message: "" });

    try {
      await validateImage(file);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
      formData.append("cloud_name", CLOUDINARY_CONFIG.cloudName);

      const response = await axios.post(
        CLOUDINARY_CONFIG.apiUrl,
        formData
      );

      await addDoc(collection(db, "bannersTurismo"), { 
        imageUrl: response.data.secure_url,
        createdAt: new Date()
      });

      showNotification("success", "Banner adicionado com sucesso!");
      setFile(null);
      setPreviewUrl("");
      fetchBanners();
    } catch (error) {
      showNotification("error", error.message || "Erro ao enviar imagem.");
      console.error("Erro ao enviar imagem:", error);
    } finally {
      setLoading({ ...loading, upload: false });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este banner?")) return;

    setLoading({ ...loading, deleting: id });

    try {
      await deleteDoc(doc(db, "bannersTurismo", id));
      showNotification("success", "Banner excluído com sucesso!");
      fetchBanners();
    } catch (error) {
      showNotification("error", "Erro ao excluir banner.");
      console.error("Erro ao excluir banner:", error);
    } finally {
      setLoading({ ...loading, deleting: null });
    }
  };

  return (
    <div className="banner-admin-container">
      <div className="banner-admin-card">
        <h2 className="banner-admin-title">
          <FiImage className="title-icon" />
          Gerenciar Banners
        </h2>

        {notification.show && (
          <div className={`notification notification--${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="upload-section">
          <div className="upload-instructions">
            <p>Especificações do banner:</p>
            <ul>
              <li>Dimensões: 1920 × 1080 pixels (16:9)</li>
              <li>Formatos aceitos: WebP ou JPG</li>
              <li>Tamanho máximo: 5MB</li>
            </ul>
          </div>

          <div className="file-upload-area">
            <label className="file-upload-label">
              <input
                type="file"
                accept="image/webp,image/jpeg"
                onChange={handleFileChange}
                className="file-upload-input"
              />
              <div className="file-upload-content">
                {previewUrl ? (
                  <img src={previewUrl} alt="Pré-visualização" className="file-upload-preview" />
                ) : (
                  <>
                    <FiUpload className="upload-icon" />
                    <span>Selecione uma imagem</span>
                  </>
                )}
              </div>
            </label>
            {file && (
              <button
                onClick={handleUpload}
                disabled={loading.upload}
                className="upload-button"
              >
                {loading.upload ? (
                  <>
                    <FiLoader className="button-loader" />
                    Enviando...
                  </>
                ) : (
                  "Adicionar Banner"
                )}
              </button>
            )}
          </div>
        </div>

        <div className="banners-grid">
          {banners.length === 0 ? (
            <p className="no-banners-message">Nenhum banner cadastrado</p>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="banner-item">
                <div className="banner-image-container">
                  <img src={banner.imageUrl} alt="Banner" className="banner-image" />
                  <button
                    onClick={() => handleDelete(banner.id)}
                    disabled={loading.deleting === banner.id}
                    className="delete-button"
                  >
                    {loading.deleting === banner.id ? (
                      <FiLoader className="button-loader" />
                    ) : (
                      <FiTrash2 />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerAdmin;