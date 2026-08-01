import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import './FAQSection.css';

/**
 * Componente FAQSection
 * Exibe perguntas e respostas em formato accordion
 * Suporta Schema Markup para FAQPage (rich snippets)
 */
const FAQSection = ({ faq = [] }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleFAQ(index);
    }
  };

  if (!faq || faq.length === 0) {
    return null;
  }

  return (
    <>
      {/* Schema Markup para FAQPage */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faq.map(item => ({
            "@type": "Question",
            "name": item.pergunta,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": item.resposta
            }
          }))
        })}
      </script>

      <div className="faq-section">
        <h2 className="faq-section-title">Perguntas Frequentes</h2>
        <div className="faq-list">
          {faq.map((item, index) => (
            <div key={index} className="faq-item">
              <button
                className={`faq-question ${openIndex === index ? 'open' : ''}`}
                onClick={() => toggleFAQ(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="faq-question-text">{item.pergunta}</span>
                <FiChevronDown className={`faq-chevron ${openIndex === index ? 'open' : ''}`} />
              </button>
              <div
                id={`faq-answer-${index}`}
                className={`faq-answer ${openIndex === index ? 'open' : ''}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
              >
                <p className="faq-answer-text">{item.resposta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FAQSection;
