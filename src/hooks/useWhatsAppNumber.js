import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const useWhatsAppNumber = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        const docRef = doc(db, "settings", "whatsapp");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPhoneNumber(docSnap.data().number || "");
        } else {
          // Fallback para um número padrão se não encontrar no Firebase
          setPhoneNumber("5511999999999");
        }
      } catch (err) {
        console.error("Erro ao carregar número do WhatsApp:", err);
        // Fallback para um número padrão em caso de erro
        setPhoneNumber("5511999999999");
      } finally {
        setLoading(false);
      }
    };

    fetchWhatsAppNumber();
  }, []);

  return { phoneNumber, loading, error };
};
