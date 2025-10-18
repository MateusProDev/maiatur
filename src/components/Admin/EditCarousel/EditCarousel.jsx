import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EditCarousel.css";

const EditCarousel = () => {
  const navigate = useNavigate();
  const [carouselData, setCarouselData] = useState({
    sectionTitle: "", // Título da seção
    images: [], // Lista de imagens com títulos
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Busca os dados do carrossel ao carregar o componente
  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        const carouselRef = doc(db, "content", "carousel");
        const carouselDoc = await getDoc(carouselRef);

        if (carouselDoc.exists()) {
          setCarouselData(carouselDoc.data()); // Atualiza o estado com os dados do Firestore
        } else {
          console.log("Carrossel não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Firestore:", error);
      }
    };

    fetchCarouselData();
  }, []);

  // Função para fazer upload da imagem no Cloudinary
  const handleImageUpload = async (file, title) => {
    if (!file || loading) return; // Impede o upload se já estiver em andamento
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qc7tkpck"); // Substitua pelo seu upload preset
    formData.append("cloud_name", "doeiv6m4h"); // Substitua pelo seu cloud name

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload`, // URL da API do Cloudinary
        formData
      );
      setCarouselData((prev) => ({
        ...prev,
        images: [...prev.images, { url: response.data.secure_url, title }], // Adiciona a nova imagem com título
      }));
    } catch (error) {
      setError("Erro ao enviar imagem");
      console.error("Erro ao enviar imagem:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para remover uma imagem do carrossel
  const handleDelete = (index) => {
    setCarouselData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index), // Remove a imagem pelo índice
    }));
  };

  // Função para salvar as alterações no Firestore
  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "content", "carousel"), carouselData); // Salva os dados no Firestore
      setSuccess("Carrossel atualizado com sucesso!");
      setTimeout(() => navigate("/admin/dashboard"), 2000); // Redireciona após 2 segundos
    } catch (error) {
      console.error("Erro ao atualizar o carrossel:", error);
      setError("Erro ao salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-carousel">
      <h2>Editar Carrossel</h2>

      {/* Exibe mensagens de erro ou sucesso */}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Campo para o título da seção */}
      <label>Título da Seção</label>
      <input
        type="text"
        value={carouselData.sectionTitle}
        onChange={(e) =>
          setCarouselData({ ...carouselData, sectionTitle: e.target.value })
        }
        placeholder="Ex: Nossos Serviços"
      />

      {/* Campo para upload de novas imagens */}
      <label>Adicionar Imagem</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const title = prompt("Digite o título da imagem:"); // Solicita o título da imagem
          if (title) handleImageUpload(e.target.files[0], title);
        }}
        disabled={loading} // Desabilita o input durante o upload
      />

      {/* Exibe as imagens do carrossel */}
      <div className="carousel-images">
        {carouselData.images.map((image, index) => (
          <div key={index} className="carousel-image-container">
            <img src={image.url} alt={`Carrossel ${index}`} className="carousel-image" />
            <p className="image-title">{image.title}</p>
            <button onClick={() => handleDelete(index)} disabled={loading}>
              Excluir
            </button>
          </div>
        ))}
      </div>

      {/* Botão para salvar as alterações */}
      <button onClick={handleSave} disabled={loading}>
        {loading ? "Salvando..." : "Salvar Carrossel"}
      </button>
    </div>
  );
};

export default EditCarousel;