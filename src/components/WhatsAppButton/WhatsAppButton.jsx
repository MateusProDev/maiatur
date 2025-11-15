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
    <a href={url} target="_blank" rel="noopener noreferrer" className="whatsapp-button" aria-label="Fale conosco no WhatsApp">
      {/* SVG inline - muito menor que PNG (12 KiB -> ~1 KiB) */}
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="30" fill="#25D366"/>
        <path d="M30.5 15C22.5 15 16 21.5 16 29.5C16 32.4 16.9 35.1 18.4 37.3L16 44L22.9 41.7C25 43 27.7 43.8 30.5 43.8C38.5 43.8 45 37.3 45 29.3C45 21.5 38.5 15 30.5 15ZM38.5 35.8C38.1 37 36.4 38 35 38.2C34 38.3 32.7 38.4 27.9 36.4C21.9 33.9 18.1 27.7 17.9 27.4C17.6 27.1 15.5 24.3 15.5 21.4C15.5 18.5 17 17 17.6 16.4C18.1 15.8 18.8 15.7 19.2 15.7C19.4 15.7 19.7 15.7 19.9 15.7C20.3 15.7 20.8 15.6 21.2 16.6C21.7 17.7 22.9 20.6 23 20.8C23.1 21 23.2 21.3 23 21.6C22.8 21.9 22.7 22.1 22.5 22.3C22.2 22.6 22 22.8 21.7 23.1C21.5 23.3 21.2 23.6 21.5 24.1C21.7 24.6 22.8 26.4 24.5 27.9C26.7 29.8 28.5 30.4 29.1 30.7C29.6 30.9 29.9 30.8 30.2 30.5C30.5 30.2 31.6 28.9 31.9 28.4C32.2 27.9 32.6 28 33 28.2C33.4 28.3 36.3 29.7 36.8 30C37.3 30.2 37.6 30.4 37.7 30.6C37.9 31 37.9 32 37.5 33.1Z" fill="white"/>
      </svg>
    </a>
  );
};

export default WhatsAppButton;