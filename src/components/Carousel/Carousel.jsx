import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Carousel.css";

const Carousel = () => {
  const [carouselData, setCarouselData] = useState({
    sectionTitle: "",
    images: [],
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        const carouselRef = doc(db, "content", "carousel");
        const carouselDoc = await getDoc(carouselRef);

        if (carouselDoc.exists()) {
          setCarouselData(carouselDoc.data());
        } else {
          console.log("Carrossel não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Firestore:", error);
      }
    };

    fetchCarouselData();
  }, []);

  useEffect(() => {
    if (carouselData.images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselData.images.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [carouselData.images]);

  const nextSlide = () => {
    clearInterval(intervalRef.current);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselData.images.length);
  };

  const prevSlide = () => {
    clearInterval(intervalRef.current);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselData.images.length) % carouselData.images.length);
  };

  const goToSlide = (index) => {
    clearInterval(intervalRef.current);
    setCurrentIndex(index);
  };

  if (!carouselData.images.length) {
    return null;
  }

  return (
    <div className="carousel-section">
      {carouselData.sectionTitle && (
        <h2 className="section-title">{carouselData.sectionTitle}</h2>
      )}
      <div className="carousel">
        {/* Navigation Buttons */}
        {carouselData.images.length > 1 && (
          <>
            <button className="carousel-nav-btn prev-btn" onClick={prevSlide} aria-label="Anterior">
              ‹
            </button>
            <button className="carousel-nav-btn next-btn" onClick={nextSlide} aria-label="Próximo">
              ›
            </button>
          </>
        )}
        
        {carouselData.images.map((image, index) => (
          <div
            key={index}
            className={`carousel-item ${index === currentIndex ? "active" : ""}`}
          >
            <img src={image.url} alt={`Carrossel ${index}`} className="carousel-image" />
            {image.title && <p className="image-title">{image.title}</p>}
          </div>
        ))}
      </div>
      
      {/* Indicators */}
      {carouselData.images.length > 1 && (
        <div className="carousel-indicators">
          {carouselData.images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;