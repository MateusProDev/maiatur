import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditAbout.css";

const EditAbout = () => {
  const navigate = useNavigate();
  const [aboutData, setAboutData] = useState({
    description: "", // A descrição que será exibida abaixo do título
    aboutCarousel: {
      images: [] // Imagens do carrossel
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const aboutRef = doc(db, "content", "about");
        const aboutDoc = await getDoc(aboutRef);
        if (aboutDoc.exists()) {
          const data = aboutDoc.data();
          setAboutData({
            description: data.description || "",
            aboutCarousel: {
              images: data.aboutCarousel?.images || []
            }
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qc7tkpck");
    formData.append("cloud_name", "doeiv6m4h");
    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload",
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      setError("Erro ao enviar imagem");
      return null;
    }
  };

  const handleAddImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const title = prompt("Digite o título para esta imagem:");
    if (!title) return;
    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      setAboutData((prev) => ({
        ...prev,
        aboutCarousel: {
          ...prev.aboutCarousel,
          images: [...prev.aboutCarousel.images, { url: imageUrl, title }]
        }
      }));
    }
  };

  const handleRemoveImage = (index) => {
    setAboutData((prev) => ({
      ...prev,
      aboutCarousel: {
        ...prev.aboutCarousel,
        images: prev.aboutCarousel.images.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "content", "about"), aboutData);
      alert("Dados salvos com sucesso!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setError("Erro ao salvar dados");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-about">
      <h2>Editar Sobre Nós</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Campo de edição de descrição */}
        <div className="form-group">
          <label>Descrição (exibida abaixo do título "Sobre Nós")</label>
          <textarea
            value={aboutData.description}
            onChange={(e) => setAboutData({ ...aboutData, description: e.target.value })}
            required
          />
        </div>

        {/* Campo de upload de imagem */}
        <div className="form-group">
          <label>Adicionar Imagem ao Carrossel</label>
          <input type="file" accept="image/*" onChange={handleAddImage} />
        </div>

        <div className="carousel-preview">
          {aboutData.aboutCarousel?.images?.map((image, index) => (
            <div key={index} className="carousel-preview-item">
              <img src={image.url} alt={image.title} />
              <p>{image.title}</p>
              <button type="button" onClick={() => handleRemoveImage(index)}>
                Remover
              </button>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
};

export default EditAbout;
