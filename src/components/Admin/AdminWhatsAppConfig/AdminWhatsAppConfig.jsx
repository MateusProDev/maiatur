import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase"; // Importe sua configuração do Firebase
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./AdminWhatsAppConfig.css";

const AdminWhatsAppConfig = () => {
  const navigate = useNavigate();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        const docRef = doc(db, "settings", "whatsapp"); // Acessa o documento 'whatsapp' na coleção 'settings'
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setWhatsappNumber(docSnap.data().number || ""); // Define o número do WhatsApp
        } else {
          setError("Configuração do WhatsApp não encontrada.");
        }
      } catch (err) {
        setError("Erro ao carregar o número do WhatsApp.");
        console.error(err);
      }
    };

    fetchWhatsAppNumber();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const docRef = doc(db, "settings", "whatsapp"); // Referência ao documento 'whatsapp'
      await setDoc(docRef, { number: whatsappNumber }); // Atualiza o número do WhatsApp
      alert("Número do WhatsApp atualizado com sucesso!");
      navigate("/admin/dashboard"); // Redireciona para o painel de administração
    } catch (err) {
      setError("Erro ao salvar número do WhatsApp.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-whatsapp-config">
      <h2>Configuração do WhatsApp</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSave}>
        <label>Número do WhatsApp:</label>
        <input
          type="text"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          required
          placeholder="Digite o número com DDD"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
};

export default AdminWhatsAppConfig;