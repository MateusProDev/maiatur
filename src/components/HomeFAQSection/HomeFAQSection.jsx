import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import FAQSection from '../FAQSection/FAQSection';
import './HomeFAQSection.css';

const HomeFAQSection = () => {
  const [faqData, setFaqData] = useState({
    title: 'Perguntas Frequentes',
    subtitle: 'Encontre respostas para as dúvidas mais comuns',
    faq: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const faqRef = doc(db, 'content', 'homeFAQ');
    const unsubscribe = onSnapshot(faqRef, (docSnap) => {
      if (docSnap.exists()) {
        setFaqData(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar dados do FAQ:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || !faqData.faq || faqData.faq.length === 0) {
    return null;
  }

  return (
    <section className="home-faq-section">
      <div className="home-faq-container">
        <div className="home-faq-header">
          <h2 className="home-faq-title">{faqData.title}</h2>
          {faqData.subtitle && (
            <p className="home-faq-subtitle">{faqData.subtitle}</p>
          )}
        </div>
        <FAQSection faq={faqData.faq} showTitle={false} />
      </div>
    </section>
  );
};

export default HomeFAQSection;
