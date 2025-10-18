import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./AboutCarousel.css";

const AboutCarousel = () => {
  const [carouselData, setCarouselData] = useState({
    images: []
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "content", "about");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCarouselData({
            images: data.aboutCarousel?.images || []
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (carouselData.images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % carouselData.images.length);
      }, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [carouselData.images]);

  return (
    <div className="about-carousel-section">
      <h2 className="about-section-title">Nossos Momentos</h2> {/* Título do carrossel */}
      <div className="about-carousel">
        {carouselData.images.map((image, index) => (
          <div
            key={index}
            className={`about-carousel-item ${index === currentIndex ? "active" : ""}`}
          >
            <img src={image.url} alt={image.title} className="about-carousel-image" />
            {image.title && <p className="about-image-title">{image.title}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutCarousel;