import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./EditWhatsApp.css";

const EditWhatsApp = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        const docRef = doc(db, "settings", "whatsapp");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPhoneNumber(docSnap.data().number || "");
        }
      } catch (err) {
        setError("Erro ao carregar o número do WhatsApp.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWhatsAppNumber();
  }, []);

  const handleSave = async () => {
    try {
      const docRef = doc(db, "settings", "whatsapp");
      await setDoc(docRef, { number: phoneNumber }, { merge: true });
      alert("Número do WhatsApp atualizado com sucesso!");
      navigate("/loja/admin");
    } catch (err) {
      setError("Erro ao salvar o número do WhatsApp.");
      console.error(err);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="edit-whatsapp-container">
      <h2>Editar Número do WhatsApp</h2>
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Digite o número do WhatsApp (ex: 5585991470709)"
      />
      <button onClick={handleSave}>Salvar</button>
      <button onClick={() => navigate("/loja/admin")}>Voltar</button>
    </div>
  );
};

export default EditWhatsApp;