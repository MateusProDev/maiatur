import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./About.css";

const About = () => {
  const [data, setData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const aboutRef = doc(db, "content", "about");
        const aboutDoc = await getDoc(aboutRef);
        if (aboutDoc.exists()) {
          const docData = aboutDoc.data();
          setData({
            title: docData.title || "Sobre Nós",
            description: docData.description || ""
          });
        } else {
          setData({ title: "Sobre Nós", description: "Conteúdo não disponível." });
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setData({ title: "Sobre Nós", description: "Erro ao carregar informações." });
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <section className="about">
      <h2>{data.title}</h2>
      <p className="description">{data.description}</p>
    </section>
  );
};

export default About;
