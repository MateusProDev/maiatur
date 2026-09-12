import React, { useState, useEffect } from "react";
import "./WhatsAppButton.css";
import { db } from "../../firebase/firebase"; // Importe sua configuração do Firebase
import { doc, getDoc } from "firebase/firestore";

const WhatsAppButton = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        const docRef = doc(db, "settings", "whatsapp"); // Acessa o documento 'whatsapp' na coleção 'settings'
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPhoneNumber(docSnap.data().number || ""); // Define o número do WhatsApp
        } else {
          setError("Número do WhatsApp não encontrado.");
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

  if (loading) return null; // Removido <p>Carregando...</p> para não atrasar renderização
  if (error) return null; // Removido <p>{error}</p> para não mostrar erro visual

  const message = "Olá, gostaria de saber mais sobre os pacotes de turismo da Transfer Fortaleza Tur.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="whatsapp-button pulsante" aria-label="Fale conosco no WhatsApp">
      <img src="/whatsappbtn.png" alt="WhatsApp" width="48" height="48" />
    </a>
  );
};

export default WhatsAppButton;