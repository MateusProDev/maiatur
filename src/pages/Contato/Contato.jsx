import React, { useState, useEffect } from 'react';
import './Contato.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { FiMail, FiMapPin, FiClock, FiChevronDown, FiChevronUp, FiInfo, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Contato = () => {
  const [contactData, setContactData] = useState({
    email: '',
    whatsapp: '',
    endereco: ''
  });
  const [operatingHours, setOperatingHours] = useState([]);
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  });

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        // Buscar dados de contato
        const footerRef = doc(db, 'content', 'footer');
        const footerDoc = await getDoc(footerRef);
        
        if (footerDoc.exists()) {
          const data = footerDoc.data();
          setContactData({
            email: data.email || '',
            whatsapp: data.whatsapp || '',
            endereco: data.endereco || ''
          });
        }

        // Buscar horários de funcionamento (mesma estrutura do Footer)
        const hoursRef = doc(db, 'content', 'hours');
        const hoursDoc = await getDoc(hoursRef);
        
        if (hoursDoc.exists() && hoursDoc.data().hours?.length > 0) {
          setOperatingHours(hoursDoc.data().hours);
        }
      } catch (error) {
        console.error('Erro ao buscar dados de contato:', error);
      }
    };

    fetchContactData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.mensagem) {
      alert('Por favor, preencha pelo menos o nome e a mensagem.');
      return;
    }

    // Montar mensagem para WhatsApp
    const mensagemWhatsApp = encodeURIComponent(
      `*Nova solicitação de contato - Maiatur*\n\n` +
      `*Nome:* ${formData.nome}\n` +
      `*Email:* ${formData.email || 'Não informado'}\n` +
      `*Telefone:* ${formData.telefone || 'Não informado'}\n\n` +
      `*Mensagem:*\n${formData.mensagem}\n\n` +
      `_Mensagem enviada através do site maiatur.com_`
    );

    // Abrir WhatsApp com a mensagem
    const whatsappNumber = contactData.whatsapp.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${mensagemWhatsApp}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Limpar formulário
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      mensagem: ''
    });
  };
  return (
    <div className="contato-page">
      <Header />
      <main className="contato-main">
        <div className="contato-container">
          <Breadcrumb 
            currentPage="Contato"
          />
          
          <h1 className="contato-title">Entre em Contato</h1>
          <p className="contato-description">
            Estamos aqui para ajudar você a planejar sua próxima viagem. 
            Entre em contato conosco através de qualquer um dos canais abaixo.
          </p>
          
          <div className="contato-content">
            <div className="contato-info">
              {/* WhatsApp Card */}
              {contactData.whatsapp && (
                <div className="info-card whatsapp-card">
                  <FaWhatsapp className="info-icon whatsapp-icon" />
                  <h3>WhatsApp</h3>
                  <p>{contactData.whatsapp}</p>
                  <a 
                    href={`https://wa.me/55${contactData.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-link"
                  >
                    Enviar mensagem
                  </a>
                </div>
              )}
              
              {/* Email Card */}
              {contactData.email && (
                <div className="info-card">
                  <FiMail className="info-icon" />
                  <h3>E-mail</h3>
                  <p>{contactData.email}</p>
                  <a href={`mailto:${contactData.email}`} className="email-link">
                    Enviar e-mail
                  </a>
                </div>
              )}
              
              {/* Endereço Card (só mostra se existir) */}
              {contactData.endereco && (
                <div className="info-card">
                  <FiMapPin className="info-icon" />
                  <h3>Endereço</h3>
                  <p>{contactData.endereco}</p>
                </div>
              )}
              
              {/* Horários Card (Accordion) */}
              {operatingHours.length > 0 && (
                <div className="info-card hours-card">
                  <FiClock className="info-icon" />
                  <h3>Horário de Funcionamento</h3>
                  
                  <button 
                    className="hours-toggle"
                    onClick={() => setHoursExpanded(!hoursExpanded)}
                  >
                    <span>Ver horários</span>
                    {hoursExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  
                  <div className={`hours-content ${hoursExpanded ? 'expanded' : ''}`}>
                    {operatingHours.map((hour, index) => (
                      <div key={index} className="hour-item">
                        <strong>{hour.day}:</strong> {hour.time}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="contato-form">
              <div className="form-header">
                <h3>Envie uma Mensagem</h3>
                <div className="tooltip-container">
                  <FiInfo 
                    className="info-tooltip"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip(!showTooltip)}
                  />
                  {showTooltip && (
                    <div className="tooltip">
                      Ao enviar esta mensagem, você autoriza que entremos em contato 
                      via WhatsApp para responder sua solicitação.
                    </div>
                  )}
                </div>
              </div>
              
              <form onSubmit={handleWhatsAppSubmit}>
                <input 
                  type="text" 
                  name="nome"
                  placeholder="Seu nome *" 
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Seu e-mail" 
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <input 
                  type="tel" 
                  name="telefone"
                  placeholder="Seu telefone" 
                  value={formData.telefone}
                  onChange={handleInputChange}
                />
                <textarea 
                  name="mensagem"
                  placeholder="Sua mensagem *" 
                  rows="5"
                  value={formData.mensagem}
                  onChange={handleInputChange}
                  required
                ></textarea>
                <button type="submit" className="whatsapp-submit">
                  <FaWhatsapp className="button-icon" />
                  <FiSend className="send-icon" />
                  Enviar via WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contato;
