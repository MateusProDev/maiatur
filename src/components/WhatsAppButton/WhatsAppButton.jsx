import React, { useState, useEffect } from "react";
import "./WhatsAppButton.css";
import whatsappIcon from "./../../assets/WhatsApp.png"; // Ajuste o caminho conforme sua estrutura
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

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  const message = "Olá, gostaria de saber mais sobre os pacotes de turismo da Maiatur.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="whatsapp-button">
      <img src={whatsappIcon} alt="WhatsApp" />
    </a>
  );
};

export default WhatsAppButton;