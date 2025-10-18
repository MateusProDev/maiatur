import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Banner.css";

const Banner = () => {
  const [bannerText, setBannerText] = useState("Bem-vindo ao nosso site!");
  const [bannerDescription, setBannerDescription] = useState("Encontre os melhores produtos aqui.");
  const [bannerImageUrl, setBannerImageUrl] = useState(""); // Imagem principal
  const [bannerBgUrl, setBannerBgUrl] = useState(""); // Imagem de fundo

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const bannerRef = doc(db, "content", "banner");
        const bannerDoc = await getDoc(bannerRef);

        if (bannerDoc.exists()) {
          const data = bannerDoc.data();
          setBannerText(data.text || "Bem-vindo ao nosso site!");
          setBannerDescription(data.description || "Encontre os melhores produtos aqui.");
          setBannerImageUrl(data.imageUrl || ""); // Imagem principal
          setBannerBgUrl(data.bgUrl || ""); // Imagem de fundo separada
        } else {
          console.log("Banner não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Firestore:", error);
      }
    };

    fetchBannerData();
  }, []);

  return (
    <section className="banner">
      {/* Imagem de fundo */}
      <div 
        className="banner-background" 
        style={{ backgroundImage: `url(${bannerBgUrl})` }}
      ></div>

      {/* Camada escura para dar contraste ao texto */}
      <div className="overlay"></div>

      {/* Imagem principal */}
      {bannerImageUrl && (
        <img src={bannerImageUrl} alt="Banner Principal" className="banner-image" />
      )}

      {/* Texto e descrição */}
      <div className="banner-content">
        <h1 className="banner-title">{bannerText}</h1>
        <p className="banner-description">{bannerDescription}</p>
      </div>
    </section>
  );
};

export default Banner;
