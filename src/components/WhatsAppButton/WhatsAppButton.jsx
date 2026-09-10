import React, { useState, useEffect } from "react";
import "./WhatsAppButton.css";
import { db } from "../../firebase/firebase"; // Importe sua configuração do Firebase
import { doc, getDoc } from "firebase/firestore";

const WhatsAppButton = () => {
  const fallbackPhoneNumber = process.env.REACT_APP_AGENCY_PHONE_WHATS || "5511999999999";
  const [phoneNumber, setPhoneNumber] = useState(fallbackPhoneNumber);

  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        const docRef = doc(db, "settings", "whatsapp"); // Acessa o documento 'whatsapp' na coleção 'settings'
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPhoneNumber(docSnap.data().number || fallbackPhoneNumber);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchWhatsAppNumber();
  }, []);

  const message = "Olá, gostaria de saber mais sobre os pacotes de turismo da Transfer Fortaleza Tur.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="whatsapp-button pulsante" aria-label="Fale conosco no WhatsApp">
      <img src="/whatsappbtn.png" alt="WhatsApp" width="48" height="48" />
    </a>
  );
};

export default WhatsAppButton;