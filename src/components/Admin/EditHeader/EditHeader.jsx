import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase"; // Certifique-se de que o caminho está correto
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./EditHeader.css";

const AdminEditHeader = () => {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState(""); // URL da imagem
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(""); // Nova variável para mensagem de sucesso
  const [image, setImage] = useState(null); // Armazena a imagem selecionada

  useEffect(() => {
    // Busca a logo atual no Firestore
    const fetchHeaderData = async () => {
      const headerRef = doc(db, "content", "header");
      const headerDoc = await getDoc(headerRef);

      if (headerDoc.exists()) {
        setLogoUrl(headerDoc.data().logoUrl);
      } else {
        console.log("Nenhuma logo encontrada!");
      }
    };

    fetchHeaderData();
  }, []);

  // Função de upload para o Cloudinary
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Por favor, selecione uma imagem!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(""); // Limpar a mensagem de sucesso ao iniciar o processo

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "qc7tkpck"); // Usando seu Upload Preset
    formData.append("cloud_name", "doeiv6m4h"); // Seu Cloud Name

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload`, // Usando seu Cloud Name
        formData
      );

      const imageUrl = response.data.secure_url;
      setNewLogoUrl(imageUrl); // Atualiza a URL da imagem no estado
      alert("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      alert("Erro ao enviar imagem!");
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar a nova logo no Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLogoUrl) {
      setError("Informe a URL da imagem.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(""); // Limpar a mensagem de sucesso ao iniciar o processo

    try {
      // Atualiza o Firestore com a nova URL da logo
      const headerRef = doc(db, "content", "header");
      await setDoc(headerRef, { logoUrl: newLogoUrl });

      setLogoUrl(newLogoUrl); // Atualiza o estado para exibir a nova logo
      setSuccess("Logo atualizada com sucesso!"); // Mensagem de sucesso
      setTimeout(() => navigate("/admin/dashboard"), 2000); // Redireciona após 2 segundos
    } catch (error) {
      console.error("Erro ao atualizar a logo:", error);
      setError("Erro ao salvar a nova logo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-edit-header">
      <h2>Editar Logo</h2>

      {/* Exibe a mensagem de erro, se houver */}
      {error && <p className="admin-error">{error}</p>}

      {/* Exibe a imagem atual da logo */}
      {logoUrl && <img src={logoUrl} alt="Logo Atual" className="admin-logo-preview" />}

      {/* Exibe a mensagem de sucesso, se houver */}
      {success && <p className="admin-success">{success}</p>}

      {/* Upload da nova logo */}
      <div>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Enviando..." : "Enviar Imagem"}
        </button>
      </div>

      {/* Exibe a pré-visualização da imagem, se houver uma URL válida */}
      {newLogoUrl && (
        <div>
          <h4>Pré-visualização:</h4>
          <img src={newLogoUrl} alt="Pré-visualização" className="admin-logo-preview" />
        </div>
      )}

      {/* Botão para salvar a nova logo */}
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Logo"}
        </button>
      </form>
    </div>
  );
};

export default AdminEditHeader;
